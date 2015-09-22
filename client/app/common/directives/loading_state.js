var app = angular.module('dLiteMe');

app.directive('loading', ['$http', function ($http) {

  return {
    restrict: 'EA',
    link: function (scope, element, attrs) {
      scope.isLoading = function () {
        return $http.pendingRequests.length > 0;
      };
      scope.$watch(scope.isLoading, function (status) {

        if(status) {
          element.show();
        } else {
          element.hide();
        }
      })
    }
  }
}]);
