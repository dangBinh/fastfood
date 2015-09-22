var request = require("request"),
    Logger  = require('../jff-logger')(true);



module.exports =  function proxyRequests (config, logger) {

  return {

    /**
     *  Fixes the request url to the api
     *  @param {Object} req
     *  @param {Object} res
     *  @param {Function} next
     */
    fixUrl: function(req, res, next) {
      var apiPrefix = '/api/',
          utilsPrefix = '/utils/',
          logsPrefix = '/log/';

      // Remove the prefixes and prepend their respective urls.
      if (req.url.indexOf(apiPrefix) !== -1) {
        var proxyUrl = req.url.substring(apiPrefix.length);
        req.url = config.apiUrl + '/' + proxyUrl;
      } else if (req.url.indexOf(utilsPrefix) !== -1) {
        var proxyUrl = req.url.substring(utilsPrefix.length);
        req.url = config.utilsUrl + '/' + proxyUrl;
      } else if (req.url.indexOf(logsPrefix) !== -1) {
        var proxyUrl = req.url.substring(logsPrefix.length);
        req.url = config.loggingUrl + '/' + proxyUrl;
      }

      return next();
    },

    /**
     *  Only adds certian headers to the api request
     *  @param {Object} headers
     */
    cleanHeaders: function(req, res, next) {
      var newHeaders = {};
      var allowed    = [ 'x-auth-token', 'cache-control', 'referer'  ];

      Object.keys(req.headers).forEach(function (key) {
        if (req.headers.hasOwnProperty(key) && allowed.indexOf(key) !== -1) {
          newHeaders[key] = req.headers[key];
        }
      });

      res.locals.proxyRequestHeaders = newHeaders;
      return next();
    },

    /**
     *  IE9 Work around route for get routes
     *  @param {Object} req
     *  @param {Object} res
     */
    request: function(req, res) {
      var url     = req.url,
          method  = req.method.toLowerCase(),
          options = { headers: res.locals.proxyRequestHeaders };

      if (req.method === 'POST' || req.method === 'PUT') {
        if (req.body) {
          var post     = JSON.stringify(req.body);
          options.json = req.body;
          options.headers['Accept']         = 'application/json';
          options.headers['Content-Type']   = 'application/json';
          options.headers['Content-Length'] = Buffer.byteLength(post, 'utf8');
        }
      } else if (req.method === 'DELETE') {
        method = 'del';
      }

      request[method](url, options, function (err, response) {
        if (err) return res.json(err);

        if (typeof response.headers !== 'undefined') {
          Object.keys(response.headers).forEach(function (key) {
            if (response.headers.hasOwnProperty(key)) {
              res.setHeader(key, response.headers[key]);
            }
          });
        }

        // Removing this breaks IE ?
        if (typeof response.body === 'string') {
          try {
            response.body = JSON.parse(response.body);
          } catch (e) {
            Logger.error(e);
            response.body = e;
            response.body.message += ' - When parsing response';
          }
        }

        // We also need to check if the response is an instance of an error
        // object, if it is we need to send this error back to the client,
        // we also want to make sure that the response also matches the API
        // response as closely as possible
        if (response.body instanceof Error) {
          response.body = {
            status: 500,
            meta: {
              error: response.body.message
            }
          };
        }

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(JSON.stringify(response.body), 'utf8'));
        res.statusCode = response.statusCode;
        res.send(JSON.stringify(response.body));
      });

    }
  }
};

