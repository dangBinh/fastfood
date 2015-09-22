angular.module('dLiteMe').factory('orderService', [
    'api',
    'Auth',
    'queryString',

  function (api, Auth, queryString) {
    /**
     * Get
     * Returns a single order or all orders.
     * @param options
     * @param callback
     * @private
     */
    function _get (options, callback) {
      var request;
      request = {
        path: '/api/orders' +
              ((options.query) ? queryString(options.query) : ''),
        method: 'GET',
        headers: {
          //'x-auth-token' : Auth.getToken()
        }
      };
      return api(request, callback);
    }

    /**
     * Get
     * Returns some data for the homepage usage.
     * @param options
     * @param callback
     * @private
     */
    function _getFew(options, callback) {
     var request;
      request = {
        path: '/api/orders/home' +
              ((options.query) ? queryString(options.query) : ''),
        method: 'GET',
        headers: {

        }
      };
      return api(request, callback);
    }
    /**
     * Create
     * Creates a new order in the database.
     * This is called at the checkout 'junction' when a new order
     * is placed.
     * @param options
     * @param callback
     * @returns {*}
     * @private
     */
    function _create (options, callback) {
      var request;
      request = {
        path: '/api/orders',
        method: 'POST',
        data: ((!options.data) ? options : options.data),
        headers: {
          'x-auth-token' : Auth.getToken()
        }
      };
      console.log(request.data);
      return api(request, callback);
    }

    /**
     * Remove
     * Removes a single order from the database
     * @param options
     * @param callback
     * @returns {*}
     * @private
     */

    function _remove (options, callback) {
      var id, request;
      id = (typeof options === 'string') ? options : (options._id || options.id);
      request = {
        path: '/api/orders' +
              ((id) ? '/' + id : ''),
        method: 'DELETE',
        headers: {
          'x-auth-token' : Auth.getToken()
        }
      };

      return api(request, callback);
    }

    /**
     * Counts
     * Returns the total number of orders
     * If passed an 'id', returns specific
     * user's order.
     * @param options
     * @param callback
     * @returns {*}
     * @private
     */
    function _orderCounts (options, callback) {
      var id, request;
      id      = (typeof options === 'string') ? options : (options._id || options.id);
      request = {
        path   : '/api/orders' +
        ((id) ? '/' + id : '') +
        ((options.query) ? queryString( options.query ) : ''),
        method : 'GET',
        headers: {
          'x-auth-token': Auth.getToken
        }
      };
      return api(request, callback);
    }

    return {
      get:         _get,
      getFewData:  _getFew,
      create:      _create,
      remove:      _remove,
      orderCounts: _orderCounts
    }

  }
]);

