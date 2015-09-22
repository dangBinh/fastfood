'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/jffmain-test'
  },

  // MySQL connection option

  mysql: {
    "username": "root",
    "password": "anhlavip",
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "migrationStorage": "json",
    "migrationStoragePath": "sequelize-meta.json",
    "autoMigrateOldSchema": true,
    "logging": false
  }
};
