angular.module('dLiteMe').factory('postcodeService', [

    'api',
    'Auth',
    'queryString',

    function (api, Auth, queryString) {
    var baseUrl = '/api/';


      /**
       * Validates customer's postcode
       *
       */
      function checkPostCode(postcode) {
        postcode = postcode.replace(/\s/g, "");
        //var regex = /[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}/i;
        var regex = /^[a-z0-9]{1,4}\s*?\d[a-z]{2}$/i;

        return (regex.test(postcode));
      }

      /**
       * Formats given postcode to include hipen {-}
       * @param postcode
       * @returns {*}
       */
      function formatPostcode(postcode) {
        var first3, last3, first4, last4;
        if(postcode !== undefined && postcode !== '') {
          if( postcode.length === 6 ) {
            first3   = postcode.substring( 0, 3 ).trim();
            last3    = postcode.substring( 3, postcode.length ).trim();
            postcode = first3 + '-' + last3;
          } else {
            first4   = postcode.substring( 0, 4 ).trim();
            last4    = postcode.substring( 4, postcode.length ).trim();
            postcode = first4 + '-' + last4;
          }

        }
        return postcode;
      }

      /**
       * Get
       * Returns a single or all merchants/partners in the system
       * based on postcodes entered by the user.
       * @param options
       * @param callback
       *
       */
      function _getListOfMerchantsFromPostcode(options, callback) {
        var request;
        request = {
          path: baseUrl + 'postcodes/search' +
          ((options.query) ? queryString(options.query) : ''),
          method: 'GET',
          data: ((!options.data) ? options : options.data),
          headers: {

          }
        };
        return api(request, callback);
      }



      // Returns our functions above
      return {
        checkPostCode:                checkPostCode,
        formatPostcode:               formatPostcode,
        getMerchantsFromPostcode:     _getListOfMerchantsFromPostcode
      }

    }

  ]);














