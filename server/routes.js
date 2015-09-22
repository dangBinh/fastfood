'use strict';

var errors = require('./components/errors');

/**
 * Using envelope to encapsulate returned object
 * @param app
 */
module.exports = function(app) {
  app.use(function(req, res, done) {
    res.envelope = function(data, err) {
      var code = res.statusCode;
      res.json({
        data: data || null,
        meta: (err) ? {messages: [err.message]} : {},
        status: (code >= 200 && code < 300) ? 'success' : 'error',
        statusCode: code
      })
    };

    res.error = function(err) {
      res.status(400).envelope(null, err);
    };

    res.needOne = function(message) {
      return function(data) {
        if(!data) throw new Error(message)
        return data;
      }
    }
    done();
  });

  /**
   * ========================================================
   *                Application Routes
   * ========================================================
   */

  app.use('/api/orders', require('./api/orders'));
  app.use('/api/users', require('./api/users'));
  app.use('/api/merchants', require('./api/merchant'));
  app.use('/api/postcodes', require('./api/postcodes'));
  app.use('/api/staffs', require('./api/staff'));

  // Authentication
  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
