var config  = require('../config/environment'),
    Logger  = require('../libraries/logger');

var Permissions = module.exports = {
  /**
   * Is Allowed
   * @param  {String=}  userId
   * @param  {Number}  segments
   * @return {Function}
   */
  isAllowed: function () {
    var segments = 0, userId = 'guest';
    if (arguments.length === 1) {
      segments = (typeof arguments[0] !== "undefined") ? arguments[0] : segments;
    } else if (arguments.length === 2) {
      userId = (typeof arguments[0] !== "undefined") ? arguments[0] : userId;
      segments = (typeof arguments[1] !== "undefined") ? arguments[1] : segments;
    }

    // Return middleware
    return function AclIsAllowed(req, res, next) {
      var method = req.method.toLowerCase();

      // Setup the user id
      userId = ((req.session && req.session.user && req.session.user._id) ?
        req.session.user._id + '' : 'guest');

      if (!req.acl || !req.acl.middleware) {
        var err = new Error('ACL object not found.');
        Logger.info('PMid - ' + err.message);
        throw err;
      }

      // Return ACL middleware
      return req.acl.middleware(segments, userId, method)(req, res, next);
    };
  }
};
