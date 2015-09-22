angular.module('dLiteMe').factory('merchantService', [
    'api',
    'Auth',
    'queryString',
    '$q',
    '$http',
  function (api, Auth, queryString, $q, $http) {
    var baseUrl = '/api/merchants';
    /**
     * Get
     * Returns a single merchant.
     * @param merchantId
     * @private
     */
    function _get (merchantId) {
      var request;
      request = {
        path  : baseUrl + '/' + merchantId,
        method: 'GET'
      };
      return api(request);
    }

    /**
     * Get
     * Returns categories of a merchant
     * @param options
     * @private
     */
    function _getCategories (options) {
      var request, id;

      id      = (options.id ? options.id : '');
      request = {
        path: baseUrl + '/categories/' + id,
        method: 'GET'
      };
      return api(request);
    }

    /**
     * Get
     * Returns items of a merchant
     * @param options
     */
    function _getMerchantItems (options) {
      var request, id;

      id      = (options.id ? options.id : '');
      request = {
        path  : baseUrl + '/items/' + id,
        method: 'GET'
      };
      return api( request );
    }

    return {
      get             : _get,
      getCategories   : _getCategories,
      getMerchantItems: _getMerchantItems
    }

  }
]);

