'use strict';

angular.module('dLiteMe')
	.controller('MerchantsMenuCtrl', [
		'$rootScope',
		'$scope',
		'$state',
		'$stateParams',
		'$http',
		'$modal',
		'postcodeService',
		'merchantService',
		function($rootScope, $scope, $state, $stateParams, $http, $modal, postcodeService, merchantService) {
			$rootScope.merchants = JSON.parse(window.atob(localStorage.getItem('merchants')));
			var i = 0;
			while ($rootScope.merchants[i] && $rootScope.merchants[i].type_id !== Number($stateParams.id)) {
				i++;
			}

			if ($rootScope.merchants[i]) {
				$scope.merchant = $rootScope.merchants[i];
			} else {
				$scope.merchant = {
					type_charges: 2
				};
			}

			$rootScope.cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
			$rootScope.subtotal = localStorage.getItem('cart_subtotal') ? Number(localStorage.getItem('cart_subtotal')) : 0;
			$rootScope.total = localStorage.getItem('cart_total') ? Number(localStorage.getItem('cart_total')) : 0;
			$rootScope.charge = $scope.merchant.type_charges;
			$rootScope.drivertip = localStorage.getItem('cart_drivertip') ? Number(localStorage.getItem('cart_drivertip')) : 0;


			/*
				Get merchant's categories list
       */
			$scope.categories = [];

			var options = {
				id: $stateParams.id
			};

			merchantService.getCategories(options)
				.then(function(result) {
					if (result.statusCode == 200) {
						$scope.categories = result.data;
						angular.forEach($scope.categories, function(category) {
							category.visible = true;
						});
					} else {
						alert(result.msg);
					}
				});


			/*
				Get merchant item information
			*/
			$scope.merchant = [];
			merchantService.get($stateParams.id)
				.then(function(result) {
					if (result.statusCode == 200) {
						$scope.merchant = result.data;
						$scope.opening_hours = JSON.parse($scope.merchant.opening_hours);
						$scope.categories_menu = {};
						angular.forEach($scope.merchant.Items, function(item) {
							if (!$scope.categories_menu[item.Category.category_id]) {
								$scope.categories_menu[item.Category.category_id] = [];
							}
							$scope.categories_menu[item.Category.category_id].push(item);
						});
					} else {
						alert(result.msg);
					}
				});

			$scope.today = new Date().format('dddd');

			// caluclate cart
			$scope.calculate = function() {
				$rootScope.subtotal = 0;
				$rootScope.total = 0;
				angular.forEach($rootScope.cart, function(item) {
					$rootScope.subtotal += item.quantity * item.price;
				});
				$rootScope.total = $rootScope.subtotal + $rootScope.drivertip + $rootScope.charge;
				localStorage.setItem('cart', JSON.stringify($rootScope.cart));
				localStorage.setItem('cart_subtotal', $rootScope.subtotal);
				localStorage.setItem('cart_total', $rootScope.total);
				localStorage.setItem('cart_charge', $rootScope.charge);
				localStorage.setItem('cart_drivertip', $rootScope.drivertip);
			};

			$scope.calculate();

			$scope.add = function(menu) {
				var ext = false;
				for (var i in $rootScope.cart) {
					if ($rootScope.cart[i].id === menu.id) {
						$rootScope.cart[i].quantity++;
						ext = true;
						break;
					}
				}
				if (!ext) {
					$rootScope.cart.push({
						'id': menu.item_id,
						'name': menu.item_name,
						'price': menu.item_price,
						'quantity': 1
					});
				}
				$scope.calculate();
			};

			$scope.remove = function(key) {
				if ($rootScope.cart[key].quantity === 1) {
					$rootScope.cart.splice(key, 1);
				} else {
					$rootScope.cart[key].quantity--;
				}
				$scope.calculate();
			};

			$scope.addDriverTip = function() {
				$rootScope.drivertip++;
				$scope.calculate();
			};

			$scope.reduceDriverTip = function() {
				$rootScope.drivertip--;
				if ($rootScope.drivertip < 0) {
					$rootScope.drivertip = 0;
				}
				$scope.calculate();
			};

			$scope.open = function(index) {
				var modalInstance = $modal.open({
					animation: $scope.animationsEnabled,
					templateUrl: 'app/merchants/description.html',
					controller: 'MerchantsDescriptionCtrl',
					size: 'md',
					resolve: {
						comment: function() {
							console.log($rootScope.cart[index].comment);
							return $rootScope.cart[index].comment;
						}
					}
				});

				modalInstance.result.then(function(response) {
					$rootScope.cart[index].comment = response;
					$scope.calculate();
				});
			};

			$scope.toggleAnimation = function() {
				$scope.animationsEnabled = !$scope.animationsEnabled;
			};

			$scope.allCategories = function() {
				for (var i in $scope.categories) {
					if (!$scope.categories[i].visible) {
						$scope.allCategoriesShow = false;
						return false;
					}
				}
				$scope.allCategoriesShow = true;
				return true;
			};

			$scope.toggleAllCategories = function() {
				if ($scope.allCategories()) {
					angular.forEach($scope.categories, function(category) {
						category.visible = false;
					});
				} else {
					angular.forEach($scope.categories, function(category) {
						category.visible = true;
					});
				}
			};


		}
	]);
