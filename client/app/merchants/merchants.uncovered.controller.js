'use strict';

angular.module('dLiteMe')
  .controller('MerchantsUncoveredCtrl', [
    '$scope',
    '$http',
    '$modalInstance',
    'postcode',
    function($scope, $http, $modalInstance, postcode) {
      $scope.user = {
        postcode: postcode,
        email: ''
      };
      $scope.cancel = function() {
        $modalInstance.close();
      };
      $scope.submit = function() {
        $scope.cancel();
      };
    }
  ]);
