'use strict';

angular
	.module('dLiteMe')
	.controller('headerCtrl', ['$rootScope', '$scope', '$modal', function($rootScope, $scope, $modal) {
		var _restaurantModalInstance;
		$scope.openRestaurantModal = function() {
			_restaurantModalInstance = $modal.open({
				animation: true,
				templateUrl: 'app/restaurants/restaurants.html',
				controller: 'restaurantsCtrl'
			});
		};
		
		$rootScope.cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
		
		$scope.countCartItem = function() {
			var total = 0;
			angular.forEach($scope.cart, function(item) {
				total += item.quantity;
			});
			return total;
		};
	}]);
