var config  = require('../config/environment'),
    Logger  = require('../libraries/logger');

/**
 *  Log Requests
 *  @param {Object} req
 *  @param {Object} res
 *  @param {Function} next
 */
function logRequests (req, res, next) {
  var method, url, content, cacheBuster;
  method = req.method.toLowerCase();
  url = req.url;
  content = JSON.stringify(req.body ? req.body : req.query);
  if (!config.logRequests) return next();
  if (method === 'options') return next();

  // Remove cacheBuster from url
  if (req.query.cacheBuster) {
    cacheBuster = 'cacheBuster=' + req.query.cacheBuster;
    url = url.replace("?" + cacheBuster, "?");
    url = url.replace("&" + cacheBuster, "");
  }

  Logger.router(req.method.toUpperCase() + ' - ' + url, ((content) ? '\n' + content : ''));
  return next();
}

module.exports = logRequests;
