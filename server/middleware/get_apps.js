var mongoose = require('mongoose'),
    App      = mongoose.model('App'),
    Account  = mongoose.model('Account'),
    config   = require('../config'),
    Logger   = require('../libraries/logger'),
    _        = require('lodash');

/**
 *  Returns an app 
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _getInFacebook (req, res, next) {
  // Logger.info('Getting app by facebook id');
  var query = {
    appPoolId        : req.params.appId,
    'publishedTo.id' : req.params.pageId,
    type             : req.params.type,
    publishedStatus  : true,
    deleted          : false
  };
  App.findOne(query, function (err, app) {
    if (err || !app) {
      return next(err || new Error('No app found'));  
    }
    res.locals.app = (app._doc) ? app._doc : app.toJSON();
    return next();  
  });
}

/**
 *  Returns an app 
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _getByAccountSlug (req, res, next) {
  // Logger.info('Getting app by account & slug');
  var accQuery = {
    slug: req.params.account, 
    deleted: { $ne: true }
  };
  Account.findOne(accQuery).populate('agency').exec(function (err, account) {
    if (err || !account) {
      return next(err || new Error('No account found'));
    }

    var appQuery = { 
      deleted: { $ne: true }, 
      slug: req.params.slug, 
      account: account._id 
    };

    if (res.query.conditions.preview !== "true") {
      appQuery.publishedStatus = true;
    }    

    res.locals.account = account;

    App.findOne(appQuery, function (err, app) {
      if (err || !app) return next(err || new Error('No app found'));
      res.locals.app = (app._doc) ? app._doc : app.toJSON();
      return next(null);
    });
  });
}

/**
 *  Returns the app data for the editor
 *  @param {Object} req
 *  @param {Object} res
 */
function _getEditorData (req, res, next) {
  // Logger.info('Getting editor data');
  var accQuery = {
    slug: req.params.account, 
    deleted: { $ne: true }
  };
  Account.findOne(accQuery).populate('agency').exec(function (err, account) {
    if (err || !account) {
      return next(err || new Error('No app found'));
    }
    var appQuery = { 
      deleted: { $ne: true }, 
      slug: req.params.slug, 
      account: account._id 
    };
    res.locals.account = account;
    App.findOne(appQuery, function (err, app) {
      res.locals.app = (app._doc) ? app._doc : app.toJSON();
      return next(err);
    });
  });
}

/**
 *  Returns an app 
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _getRedirect (req, res, next) {
  // Logger.info('Getting app by redirect');
  var query = {
    deleted: false,
    _id: req.params.bigtopAppId,
    'publishedTo.id' : req.params.facebookPageId,
    publishedStatus: true
  };
  App.findOne(query, function (err, app) {
    if (err || !app) {
      return next(err || new Error("No app found"));
    }
    res.locals.app = (app._doc) ? app._doc : app.toJSON();
    return next();
  });
}

/**
 *  Returns an app 
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _getBySlug (req, res, next) {
  // Logger.info('Getting app by slug');
  var query = {
    publishedStatus: true,
    deleted: { $ne: true },
    customSlug: req.params.customSlug
  };
  App.findOne(query, function (err, app) {
    res.locals.app = (app._doc) ? app._doc : app.toJSON();
    return next(err);
  });
}

/**
 *  Returns the tracking codes for an app
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _getTrackingCodes (req, res, next) {
  // Logger.info('Getting app tracking code');
  if (typeof res.locals.app !== 'object') {
    var err = new Error('Could could not be found in locals');
    Logger.error(err);
    return next(err);
  }

  if (typeof res.locals.account !== 'undefined') {
    // Logger.info('Skipping account data');
    return _correctTracking(res, function (err) {
      return next(err);
    });
  }

  // Logger.info('Getting account data');
  return Account
    .findOne({ _id: res.locals.app.account })
    .populate('agency')
    .exec(function (err, account) {
      if (err || !account) return next(err || new Error('No account found'));
      res.locals.account = account;
      _correctTracking(res, function (err) {
        return next(err);
      });
    });
}

/**
 *  Returns the ip exclusions for an app
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _ipExclusions (req, res, next) {
  // Logger.info('Getting app ip exclusions');
  if (res.locals.app && res.locals.account) {
    var agency = res.locals.account.agency;
    // Use the agency ip exclusion unless there was no doc found, then we just use
    // a new array (since doc is null if not found or error this is an easy check)
    var agencyExclusions = (agency ? agency.settings.ipExclusions : []);
    // This will merge the arrays and remove any non unique values and set
    // them back against the application
    res.locals.app.leadsConfig.ipExclusions = _.union(
      res.locals.account.settings.ipExclusions, 
      res.locals.app.leadsConfig.ipExclusions,
      agencyExclusions
    );
  }
  return next();
}

/**
 *  Returns the privacy data for an app
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function _privacy (req, res, next) {
  // Logger.info('Getting app privacy policy');
  // Set the privacy policy link, this will need a lot of updating to make this work with the
  // account and agency policy links.
  if (res.locals.app) {

    // console.log(res.locals.app.privacyPolicy);

    if (res.locals.app.privacyPolicy && res.locals.app.privacyPolicy.type !== 'default' && res.locals.app.privacyPolicy.customLink !== "") {
      res.locals.app.privacyPolicy.link = res.locals.app.privacyPolicy.customLink;
    } 

    else {
      if (res.locals.account) {
        if (res.locals.account.settings && res.locals.account.settings.privacyPolicy) {  
          res.locals.app.privacyPolicy.link = res.locals.account.settings.privacyPolicy;
        } 

        else {
          res.locals.app.privacyPolicy.link = "http://docs.bigtopapp.com/policy/";  
        }
      } 

      else {
        res.locals.app.privacyPolicy.link = "http://docs.bigtopapp.com/policy/";
      }
    }
  }

  res.locals.app.privacyPolicy.accountName = res.locals.account.name;
  res.locals.app.privacyPolicy.agencyName  = res.locals.account.agency.name;
  return next();
}

/**
 *  Corrects the app tracking object 
 *  @param {Object} res
 *  @param {Function} next
 */
function _correctTracking (res, next) {
  // Logger.info('Correcting app tracking');
  // Add Google Tag Manager to providers array
  if (
      res.locals.app.trackingConfig.providers instanceof Array && 
      res.locals.app.trackingConfig.googleTagManager
    ) {
    res.locals.app.trackingConfig.providers.push({
      values: [res.locals.app.trackingConfig.googleTagManager],
      type: 'googletagmanager'
    });
    delete res.locals.app.trackingConfig.googleTagManager;
  }

  // Updates the tracking providers with the account/app data and makes sure
  // they tie up as property names are a little different
  res.locals.app.trackingConfig.providers = _parseTrackingConfig(
    res.locals.app.trackingConfig.providers,
    res.locals.account.settings.analytics,
    'providers'
  );

  res.locals.app.trackingConfig.remarketingProviders = _parseTrackingConfig(
    res.locals.app.trackingConfig.remarketingProviders,
    null
  );

  // Parses the inside facebook conversion actions
  res.locals.app.trackingConfig.conversionActions.insideFacebook.conversionPage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.insideFacebook.conversionPage
  );

  res.locals.app.trackingConfig.conversionActions.insideFacebook.conversionMessage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.insideFacebook.conversionMessage
  );

  // Parses the microsite conversion actions
  res.locals.app.trackingConfig.conversionActions.microsite.conversionPage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.microsite.conversionPage
  );
  
  res.locals.app.trackingConfig.conversionActions.microsite.conversionMessage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.microsite.conversionMessage
  );

  // Parses the externally embedded conversion actions
  res.locals.app.trackingConfig.conversionActions.externallyEmbedded.conversionPage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.externallyEmbedded.conversionPage
  );
  
  res.locals.app.trackingConfig.conversionActions.externallyEmbedded.conversionMessage = _parseTrackingConfig(
    null, 
    res.locals.app.trackingConfig.conversionActions.externallyEmbedded.conversionMessage
  );

  // Logger.info('Finished app tracking');
  return next();
}

/**
 * Parse Tracking Config
 * Parses the array of analytic providers into an object.
 * @param appProviders
 * @param accountProviders
 * @returns {*}
 */
function _parseTrackingConfig (appProviders, accountProviders, debugTitle) {
  try {
    var key, i, j;
    accountProviders = accountProviders || {};
  
    var debugMde = false;
    // if (debugTitle === 'providers') debugMde = true;
    
    if (accountProviders instanceof Array) {
      // if (debugMde) console.log('Parsing account providers into an object...');
      // if (debugMde) console.log('before: ', accountProviders);
      var newAccountProviders = {};
      j = accountProviders.length;
      for (i = 0; i<j; i+=1) {
        key = accountProviders[i].type.replace(/\s+/g, '').toLowerCase();
        newAccountProviders[key] = accountProviders[i].values || [accountProviders[i].uuid];
      }
      accountProviders = newAccountProviders;
      // if (debugMde) console.log('after: ', accountProviders);
    }
  
    else if (accountProviders) {
      // if (debugMde) console.log('Cleaning account providers object');
      
      // Needed to deep clone the object, otherwise it
      // wouldn't allow us to write to it for some reason??
      // BS, 24/11/2014
      // if (debugMde) console.log('before obj: ', accountProviders);
      accountProviders = _.clone(accountProviders, true);
      // if (debugMde) console.log('after obj: ', accountProviders);
  
      // Strip out 'Uid' from the keys
      for (key in accountProviders) {
        if (
            accountProviders.hasOwnProperty(key) &&
            ['function', 'undefined'].indexOf(typeof accountProviders[key]) === -1
          ) {
          // if (debugMde) console.log('before: ', key, accountProviders[key]);
  
          // Make sure the analytic has been set in the current property
          if (accountProviders[key] !== '') {
            var searchTerm = 'Uid',
              index = key.indexOf(searchTerm);
  
            // Remove 'Uid' from the key
            var newKey = key;
            if (index !== -1) newKey = newKey.substr(0, index);
            newKey = newKey.toLowerCase();
  
            // Last resort
            switch (newKey) {
              case "googleanalytics": newKey = "google"; break;
            }
  
            // Store the analytic against the new key
            if (typeof accountProviders[newKey] === "undefined") {
              // if (debugMde) console.log('storing: ' + accountProviders[key] + ' in "' + newKey + '"');
              accountProviders[newKey] = accountProviders[key];
            } else {
              // if (debugMde) console.log('key "' + newKey + '" already defined, cannot store value: ', accountProviders[key]);
            }
            // if (debugMde) console.log('after: ', newKey, accountProviders[newKey]);
          } else {
            // if (debugMde) console.log('Ignoring the clean for key: ', key);
          }
  
          // Remove the old key
          delete accountProviders[key];
        }
      }
    }
  
    if (appProviders && appProviders instanceof Array) {
      // if (debugMde) console.log('Merging app providers into account providers: ', accountProviders);
      for (i = 0, l = appProviders.length; i<l; i+=1) {
        // Convert the property to lower case and remove spaces
        var property = appProviders[i].type.toLowerCase().replace(/ /g,'');
        // if (debugMde) console.log('property:', property);
        accountProviders[property] = (appProviders[i].values || [(appProviders[i].value || appProviders[i].uuid)]);
        // if (debugMde) console.log('value:', accountProviders[property]);
      }
    }
  } catch (e) {
    console.log('error: ', e);
    return accountProviders;
  }

  return accountProviders;
}

var AppsMiddle = module.exports = {
  getInFacebook: _getInFacebook,
  getByAccountSlug: _getByAccountSlug,
  getEditorData: _getEditorData,
  getRedirect: _getRedirect,
  getBySlug: _getBySlug,
  getTrackingCodes: _getTrackingCodes,
  ipExclusions: _ipExclusions,
  privacy: _privacy
};

