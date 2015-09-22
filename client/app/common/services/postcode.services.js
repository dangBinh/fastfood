angular.module('Common.Services.Postcode', [])
  .service('Postcode', [
    'api',
    '$rootScope',
    'queryString',

    function ($api, $rootScope, $queryString) {

      /**
       * Get
       * Returns a single postcode or all postcodes
       * @param options
       * @param callback
       * @private
       */
      function _get (options, callback) {
        var request;
        request = {
          path: '/postcode' +
          ((options.query) ? $queryString.create(options.query) : ''),
          method: 'GET',
          headers: {
            'x-auth-token' : $rootScope.cookie.accessToken
          }
        };
        return $api(request, callback);
      }

      return {
        get:    _get
      }
    }
  ]);
