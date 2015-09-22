'use strict';

var  db           = require('../../models' ),
     passport     = require('passport' ),
     config       = require('../../config/environment' ),
     Logger       = require('../../libraries/logger' ),
     jwt          = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */

function all(req, res) {
  console.log(req);
  db.Accounts.findAll().then( function (err, accounts) {
    if(err) {
      console.log('Error occurred', err);
      Logger.error('Could not populate account : ', err);
    }
    return res.send(accounts);
  })
}

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
