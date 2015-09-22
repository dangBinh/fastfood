/**
 * Express configuration
 */

'use strict';

var  express        = require('express' ),
     favicon        = require('serve-favicon'),
     morgan         = require('morgan'),
     compression    = require('compression'),
     bodyParser     = require('body-parser'),
     methodOverride = require('method-override' ),
     cookieParser   = require('cookie-parser' ),
     session        = require('express-session' ),
     RedisStore     = require('connect-redis')(session ),
     errorHandler   = require('errorhandler' ),
     path           = require('path' ),
     restful        = require('sequelize-restful' ),
     database       = require('../libraries/db' ),
     config         = require('./environment' ),
     passport       = require('passport' );

module.exports = function(app) {
  var env = app.get('env');

  // Main application variables - available anywhere in the system
//  app.locals({
//    appName: 'Just-FastFood',
//    environment: config.env,
//    env: config.env,
//    appVersion: config.timestamp  // This should be changed whenever we deploy live
//  });
  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser(config.secrets.session));
  app.use(passport.initialize());

  app.use(session({
    secret: config.secrets.session,
    store: new RedisStore({
      host: config.redis.host,
      port: config.redis.port,
      pass: config.redis.pass,
      username: config.redis.user
    })
  }));

  // app.use(auth.session);

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    app.use(require('connect-livereload')());
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'client')));
    app.set('appPath', 'client');
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last
  }

};
