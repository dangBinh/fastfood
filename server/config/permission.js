var ACL, config, cluster, mongoose, _, async, Logger,
  GUEST, MEMBER, ACCOUNT_USER, ACCOUNT_ADMIN,
  ORGAN_USER, ROLES, USER_LEVELS, OVERRIDE, PRUNE_ALLOWED, ACL_PREFIX;

ACL               = require('acl');
config            = require('./index.js');
cluster           = require('cluster');
_                 = require('lodash');
async             = require('async');
Logger            = require('../libraries/logger');

// Permissions
GUEST             = require('./permissions/guest');
MEMBER            = require('./permissions/member');
ACCOUNT_USER      = require('./permissions/account_user');
ACCOUNT_ADMIN     = require('./permissions/account_admin');
ORGAN_USER        = require('./permissions/organ_user');

// ACL Prefix
ACL_PREFIX = 'acl_';

// Role arrays
ROLES             = ['guest', 'member',
   'account_user', 'account_admin',
  'organ_admin', 'organ_user',
  'agency_user'];

USER_LEVELS       = {
  'organadmin'    : 'organ_admin',
  'organuser'     : 'organ_user',
  'accountadmin'  : 'account_admin',
  'accountuser'   : 'account_user',
};

// Last Prune Date
OVERRIDE = false;
PRUNE_ALLOWED = (OVERRIDE || config.all.env !== 'development');

/**
 * Add Roles
 * Sets up the user roles, defining their permissions.
 * @param {Object} acl
 * @param {Function} callback
 */
function addRoles (acl, callback) {
  return acl.allow([
  /**
   * Guest
   * Guests are users who aren't a member of Big Top.
   * I.e. when a user submits a form on the apps domain, it needs to create a lead.
   */
    { roles: ['guest'], allows: GUEST },

  /**
   * Member
   * Members are users of Just-FastFood. This role sets the foundation for the user levels.
   */
    { roles: ['member'], allows: MEMBER },

  /**
   * User Levels
   */
    { roles: ['account_user'], allows: ACCOUNT_USER },
    { roles: ['account_admin'], allows: ACCOUNT_ADMIN },
    { roles: ['organ_user'], allows: ORGAN_USER },
  ], callback);
}

/**
 * Setup Roles
 * Ensures that each user level extends their child role.
 * @param  {Object} acl
 * @param  {Function} callback
 */
function setupRoles (acl, callback) {
  if (config.all.debugMode) Logger.info('Extending roles...');
  MEMBER            = mergeRoles(GUEST, MEMBER);
  ACCOUNT_ADMIN     = mergeRoles(ACCOUNT_USER, ACCOUNT_ADMIN);
  ORGAN_USER        = mergeRoles(ACCOUNT_ADMIN, ORGAN_USER);

  return (typeof callback === "function") ? callback() : true;
}

/**
 * Merge Roles
 * @param  {Array} parent
 * @param  {Array} child
 * @return {Array}
 */
function mergeRoles (parent, child) {
  // Convert array to object
  var childRoles = {};
  for (var i = 0, l = child.length; i < l; i += 1) {
    childRoles[child[i].resources] = child[i].permissions;
  }

  // Convert array to object
  var parentRoles = {};
  for (var j = 0, k = parent.length; j < k; j += 1) {
    parentRoles[parent[j].resources] = parent[j].permissions;
  }

  // Merge the permissions
  for (var key in parentRoles) {
    if (parentRoles.hasOwnProperty(key)) {
      // Add the resource if the child doesn't have it
      if (!childRoles.hasOwnProperty(key)) {
        childRoles[key] = parentRoles[key];
      }

      // Otherwise merge the array
      else {
        childRoles[key] = _.union([], childRoles[key], parentRoles[key]);
      }
    }
  }

  // Convert to an array again
  var mergedRoles = [];
  for (var prop in childRoles) {
    mergedRoles.push({resources: prop, permissions: childRoles[prop]});
  }

  return mergedRoles;
}

/**
 * Clean Up ACL
 * Removes all the ACL collections from the database.
 * @param  {Object}   acl
 * @param  {Function} callback
 */
function cleanUpACL (acl, callback) {
  // Ignore cleaning up ACL
  if (!PRUNE_ALLOWED) return (typeof callback === "function") ? callback(null) : true;

  if (config.all.debugMode) Logger.info('Cleaning up ACL...');

  // Fetch collections
  mongoose.connection.db.collectionNames(function (err, names) {

    function dropCollections (collectionName) {
      collectionDropMethods.push(function (done) {
        if (!collectionName) {
          return done();
        }
        return mongoose.connection.db.dropCollection(collectionName, function (err) {
          return done(err);
        });
      });
    }

    if (err) return (typeof callback === "function") ? callback(err) : false;

    // Build collection drop methods
    var collectionDropMethods = [];
    for (var i = 0, l = names.length; i<l; i+=1) {
      if (names[i].name.indexOf(ACL_PREFIX) !== -1) {
        var name = names[i].name.split('.')[1];
        dropCollections(name);
      }
    }

    // Drop the collections
    return async.series(
      collectionDropMethods,
      function (err) {
        if (err) return (typeof callback === "function") ? callback(err) : false;
        if (config.debugMode) Logger.info('Cleanup finished');
        return (typeof callback === "function") ? callback(null) : true;
      }
    );
  });
}

/**
 * Add Permissions To Users
 * Queries the database for all the users, and
 * adds their permissions to redis.
 * @param  {Object}   acl
 * @param  {Function} callback
 * @return {*}
 */
function addPermissionsToUsers (acl, callback) {
  mongoose.model('User').find({ deleted: { $ne: true }}, function (err, users) {
    if (err) return (typeof callback === "function") ? callback(err) : false;

    // Add roles against users
    for (var i = 0, l = users.length; i<l; i+=1) {
      var userId = users[i]._id.toHexString(),
        userRole = USER_LEVELS[users[i].type];

      acl.addUserRoles(userId, [userRole]);
    }

    // Add guest user role
    acl.addUserRoles('guest', ['guest']);

    return (typeof callback === "function") ?
      callback(null, { affectedUsers: users.length }) :
      true;
  });
}

/**
 * Logger Wrapper
 * Used for debugging the ACL library.
 * @param  {String} type
 * @return {Function}
 */
function logger (type) {
  return function (message) {
    // Logger[type](message);
  };
}

/**
 * Permissions Lib
 * @param  {Object} options
 * @param  {Boolean} ignoreSetup
 * @param  {Function} aclCallback
 * @return {Object}
 */
module.exports = function (options, ignoreSetup, aclCallback) {
  // Determine which backend to use
  var acl, backend;
  if (options.type === 'mongodb') {
    backend = new ACL.mongodbBackend(options.instance, ACL_PREFIX);
  }
  else if (options.type === 'redis') {
    var redis, redisPort, redisHost, redisOptions, redisPassword, redisClient;
    redis         = require('redis');
    redisPort     = options.instance.port;
    redisHost     = options.instance.host;
    redisOptions  = options.instance.options;
    redisPassword = options.instance.pass;
    redisClient   = redis.createClient(redisPort, redisHost, redisOptions);

    redisClient.auth(redisPassword);
    backend = new ACL.redisBackend(redisClient, ACL_PREFIX);
  } else if (options.type === 'memory') {
    backend = new ACL.memoryBackend();
  }

  if (config.debugMode) {
    acl = new ACL(backend, {
      debug: logger('debug'),
      info: logger('info'),
      error: logger('error')
    });
  } else {
    acl = new ACL(backend);
  }

  // Attach roles/user levels
  acl.roles = ROLES;
  acl.userLevels = USER_LEVELS;

  function seriesSetupWrapper (methodName) {
    var _this = this;
    return function (callback) {
      methodName.call(_this, acl, callback);
    };
  }

  // Only setup roles if we're on the master process
  if (cluster.isMaster && !ignoreSetup) {

    var setupFunctions = [
      seriesSetupWrapper(setupRoles),
      seriesSetupWrapper(cleanUpACL),
      seriesSetupWrapper(addRoles),
      seriesSetupWrapper(addPermissionsToUsers)
    ];

    return async.series(
      setupFunctions,
      function (err) {
        if (err) return console.log(err);
        return ("function" === typeof aclCallback) ? aclCallback(null, acl) : acl;
      }
    );
  }

  return ("function" === typeof aclCallback) ? aclCallback(null, acl) : acl;
};
