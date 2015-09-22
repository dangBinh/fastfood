var config = require('../config/environment');

var methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

function corsHanler (req, res, next) {
  res.header('Access-Control-Allow-Credentials', config.all.cors.credentials);
  res.header('Access-Control-Allow-Headers', config.all.cors.headers.join(', '));
  res.header('Access-Control-Allow-Methods', methods.join(', '));
  res.header('Access-Control-Allow-Origin', config.all.cors.origins);
  next(null);
}

function corsRoute (req, res, next) {
  res.statusCode = 200;
  res.send();
}

var Cors = module.exports = {
  Handler: corsHanler,
  Route: corsRoute
};
