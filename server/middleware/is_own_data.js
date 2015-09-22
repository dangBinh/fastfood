var config          = require('../config'),
    Logger          = require('../libraries/logger'),
    async           = require('async'),
    restify         = require('restify'),
    NotFound        = restify.ResourceNotFoundError,
    NotAuthorized   = restify.NotAuthorizedError,
    RequestHandlers = require('./is_own_data/request_handlers'),
    RouteKeyMap     = require('../config/permissions/route_key_map'),
    mongoose        = require('mongoose');

/**
 * Compare Doc With Session
 * Compares the fetched document with
 * the session.
 * @param {Object} modelName
 * @param {Object} docs
 * @param {Object} session
 * @param {Function} callback
 */
function compareDocWithSession (modelName, docs, session, callback) {
  var errMsg, successMsg;

  // Logger.info('IODMid - Comparing doc with session...');

  async.each(
    docs,
    function (doc, done) {
      return compareDocsWithSessionLoop(modelName, doc, session, function (err, result) {
        // If there's an error, return it
        // and finish async each
        if (err) {
          done(true);
          return callback(err);
        }

        // If a document doesn't belong to us,
        // finish async each and return false
        if (!result) {
          Logger.info('IODMid - ' + modelName + ' document does not belong to us: ', doc._id);
          done(true);
          return callback(null, false);
        }

        // Otherwise continue
        done(null);
      });
    },
    function (err) {
      if (!err) {
        // Logger.info('IODMid - Current session allowed CRUD operations on document(s)');
        return callback(null, true);
      }
    }
  );
}

  function compareDocsWithSessionLoop (modelName, doc, session, callback) {
    var result;
    // We don't need to compare agency documents
    if (modelName === 'Agency') {
      result = (['superadmin'].indexOf(session.user.type) !== -1);
      if (!result) {
        result = (session.user.agency._id+"" === doc._id+"");
      }
      return callback(null, result);
    }

    if (!doc.agency) {
      errMsg = new Error('Agency not found on document');
      Logger.info('IODMid - ' + errMsg.message);
      return callback(errMsg);
    }

    // Check to see if document is owned
    // by the users agency
    if (
        ['superadmin'].indexOf(session.user.type) === -1 &&
        doc.agency !== (session.user.agency._id + "")
      ) {
      Logger.info('IODMid - Document not tied to users agency...');
      return callback(null, false);
    }

    // We don't need to compare account documents
    if (modelName === 'Account') {
      result = (['superadmin', 'agencyadmin', 'agencyuser'].indexOf(session.user.type) !== -1);
      if (!result) {
        result = (session.user.account._id+"" === doc._id+"");
      }
      return callback(null, result);
    }

    if (!doc.account) {
      errMsg = new Error('Account not found on document');
      Logger.info('IODMid - ' + errMsg.message);
      return callback(errMsg);
    }

    // Check to see if document is owned
    // by the users account
    if (
        ['superadmin', 'agencyadmin', 'agencyuser'].indexOf(session.user.type) === -1 &&
        doc.account !== (session.user.account._id + "")
      ) {
      Logger.info('IODMid - Document not tied to users account...');
      return callback(null, false);
    }

    // Both checks passed, it's their document
    return callback(null, true);
  }

/**
 * Check Allowed Operations
 * Checks to see if the user has the correct
 * override permissions.
 * @param  {Object}   req
 * @param  {String}   segment
 * @param  {Object}   modelName
 * @param  {Object}   doc
 * @param  {Function} callback
 */
function checkAllowedOperations (req, segment, modelName, doc, callback) {
  var key, accountId;
  // Logger.info('IODMid - Checking allowed operations...');

  if (modelName === 'Agency') {
    err = new Error('Model is an agency, we cannot override agency operations.');
    Logger.info('IODMid - ' + err.message);
    return callback(null, false);
  }
  if (!req.session.user || !req.session.user.allowedOperations) {
    err = new Error('User does not have any override operations.');
    Logger.info('IODMid - ' + err.message);
    return callback(null, false);
  }
  if (!req.session.user.allowedOperations[segment]) {
    err = new Error('Could not find segment "' + segment + '" in allowed operations.');
    Logger.info('IODMid - ' + err.message);
    return callback(null, false);
  }

  // Determine account
  accountId = (modelName === 'Account') ? (doc._id+"") : (doc.account+"");

  if (!req.session.user.allowedOperations[segment][accountId]) {
    err = new Error('Could not find account "' + accountId + '" in allowed operations.');
    Logger.info('IODMid - ' + err.message);
    return callback(null, false);
  }

  // Determine key from method
  switch (req.method.toLowerCase()) {
    case "post": key = 'create'; break;
    case "get": key = 'read'; break;
    case "put": key = 'update'; break;
    case "delete": key = 'delete'; break;
  }

  // Check to see if we're not using a standard CRUD route
  if (['/' + segment, '/' + segment + '/:id'].indexOf(req.route.path) === -1) {
    // Logger.info('IODMid - Not a standard CRUD route, checking custom routes...');

    if (!RouteKeyMap[segment]) {
      err = new Error('Could not find segment "' + segment + '" in route key map.');
      Logger.info('IODMid - ' + err.message);
      return callback(null, false);
    }
    if (!RouteKeyMap[segment][req.route.path]) {
      err = new Error('Could not find route  "' + req.route.path + '" in route key map.');
      Logger.info('IODMid - ' + err.message);
      return callback(null, false);
    }
    if (!RouteKeyMap[segment][req.route.path][key]) {
      err = new Error('Could not find method  "' + key + '" in route key map.');
      Logger.info('IODMid - ' + err.message);
      return callback(null, false);
    }

    // Store key from route key map
    key = RouteKeyMap[segment][req.route.path][key];
  }

  // Ensure the key exists in the allowed operations
  if (typeof req.session.user.allowedOperations[segment][accountId][key] === "undefined") {
    err = new Error('Could not find key  "' + key + '" in allowed operations.');
    Logger.info('IODMid - ' + err.message);
    return callback(null, false);
  }

  // Return override permissions
  // Logger.info('IODMid - Allowed Operations: ', req.session.user.allowedOperations[segment][accountId][key]);
  return callback(null, req.session.user.allowedOperations[segment][accountId][key]);
}

/**
 * Fetch Accounts Under Organisation
 * This queries the accounts which are
 * under the session organisation.
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} callback
 */
function fetchAccountsUnderOrganisation (req, res, callback) {
  if (['organadmin', 'organuser'].indexOf(req.session.user.type) === -1) {
    Logger.info('IOMid - Ignoring fetching accounts, not an organisation user.');
    return callback(null, []);
  }

  var accountObj = (req.session.user.account.organisation) ? req.session.user.account.organisation : req.session.user.account;

  var query = {
    organisation: (accountObj._id+""),
    agency: (req.session.user.agency._id+""),
    isOrganisation: { $ne: true },
    deleted: { $ne: true }
  };

  // Logger.info('IODMid - Querying accounts under organisation: ', query);

  mongoose.model('Account')
    .find(query)
    .exec(function (err, docs) {
      var accountIds = [];
      if (err) return callback(err);

      // Add account tied to user
      accountIds.push(req.session.user.account._id+"");

      if (!docs || !docs.length) {
        Logger.info('IODMid - Could not find any accounts under organisation: ', (req.session.user.account._id+""));
        return callback(null, accountIds);
      }

      // Pick out account ids from objects
      for (var i = 0, l = docs.length; i<l; i+=1) {
        accountIds.push(docs[i]._id+"");
      }

      // Logger.info('IODMid - Accounts under organisation: ', accountIds);
      return callback(null, accountIds);
    });
}

  /**
   * Check Org Account
   * Checks against an organisation accounts array,
   * to see whether we have access to the requested account.
   * @param  {Object}   req
   * @param  {Object}   res
   * @param  {Array}   accounts
   * @param {String} ModelName
   * @param  {Function} callback
   */
  function checkOrgAccounts (req, res, accounts, ModelName, callback) {
    if (['organadmin', 'organuser'].indexOf(req.session.user.type) === -1) {
      // Logger.info('IOMid - Ignoring checking org accounts, not an organisation user.');
      return callback(null);
    }

    // Fetch the account id
    var accountId = '', type = '';
    if (ModelName === 'Account' && req.params.id) {
      accountId = req.params.id;
      type = 'AccountParam';
    }
    else if (ModelName === 'Account' && res.query.conditions._id) {
      accountId = res.query.conditions._id;
      type = 'AccountQuery';
    }
    else if (req.body.account) {
      accountId = req.body.account;
      type = 'OtherBody';
    }
    else if (res.query.conditions.account) {
      accountId = res.query.conditions.account;
      type = 'OtherQuery';
    }

    // Throw them out if they don't have
    // access to the account
    if (accountId && accounts.indexOf(accountId) === -1) {
      var err = new NotAuthorized("Org user does not have access to account: " + accountId + ' type: ' + type);
      return callback(err);
    } else {
      // Logger.info('IODMid - Org user has access to account: ', accountId, 'type: ', type);
    }

    return callback(null);
  }

/**
 * Fetch Documents
 * Fetches the requested documents.
 * @param  {Object}   req
 * @param {Object} res
 * @param {Object} Model
 * @param {String} modelName
 * @param  {Function} callback
 */
function fetchDocuments (req, res, Model, modelName, callback) {
  var query = {};
  // Logger.info('IOMid - Fetching documents...');

  // Single document
  if (req.params.id) {
    query._id = req.params.id;
  }

  // Batch document(s)
  else if (req.body.ids) {
    if (Object.prototype.toString.call(req.body.ids) !== '[object Array]') {
      req.body.ids = [req.body.ids];
    }
    query._id = { $in: req.body.ids };
  }

  // Query-based document(s)
  else {
    return callback(null, []);
  }

  // Assign the agency
  if (
      ['superadmin'].indexOf(req.session.user.type) === -1 &&
      ['Agency'].indexOf(modelName) === -1
    ) {
    query.agency = (req.session.user.agency._id+"");
  }

  // Assign the account(s)
  return fetchAccountsUnderOrganisation(req, res, function (err, accounts) {
    if (err) return callback(err);

    if (
        ['superadmin', 'agencyadmin', 'agencyuser'].indexOf(req.session.user.type) === -1 &&
        ['Agency', 'Account'].indexOf(modelName) === -1
      ) {
      var accountVal = (accounts.length) ? { $in: accounts } : (req.session.user.account._id+"");
      if (modelName === 'Media') query['details.account'] = accountVal;
      else query.account = accountVal;
    }

    // Fetch the document
    return Model.find(query, function (err, docs) {
      var errMsg;
      if (err) return callback(err);
      if (!docs || !docs.length) {
        errMsg = new NotFound('No document(s) found');
        Logger.error(errMsg.message + '.. on query: ', query, '... model: ', modelName);
        return callback(errMsg);
      }
      if (req.body.ids && (req.body.ids.length !== docs.length)) {
        errMsg = 'You do not have permissions to perform batch operations on the document(s).';
        return callback(new NotAuthorized(errMsg));
      }

      return callback(null, docs);
    });
  });
}

/**
 * Fetch Model
 * Fetches the model from the path.
 * @param  {String} path
 * @param {Function} callback
 */
function fetchModel (path, callback) {
  var segments, err;
  // Logger.info('IODMid - Fetching model...');
  if (!path || path.indexOf('/') === -1) {
    err = new Error('URL does not contain a forward slash');
    Logger.info('IODMid - ' + err.message);
    return callback(err);
  }
  segments = path;
  if (path.indexOf('?') !== -1) segments = segments.split('?')[0];
  segments = segments.split('/');
  segments.shift();
  if (!segments[0]) {
    err = new Error('URL does not contain a route segment');
    Logger.info('IODMid - ' + err.message);
    return callback(err);
  }

  var model;
  switch (segments[0]) {
    case "accounts":  model = 'Account'; break;
    case "agencies":  model = 'Agency'; break;
    case "apps":      model = 'App'; break;
    case "campaigns": model = 'Campaign'; break;
    case "events":    model = 'Event'; break;
    case "forms":     model = 'Form'; break;
    case "layouts":   model = 'Layout'; break;
    case "leads":     model = 'Lead'; break;
    case "media":     model = 'Media'; break;
    case "themes":    model = 'Theme'; break;
    case "users":     model = 'User'; break;
    case "capture":   model = 'Capture'; break;
  }

  // If we cannot find a model, just return.
  if (!model || !mongoose.models.hasOwnProperty(model)) {
    return callback(null, null);
  }
  
  return callback(null, {
    model: mongoose.model(model),
    modelName: model,
    segment: segments[0]
  });
}

/**
 * Is Organisation Admin
 * Checks to see whether the user
 * is an organisation admin.
 * @return {Boolean}
 */
function isOrganisationAdmin (session) {
  // Logger.info('IODMid - Checking if user is an organisation admin...');
  return (session.user.type === 'organadmin') ? true : false;
}

/**
 * Is Own Data Middleware
 * Checks if the person making the request either owns the
 * requested data or is allowed to override.
 * @param {Object} req
 * @param {Object} res
 * @param {Function} nextMidw
 */
function isOwnData (req, res, nextMidw) {
  var requestMethod, supportedMethods,
      errorMsg, successMsg,
      fetchedDocs, segment,
      handleRequest, _this, ModelName;

  // Determine request method and compile a list of
  requestMethod     = req.method.toLowerCase();
  supportedMethods  = ['get', 'post', 'put', 'delete'];
  handleRequest     = RequestHandlers[requestMethod];
  _this             = this;

  // Setup defaults
  fetchedDocs                 = [{}];
  req.body                    = req.body || {};
  req.params                  = req.params || {};
  res.query                   = res.query || {};
  res.query.parsedConditions  = res.query.parsedConditions || {};
  res.query.conditions        = res.query.conditions || {};

  // Ignore checking requests which don't
  // have a session
  if (!req.session || !req.session.user) {
    successMsg = 'Skipping as we are a guest...';
    // Logger.info('IODMid - ' + successMsg);
    return next(null, successMsg);
  }

  // We don't need to check request methods other
  // than those which are used for CRUD operations.
  if (supportedMethods.indexOf(requestMethod) === -1) {
    successMsg = "Ignoring " + requestMethod + " requests";
    Logger.info('IODMid - ' + successMsg);
    return next(null, successMsg);
  }

  /**
   * Next
   * Wrapper for next middleware callback.
   * @return {Function}
   */
  function next (err) {
    var nextArgs = arguments;
    if (err) {
      Logger.error(err);
      return nextMidw(err);
    }

    // If the session is not present continue to next middleware.
    if (!req.session || !req.session.user) {
      // Logger.info('IODMid - User has no session: ', req.session);
      return nextMidw.apply(_this, nextArgs);
    }

    // If the request doesn't have a handler continue to next middleware.
    if (typeof handleRequest !== "function") {
      Logger.info('IODMid - Request method does not have handler: ', requestMethod);
      return nextMidw.apply(_this, nextArgs);
    }

    // Ensure model name is set
    if (!ModelName) {
      Logger.info('IODMid - Model name has not been set.');
      return nextMidw(null);
    }

    // Fetch accounts
    return fetchAccountsUnderOrganisation(req, res, function (err, accounts) {
      if (err) return nextMidw(err);

      // If there is only one document, unwrap it
      // from the array so the handle methods can use it
      fetchedDocs = (fetchedDocs.length <= 1) ? fetchedDocs[0] || {} : fetchedDocs;

      // Check to see whether the organisation user
      // has access to this account
      return checkOrgAccounts(req, res, accounts, ModelName, function (err) {
        if (err) {
          Logger.error('IODMid - ' + err.message);
          return nextMidw(err);
        }

        // Handle the request
        return handleRequest(req, res, fetchedDocs, ModelName, accounts, function (err) {
          if (err) return nextMidw(err);
          return nextMidw.apply(_this, nextArgs);
        });
      });
    });
  }

  // Fetch the model
  return fetchModel(req.url, function (err, opts) {
    if (err) return next(err);
    if (!opts) return next(null);

    var Model = opts.model, name = opts.modelName, segment = opts.segment;
    if (!Model || !name) {
      errMsg = new NotFound("Model was not found");
      Logger.info('IODMid - ' + errMsg);
      return next(errMsg);
    }

    // Store the model name
    ModelName = name;

    // We can skip the ownership checks, as
    // post is used for creating documents.
    if (requestMethod === 'post') {
      return next(null);
    }

    // No need to check requests which aren't
    // specifically targeting an ID
    if (!req.params.id && !req.body.ids) {
      successMsg = "Ignoring, no id passed";
      Logger.info('IODMid - ' + successMsg);
      return next(null, successMsg);
    }

    // Fetch the document
    return fetchDocuments(req, res, Model, ModelName, function (err, docs) {
      if (err) return next(err);

      // Store the fetched doc
      fetchedDocs = docs;

      // Check to see if the user owns this document
      return compareDocWithSession(ModelName, fetchedDocs, req.session, function (err, matches) {
        if (err) return next(err);

        // If user owns document, allow them through
        if (matches) return next(null);

        // If we aren't the parent, check to see if the user
        // has the correct override permissions
        return checkAllowedOperations(req, segment, ModelName, fetchedDocs, function (err, override) {
          if (err) return next(err);

          // If we have override permissions, continue
          if (
              override ||
              ['organadmin', 'organuser'].indexOf(req.session.user.type) !== -1
            ) {
            return next(null);
          }

          // Otherwise throw them out
          return next(new Error('You do not have the permissions to access this document.'));
        });
      });
    });
  });
}

module.exports._middleware = isOwnData;
