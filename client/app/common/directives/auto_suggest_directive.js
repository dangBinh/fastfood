var app = angular.module('dLiteMe');

app.directive('autoSuggest', ['$timeout', function ($timeout) {
  return {
    restrict: 'EA',
    scope: {
      featuredRestaurant: "=featuredRestaurant"
    },
    link: function (scope, element, attributes) {
      var _autoSuggestTimeFrame = 5000,
        _restaurantConfig = {
          'imageSrc': '../../assets/data/res-01.png'
        };

      $timeout(function () {
        swal({
          title: "Hurray !! Deal for you",
          text:  '<div class="top" data-toggle="tooltip" title="Flat 30% on Din-in !">See Offer</div>',
          imageUrl: _restaurantConfig.imageSrc,
          html: true
        });
      }, _autoSuggestTimeFrame)
    }
  }
}]);
