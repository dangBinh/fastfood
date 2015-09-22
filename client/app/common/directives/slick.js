// Your code is here..

angular.module('dLiteMe')
  .directive('slickIt',  function($timeout) {
    return {
      restrict: 'AEC',
      link: function(scope, element, attrs) {

        $timeout( function () {
          angular.element(element).slick(scope.$eval(attrs.slickIt));

        }, 1000);
      }
    };
  });
