'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

var domains, protocol;

domains = {
  api: 'api.dlitme.com',
  admin: 'admin.dliteme.com'
};

protocol = 'http://';

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  debugMode: false,

  // Domains
  apiDomains:   domains.api,
  adminDomains: domains.admin,

  // Domain URLs
  apiUrl:   protocol + domains.api,
  adminUrl: protocol  + domains.admin,

  cors: {
    origins: ['*'],
    credentials: false,
    headers: [
      'x-auth-token',
      'x-capture-token',
      'X-Requested-With',
      'Content-Type',
      'Access-Control-Allow-Headers',
      'Content-Range',
      'Content-Disposition',
      'Content-Description'
    ]
  },


  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: 'jff-main-secret'
  },

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],


  // MySQL Connection Options

  mysql: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'justfast_food'

  },

  redis: {
    host: 'beardfish.redistogo.com',
    port: '10578',
    user: 'redistogo',
    pass: 'c274cdc97dfdbd257b8cd3511a272ad5'
  },

};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV ));
