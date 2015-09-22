angular.module('Shared.Services.Order', [])
  .factory('Order', [
    'api',
    '$rootScope',
    'queryString',

  /**
   *
   */
  function ($api, $rootScope, $queryString) {
    /**
     * Create
     * Creates a new order
     * @param options
     * @param callback
     * @private
     */
    function _create(options, callback) {
      var request;
      request = {
        path: '/api/orders',
        method: 'POST',
        data: ((!options.data) ? options : options.data),
        headers: {
          'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return api(request, callback);
    }

    return {
      create : _create
    }
  }

  ]);
