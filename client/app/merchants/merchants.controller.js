'use strict';

angular.module('dLiteMe')
  .controller('MerchantsCtrl', [
    '$modal',
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    'postcodeService',

    function($modal, $scope, $state, $stateParams, $http, postcodeService) {
      $scope.currentPostCode = $stateParams.postcode; //to store the searched postcode
      $scope.working = false;
      $scope.merchants = [];

      $scope.cuisineTypes = [{
        label: 'All',
        value: 'all'
      }, {
        label: 'American',
        value: 'american'
      }, {
        label: 'Japanese',
        value: 'japanese'
      }, {
        label: 'Chinese',
        value: 'chinese'
      }, {
        label: 'Indian',
        value: 'indian'
      }, {
        label: 'Thai Cuisine',
        value: 'thaiCuisine'
      }, {
        label: 'Italian',
        value: 'italian'
      }, {
        label: 'African',
        value: 'african'
      }];

      $scope.selectedCuisine = "All"; //by default selected cuisine

      /**
       * Returns the user to the Home page
       */
      function goToMainPage() {
        $state.go('main');
      }


      $scope.postIt = 'welcome';
      /**
       * Fetches list of restaurants from postcode provided
       */
      function fetchRestaurantFromPostcode() {
        var options;
        $scope.postcode = ($scope.currentPostCode.replace('-', ' '));
        options = {
          data: {
            postCode: $scope.postcode
          },
          query: {
            postcode: $scope.postcode,
            milesRadius: 8
          }
        };
        $scope.working = true;

        //Lets fetch the postcode from Merchants Services
        postcodeService.getMerchantsFromPostcode(options).then(function(response) {
          $scope.working = false;
          if (response.status !== 'success') {
            if (response.status === 'Postcode_Unavailable') {
              console.log('issue with postcode'); // launch a modal instance here - accept email & postcode
            }
          }
          _.each(response.data, function(merchant) {
            merchant.postcode = JSON.parse(merchant.nearestLocation.location_postcode);
            merchant.postcode = _.keys(merchant.postcode)[0];
          });

          angular.forEach(response.data, function(item) {
            $scope.merchants.push(item);
          });
          localStorage.setItem('merchants', window.btoa(JSON.stringify($scope.merchants)));
        }).catch(function(error) {
          var modalInstance = $modal.open({
            animation: true,
            templateUrl: 'app/merchants/uncovered.html',
            controller: 'MerchantsUncoveredCtrl',
            size: 'md',
            resolve: {
              postcode: function(){
                return $scope.currentPostCode;
              }
            }
          });

          modalInstance.result.then(function(data) {
            $scope.userData = data;
            $state.go('main');
          }, function() {
            $state.go('main');
          });
        });
      }

      function filterListForMerchantTypes(merchantType) {
        //TODO: Add logic to filter merchants list - with some animations
      }

      //function call to fetch the list while page loads for the first time
      fetchRestaurantFromPostcode();

      // function to redirect user to the home page
      $scope.changeLocation = goToMainPage;

      //function to filter the list of restaurant
      // on the basis of user selection
      $scope.showSelectedCuisines = filterListForMerchantTypes();

    }
  ]);
