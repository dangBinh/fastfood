'use strict';

var models = require('../models');
var passport = require('passport');
var config = require('../config/environment');
var sign = require('jsonwebtoken' ).sign;
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var _       = require('lodash');
var sequelize = require('sequelize');
var validateJwt = expressJwt({ secret: config.secrets.session });


//var secret = config.secrets.session
/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */

function isAuthenticated() {
  return compose()
    // Validate jwt
    .use( function (req, res, next) {
      // allow access token to be passed through
      // query parameters
      if(req.query && req.query.hasOwnProperty('access_token')) {
        req.headers.authorization = 'Bearer '+ req.query.access_token;
      }
      validateJwt(req, res, next);
    })
    .use( function (req, res, next) {

      // Attach user to request
      models.Users.findOne({
        where: {
          id: req.user._id
        }
      }).then( function (user) {
        if(!user) return res.send(401);
        req.user = user;
        next();
      })
    })
}

/**
 * Checks if the user role meets the minimum requirements
 * of the route
 * @param roleRequired
 */

function hasRole(roleRequired) {
  if(!roleRequired) throw new Error('Required roles needs to be set');
  return compose()
    .use(isAuthenticated())
    .use( function meetsRequirements(req, res, next) {
      next();
    })
}

/**
 * Checks if the user has permission required
 * @param permissionRequired
 * @param action
 */
function hasPermission(permissionRequired, action) {
  if (!permissionRequired || !action) throw new Error('Required permission/action needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      // get permissions with current user role
      if (!req.user.role)
        return res.send(403);

      models.sequelize
        .query('Select rp.value, p.alias, p.name from Permissions as p, Role_Permission as rp ' +
        'Where rp.role = ' + req.user.role + ' and rp.permission = p.id',
        { type: models.sequelize.QueryTypes.SELECT})
        .then(function(data){
          if (!data.length)
            return res.send(403);

          var permissions = data;
          var staffPermission = _.find(permissions, function(permission){
            return permission.alias == permissionRequired;
          });

          if (staffPermission) {
            req.user.permissions = permissions;

            //FIND OUT PERMISSION VALUE
            if (staffPermission['READ'] = staffPermission.value >> 3 >= 1)
              staffPermission.value -= 8;

            if (staffPermission['UPDATE'] = staffPermission.value >> 2 >= 1)
              staffPermission.value -= 4;

            if (staffPermission['CREATE'] = staffPermission.value >> 1 >= 1)
              staffPermission.value -= 2;

            if (staffPermission['DELETE'] = staffPermission.value >> 0 >= 1)
              staffPermission.value -= 1;

            if (staffPermission[action])
              next();
            else
              res.send(403);
          }
          else {
            res.send(403);
          }
        });

    });
}

/**
 * Returns a jwt token signed by the app secret
 * @param id
 */
function signToken(id) {
  console.log(config.secrets.session);
  return sign({ _id: id }, config.secrets.session, { expiresInMinutes: 60*5});

}

function setTokenCookie(req, res) {
  if(!req.user) return res.json(404, { message: 'Something went wrong. Cannot fetch user.'});
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.isAuthenticated  = isAuthenticated;
exports.hasRole = hasRole;
exports.hasPermission = hasPermission;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
