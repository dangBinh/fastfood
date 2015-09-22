'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MySQL connection options

  mysql: {
    "username": "root",
    "password": "anhlavip",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "migrationStorage": "json",
    "migrationStoragePath": "sequelize-meta.json",
    "autoMigrateOldSchema": true,
    "logging": false
  },

   // Environment

    env : 'production',

    // Domains
    apiDomains:   domains.api,
    adminDomains: domains.admin,

    // Domain URLs
    apiUrl:   protocol + domains.api,
    adminUrl: protocol  + domain.admin

      // configs

      email : {
        from: 'no-reply@just-fastfood.com',  //to be changed
        fromName: 'Just-FastFood'
      },

      redis: {
        host: 'beardfish.redistogo.com',
        port: '10578',
        user: 'redistogo',
        pass: 'c274cdc97dfdbd257b8cd3511a272ad5'
      },

      s3: {
        key: '',
        secret: '',
        region: 'eu-west-1'
      }

};
