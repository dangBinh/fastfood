var config      = require('../../config/environment'),
    Request     = require('request'),
    Logger      = require('../logger');

/**
 * JFF REST Library
 * @param tempOptions
 * @constructor
 */
var REST  = function (tempOptions) {

  if(!(this instanceof REST)) return new REST(tempOptions);
  else {
    var options = {
      method: tempOptions.method || 'GET',
      url: tempOptions.url || '/',
      data: tempOptions.data || undefined,
      token: tempOptions.token || undefined,
      auth: tempOptions.auth || undefined,
      domain: tempOptions.domain || 'api'
    };

    this.config = {};
    if(typeof options.url !== 'undefined' && options.url !=='') {
      if(typeof options.domain !== 'undefined' && options.domain !== '') {
        switch (options.domain) {
          case 'api': this.config.url = config.apiUrl + options.url;
            break;
          case 'admin': this.config.url = config.adminUrl + options.url;
            break;
          case 'apps': this.config.url = config.appsUrl + options.url;
            break;
        }
      }
      this.config.domain = options.domain;
    }

    if (typeof options.data !== "undefined" && options.data !== "") this.config.json = options.data;
    if (typeof options.auth !== "undefined" && options.auth !== "") this.config.auth = options.auth;
    if (typeof options.token !== "undefined" && options.token !== "") this.config.headers = { 'x-auth-token': options.token };

    return this;
  }

};

REST.prototype.sendRequest = function (callback) {
  var self = this;
  if(typeof self.config.domain !== 'undefined') self.config.domain = null;

  Request(self.config, function (error, response, body) {
    // If body contains brackets (object), convert the string to an object
    if(typeof body === 'string' && typeof response !== 'undefined' && typeof response.statusCode !== 'undefined') {
      body = { code: response.statusCode, message: ''};

      if(body.code >= 400 && body.code < 600) body.status = 'error';
      else if (body.code >= 200 & body.code <= 399) body.status = 'success';

    } else if (typeof body === 'string') body = { code: 400, message: error, status: 'error'};

    if(error || (typeof body !== 'undefined' && body.status == 'error')) {
      var errorMessage = (error) ? error + '\n' : '',
          statusCode = (typeof body !== 'undefined' && typeof body.code !== 'undefined') ? body.code : 404,
          statusMessage = (typeof body !== 'undefined' && typeof body.message !== 'undefined') ? body.message : '';

      errorMessage += '<' + self.config.url + '>' + statusCode;

      // Append status title to code
      switch (statusCode) {
        case 400: errorMessage += ' - Bad Request';
              break;
        case 401: errorMessage += ' - Unauthorised';
              break;
        case 403: errorMessage += ' _ Forbidden';
              break;
        case 404: errorMessage += '- Not Found';
              break;
        case 500: errorMessage += ' - Internal Server Error';
              break;
      }
      if(statusMessage !== '') errorMessage += ' [ '+ statusMessage + ']';
      callback({ status: statusCode, message: errorMessage }, response, body);

    } else {
      callback(null, response, body);
    }
  });
};

REST.prototype.post = function (callback) {
  var self = this;
  self.config.method = 'POST';
  self.sendRequest(callback);
};

REST.prototype.get = function (callback) {
  var self = this;
  self.config.method = 'GET';
  self.sendRequest(callback);
};

REST.prototype.put = function (callback) {
  var self = this;
  self.config.method = 'PUT';
  self.sendRequest(callback);
};

REST.prototype.delete = function (callback) {
  var self = this;
  self.config.method = 'DELETE';
  self.sendRequest(callback);
};

module.exports = REST;
