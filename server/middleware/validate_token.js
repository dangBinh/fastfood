var jwt       = require('jwt-simple'),
    restify   = require('restify'),
    Orders    = require('../../models/orders'),
    User      = require('../../models/user'),
    config    = require('../config/environment'),
    Logger    = require('../libraries/logger');

var ErrorMessages = {
  invalidToken: new restify.InvalidCredentialsError('Invalid access token'),
  notActive: new restify.NotAuthorizedError('User is no longer active'),
  notActiveAccount: new restify.NotAuthorizedError('Account is no longer active'),
  notActiveAgency: new restify.NotAuthorizedError('Agency is no longer active'),
};

/**
 *  Validates the clients accessToken to ensure that they have
 *  correctly authenticated to make further requests.
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */

function validateToken (req, res, next) {
  var self = this;
  var data, token;

  // Setup the session object
  req.session = req.session || {};

  // If no token has been supplied, continue through to
  // allow guests to perform actions.
  if (!req.headers['x-auth-token'] && !req.query.access_token) {
    // Logger.info('VTMid - no access token found, assuming guest.');
    return next();
  }

  token = req.headers['x-auth-token'] || req.query.access_token;

  // Try to decode the token.
  // If there was an issue decoding the
  // token, throw the user out.
  try {
    data = jwt.decode(token, config.secret);
  } catch (e) {
    Logger.info('VTMid - could not decode token: ', e);
    return next(ErrorMessages.invalidToken);
  }

  // Check for an invalid token
  if (!data.time) {
    Logger.info('VTMid - time is invalid');
    return next(ErrorMessages.invalidToken);
  }
  if (!data.user) {
    Logger.info('VTMid - could not find user');
    return next(ErrorMessages.invalidToken);
  }
  if (typeof data.user.account === "undefined") {
    Logger.info('VTMid - could not find account');
    return next(ErrorMessages.invalidToken);
  }
  if (typeof data.user.agency === "undefined") {
    Logger.info('VTMid - could not find agency');
    return next(ErrorMessages.invalidToken);
  }

  // Next step in the process is to check that the users account is active
  return checkUser(data.user._id, token, function (err, userDoc) {
    if (err) return next(err);

    // Store the user in the session
    req.session.user = userDoc;

    // Store the access token
    req.session.accessToken = token;

    return next(null, token, data);
  });
}

/**
 *  Checks to make sure that the user is an active user
 *  @param {String} userId
 *  @param {String} token
 *  @param {Function} callback
 */
function checkUser (userId, token, callback) {
  function execQuery (err, doc) {
    if (err || !doc) {
      Logger.info('Could not find user, or there was an error');
      return callback(ErrorMessages.invalidToken);
    }
    if (doc.accessToken !== token) {
      Logger.info('Access token does not match');
      return callback(ErrorMessages.invalidToken);
    }
    if (!doc.agency || !doc.account) {
      Logger.info('Agency or Account could not be found');
      return callback(ErrorMessages.invalidToken);
    }
    if (doc.status !== 'active') {
      Logger.info('User is not active: ', doc.status);
      return callback(ErrorMessages.notActive);
    }
    if (doc.agency.status !== 'active') {
      Logger.info('Agency is not active: ', doc.agency.status);
      return callback(ErrorMessages.notActiveAgency);
    }
    if (doc.account.status !== 'active') {
      Logger.info('Account is not active: ', doc.account.status);
      return callback(ErrorMessages.notActiveAccount);
    }

    // If no organisation is on the account, continue.
    if (!doc.account.organisation) return callback(null, doc);

    // Otherwise populate the account
    return doc.populate(
      { path: 'account.organisation', select: 'status organisation isOrganisation' },
      function (err, newDoc) {
        if (err) {
          Logger.info('Could not populate parent account');
          return callback(ErrorMessages.invalidToken);
        }
        Logger.info('Organisation isOrg: ', newDoc.isOrganisation);
        return callback(null, newDoc);
      }
    );
  }

  User
    .findById(
      userId,
      '_id name accessToken'
    )
    .then(function (user) {
      console.log('user ', user);
      execQuery(user);
    });
}

var ValidateToken = module.exports = {};
ValidateToken.parse = validateToken;
