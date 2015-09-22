var app = angular.module('dLiteMe');

app.directive('toUpper', [ function () {
  return {
    restrict: 'EA',
    require: 'ngModel',
    link: function (scope, element, attributes, modelCtrl) {

     function capitalize (inputVal) {
        if(inputVal === undefined )
          inputVal = '';
        var capitalized;
        capitalized = inputVal.toUpperCase();
        if(capitalized !== inputVal) {
          modelCtrl.$setViewValue(capitalized);
          modelCtrl.$render();
        }
        return capitalized;
      }




      modelCtrl.$parsers.push(capitalize);
      capitalize(scope[attributes.ngModel]);

    }
  }
}]);
