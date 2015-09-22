var request   = require('request'),
    config    = require('../../config/environment'),
    Logger    = require('../logger');

module.exports = require('./jff-proxy')(config, Logger);
