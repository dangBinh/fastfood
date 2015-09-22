
'use strict';

var  restify = require('restify'), // Continue from here
     express = require('express'),
     favicon = require('serve-favicon'),
     LogRequests = require('../middleware/log_requests'),
     Protocol      = require('../middleware/protocol'),
     Logger        = require('./logger'),
     errorHandler = require('errorhandler'),
     permissions   = require('../config/permission'),
     formatters  = require('./formatters'),
     path = require('path'),
     restful    = require('sequelize-restful' ),
     ValidateToken = require('../middleware/validate_token'),
     config = require('./../config/environment'),
     passport = require('passport');

var Server = module.exports = restify.createServer({
  formatters: {
    'application/json; q=0.4': formatters.json
  }
});

  var cors = {
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
  };

Server.on('uncaughtException', function (req, res, route, err) {
  Logger.err(route.spec.path + '\n', err.stack);
  return res.send(err);
});

// Attach the database connection

Server.db = require('./db');

Server.config = require('../config/environment');

Server.passport = require('./passport')(passport, Server.config);


Server.permissionSet = false;

Server.use(passport.initialize());
Server.use(restify.CORS(cors));
Server.use(restify.acceptParser(Server.acceptable));
Server.use(restify.authorizationParser());
Server.use(restify.dateParser());
Server.use(restify.jsonp());
Server.use(restify.gzipResponse());
Server.use(restify.bodyParser());
Server.use(LogRequests);
Server.use(Protocol);
Server.use(ValidateToken.parse);



  if ('production' === config.all.env) {
    Server.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    Server.use(express.static(path.join(config.root, 'public')));
    Server.set('appPath', config.root + '/public');
    //server.use(morgan('dev'));
  }

  if ('development' === config.all.env || 'test' === config.all.env) {
    Server.use(require('connect-livereload')());
    Server.use(express.static(path.join(config.root, '.tmp')));
    Server.use(express.static(path.join(config.root, 'client')));
    Server.set('appPath', 'client');
    //server.use(morgan('dev'));
    Server.use(errorHandler()); // Error handler - has to be last
  }



/**
 * Start the web server running
 */

Server.start = function(callback) {
  var self = this;

  self.db(function (connected, data) {
    if(connected) {
      self.db = data;

    //  Fetch acl

      permissions({
        type: 'redis', instance: data
      }, false, function (err, acl) {
        if(err) {
          return Logger.error(err);
        }
      //  Store acl
        self.pre(function (req, res, next) {
          req.acl = acl;
          next();

        }.bind({acl: acl}));

      //  Start the server
        self.listen(self.config.all.port, function serverListen () {
          if(typeof callback === 'function') {
            callback.call(self, null, self.all.config.port, self.all.config.env, acl);

          }
        });
      });
    } else {
      if(typeof callback === 'function') {
        var message = 'Server unable to start ' + ((data) ? ':' + data.message : '');
        callback.call(self, new Error(message));
      }
    }
  });


};


