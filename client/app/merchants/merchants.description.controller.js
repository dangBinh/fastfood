'use strict';

angular.module('dLiteMe')
  .controller('MerchantsDescriptionCtrl', [
    '$scope', '$modalInstance', 'comment',
    function($scope, $modalInstance, comment) {

      $scope.comment = comment;

      $scope.submit = function() {
        $modalInstance.close($scope.comment);
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    }
  ]);
