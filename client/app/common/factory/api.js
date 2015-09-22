/**
 * JFF API module
 */
angular.module('dLiteMe')
  .factory('api', [
    "$http",
    "$rootScope",
    "$timeout",
    "$q",
    function ($http, $rootScope, $timeout, $q) {

      /**
       * API constructor
       * automatically runs the request and returns the response
       * in the callback.
       */
      function API (request, callback) {
        if(!(this instanceof  API)) {
          return new API(request, callback);
        }
        this.callback = callback;
        this.request  = request;

        if(typeof callback === 'function') {
          return this.send();
        } else {
          return this.promise();
        }
      }

      /**
       * Sets the URL for the HTTP request
       */
      API.prototype.setRequestUrl = function () {
        var self, buster, path, domain;
        self = this;
        path = this.request.path || "";
        buster = (path.indexOf("?") !== -1) ? "&cacheBuster=" : "?cacheBuster=";
        domain = 'http://localhost:9001'; // ('http://api.dliteme.com');

        this.request.url = (domain + path + buster + new Date() .getTime());
      };

      /**
       * Creates a consistent response for the API to return
       * @param response
       * @param status
       * @param headers
       */
      API.prototype.createResponse = function (response, status, headers) {
        var head = headers;
        try {
          head = headers();
        } catch(e) {}
        var res = {
          meta: (response.meta || null),
                data: (response.data || null),
          status: (response.status),
                statusCode: status,
          headers: head
        };
        if(res.status == 'error') {
          console.error(this.request.url, res);
        }
        return res;
      };

      /**
       * Handles API responses
       * @param {Function} callback
       */
      API.prototype.responseHandler = function (callback) {
        var self = this;
        return function (response, status, headers) {
          var res = self.createResponse(response, status, headers);
          callback.call(self, res);
        }
      };

      /**
       * Sends the API request
       */
      API.prototype.send = function () {
        this.setRequestUrl();
        $http(this.request)
          .success(this.responseHandler(this.callback))
          .error(this.responseHandler(this.callback));
      };

      /**
       * Sends the API request using Promise
       */

      API.prototype.promise = function () {
        var deferred = $q.defer();
        this.setRequestUrl();
        $http(this.request)
          .success(this.responseHandler(deferred.resolve))
          .error(this.responseHandler(deferred.reject));
        return deferred.promise;
      };

      // return the API
      return API;
    }
  ]);
