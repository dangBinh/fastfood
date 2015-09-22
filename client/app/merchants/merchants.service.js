var app = angular.module('dLiteMe');
app.factory('Merchants', [
  '$rootScope',
  'socketFactory',
  'api', //why did you comment out api? yet you're using it in the dependency??
  'queryString',

  function ($rootScope, socketFactory, $api, queryString) {
    var _baseUrl = '/api/',
    mySocket = socketFactory.socket;

    /**
     * _createMerchant
     * Creates a new merchant
     * @param options
     * @param callback
     * @private
     */
    function _createMerchant(options, callback) {
      var request = {
        path: _baseUrl + 'postcodes'+ //TODO: Confirm this route is correct
        ((options.query) ? queryString(options.query) : ''),
        method: 'POST',
        data: ((!options.data) ? options : options.data),
        headers: {
          //'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return $api(request, callback);
    }


    /**
     * _getMerchant
     * Fetches the details of a single merchant
     * @param options
     * @param callback
     * @private
     */
    function _getMerchant(options, callback) {
      var request = {
        path: _baseUrl + 'search/postcodes?postcode='+
        ((options.query) ? queryString(options.query) : ''),
        method: 'GET',
        data: ((!options.data) ? options : options.data),
        headers: {
        //  'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return $api(request, callback);
    }


    /**
     * _deleteMerchant
     * Deletes a particular merchant
     * @param options
     * @param callback
     * @private
     */
    function _deleteMerchant(options, callback) {
      var request = {
        path: _baseUrl + 'merchants' + options.id,
        method: 'DELETE',
        data: ((!options.data) ? options : options.data),
        headers: {
         // 'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return $api(request, callback);
    }


    /**
     * _updateMerchant
     * Updates the values for a merchant
     * @param options
     * @param callback
     * @private
     */
    function _updateMerchant(options, callback) {
      var request = {
        path: _baseUrl + 'merchants' + options.id,
        method: 'UPDATE',
        data: ((!options.data) ? options : options.data),
        headers: {
        //  'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return $api(request, callback);
    }


    /**
     * _getMerchantsList
     * Fetches the lis of all available merchants
     * @param options
     * @param callback
     * @private
     */
    function _getMerchantsList(options, callback) {
      var request = {
        path: _baseUrl + 'merchants',
        method: 'GET',
        data: ((!options.data) ? options : options.data),
        headers: {
         // 'x-auth-token': $rootScope.cookie.accessToken
        }
      };
      return $api(request, callback);
    }

    /**
     * _listenToMerchantUpdates
     * Refresh browser and fetch newly added data to the page
     * @param options
     * @param callback
     * @private
     */
    function _listenToMerchantUpdates(options, callback) {
     // mySocket.forward('merchants.update');
    }

    /**
     * _destroyMerchantUpdate
     * Destroy newly deleted merchants from browser
     * @param options
     * @param callback
     * @private
     */
    function _destroyMerchantUpdate(options, callback) {
     // mySocket.forward('merchants.delete');
    }

    return {
      createMerchant: _createMerchant,
      getMerchant: _getMerchant,
      deleteMerchant: _deleteMerchant,
      updateMerchant: _updateMerchant,
      getMerchantsList: _getMerchantsList,
      listenToMerchantUpdates: _listenToMerchantUpdates,
      destroyMerchantUpdate: _destroyMerchantUpdate
    }


  }]);
