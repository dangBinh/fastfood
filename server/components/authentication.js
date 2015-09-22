var request         = require('request'),
    config          = require('../config/environment/index'),
    rest            = require('../libraries/rest/index' ),
    jwt             = require('jwt-simple' ),
    config          = require('../config/environment/index' ),
    Logger          = require('../libraries/logger')('auth ctrl' ),
    i18n            = require('i18n' ),
    serverError     = i18n.__('There was an error logging you in.');


/**
 * Sets the users session variables
 * @param {Object} req
 * @param {Object} body
 * @param {Function} next
 */
function setUserSession(req, body, next) {
  var globalAccess = ['superadmin', 'partneradmin', 'partneruser'];

  try {
    // Store the access token for future authentication requests.
    req.session.accessToken = body.data.accessToken;
    var decodedToken = jwt.decode(body.data.accessToken, config.secret);
    for(var key in decodedToken) {
      if(decodedToken.hasOwnProperty(key) && key !== 'support') {
        req.session[key] = decodedToken;
      }
    }
  } catch (e) {
    return next(e);
  }
  return next(null);
}

/**
 * Sets a cookie
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
function setCookie(req, res, next) {
  try {
    var cookie = {
      accessToken: req.session.accessToken,
      userLevel: req.session.user.type,
      _id: req.session.user._id,
      account: req.session.user.account,
      status: req.session.user.status,
      email: req.session.user.email
    };
    res.cookie('justfastfood', JSON.stringify(cookie));
    return next(null, cookie);

  } catch (e) {
    return next(e);
  }
}


