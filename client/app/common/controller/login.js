angular.module('dLiteMe')
  .controller('SignInCtrl', [
    '$scope',
    '$rootScope',
    '$timeout',
    'ngDialog',
    'Modals',

    function ($scope, $rootScope, $timeout, $dialog, $modal) {
      var scope = $scope.$parent.$parent;
     // scope.target = angular.element(scope.modal.scope).scope();
      console.log(scope);
      $scope.prevent = false;
      $scope.working = false;
      $scope.part = 'form';




      var defaultMessage  = {
        type: 'Success',
        clas: 'success',
        content: 'Logged In'
      };

      $scope.reset = function () {
        $scope.message = angular.copy(defaultMessage);
      };

      $scope.logUser = function () {
        console.log('logging in');
        // dialog.open({template: 'hello', plain: true});
        dialog.open({
          template: 'app/modals/login.html'
        })

      }

    }
  ]);
