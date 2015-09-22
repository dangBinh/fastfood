'use strict';

angular.module('dLiteMe')
	.controller('CheckoutCtrl', [
		'$scope',
		'$state',
		'$stateParams',
		'$http',
		'postcodeService',

		function($scope, $state, $stateParams, $http, postcodeService) {
			$scope.checkout = {};
			$scope.cart = localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
			$scope.subtotal = localStorage.getItem('cart_subtotal') ? Number(localStorage.getItem('cart_subtotal')) : 0;
			$scope.total = localStorage.getItem('cart_total') ? Number(localStorage.getItem('cart_total')) : 0;
			$scope.charge = localStorage.getItem('cart_charge') ? Number(localStorage.getItem('cart_charge')) : 2;
			$scope.drivertip = localStorage.getItem('cart_drivertip') ? Number(localStorage.getItem('cart_drivertip')) : 0;
			$scope.validate = {
				address: function() {
					return {
						'errorMessage': 'Please enter address',
						'valid': !!$scope.checkout.address
					}
				},
				postcode: function() {
					if (!$scope.checkout.postcode) {
						return {
							'errorMessage': 'Please enter postcode',
							'valid': false
						}
					} else {
						return {
							'errorMessage': 'Invalid postcode',
							'valid': postcodeService.checkPostCode($scope.checkout.postcode)
						}
					}
				},
				cardnumber: function() {
					if (!$scope.checkout.cardnumber) {
						return {
							'errorMessage': 'Please enter card number',
							'valid': $scope.tab
						}
					} else {
						return {
							'errorMessage': 'Card number is invalid',
							'valid': $scope.tab || ($scope.checkout.cardnumber.length === 16 && !isNaN($scope.checkout.cardnumber))
						}
					}
				},
				date: function() {
					if (!$scope.checkout.month) {
						return {
							'errorMessage': 'Please enter expiry month',
							'valid': $scope.tab
						}
					} else {
						if (!$scope.checkout.year) {
							return {
								'errorMessage': 'Please enter expiry year',
								'valid': $scope.tab
							}
						} else {
							return {
								'errorMessage': 'Expiry date is invalid',
								'valid': $scope.tab || (!isNaN($scope.checkout.year) && $scope.checkout.year > 2014 && $scope.checkout.year === Math.floor($scope.checkout.year) && !isNaN($scope.checkout.month) && $scope.checkout.month < 1 && $scope.checkout.month > 12 && $scope.checkout.month === Math.floor($scope.checkout.month))
							}
						}
					}
				},
				ccv: function() {
					if (!$scope.checkout.ccv) {
						return {
							'errorMessage': 'Please enter CCV',
							'valid': $scope.tab
						}
					} else {
						return {
							'errorMessage': 'CCV is invalid',
							'valid': $scope.tab || (!isNaN($scope.checkout.ccv) && $scope.checkout.ccv.length === 3)
						}
					}
				},
				billing_poscode: function() {
					if (!$scope.checkout.billing_poscode) {
						return {
							'errorMessage': 'Please enter billing postcode',
							'valid': $scope.tab
						}
					} else {
						return {
							'errorMessage': 'Invalid billing postcode',
							'valid': $scope.tab || postcodeService.checkPostCode($scope.checkout.billing_poscode)
						}
					}
				},
				paypal: function() {
					if (!$scope.checkout.paypal) {
						return {
							'errorMessage': 'Please enter paypal',
							'valid': !$scope.tab
						}
					} else {
						var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
						return {
							'errorMessage': 'Email address is invalid',
							'valid': !$scope.tab || re.test($scope.checkout.paypal)
						}
					}
				},
				valid: function() {
					return this.address().valid && this.postcode().valid && this.cardnumber().valid && this.ccv().valid && this.postcode().billing_poscode && this.paypal().valid;
				}
			};

			$scope.checkout = function() {
				$scope.validate.showvalid = {
					address: $scope.validate.address(),
					postcode: $scope.validate.postcode(),
					cardnumber: $scope.validate.cardnumber(),
					billing_poscode: $scope.validate.billing_poscode(),
					ccv: $scope.validate.ccv(),
					paypal: $scope.validate.paypal()
				};
				if ($scope.validate.valid()) {
					$state.go('checkout.success');
				}
			};

			$scope.showTab = function(tab) {
				$scope.tab = tab;
				switch (tab) {
					case 0:
						$('.modal-dialog').removeClass('modal-md').addClass('modal-sm')
						break;
					case 1:
						$('.modal-dialog').removeClass('modal-sm').addClass('modal-md')
						break;
				}

				$scope.validate.showvalid = {
					address: $scope.validate.address(),
					postcode: $scope.validate.postcode(),
					cardnumber: $scope.validate.cardnumber(),
					billing_poscode: $scope.validate.billing_poscode(),
					ccv: $scope.validate.ccv(),
					paypal: $scope.validate.paypal()
				};
			};
		}
	])
	.controller('CheckoutLoginCtrl', function($scope, $log, $state, Auth) {
		$scope.loginUser = {};
    console.log( 'validation' );
		$scope.validate = {
			password: function() {
				return {
          'errorMessage': 'Password is required',
					'valid': !!$scope.loginUser.password
				}
			},
			email: function() {
				if (!$scope.loginUser.email) {
					return {
            'errorMessage': 'Please provide an email',
						'valid': false
					}
				} else {
					var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
					return {
						'errorMessage': 'Email address is invalid',
						'valid': re.test($scope.loginUser.email)
					}
				}
			},
			valid: function() {
				return this.password().valid && this.email().valid;
			}
		};

		$scope.signin = function() {
			$scope.submitted = true;

      $scope.validate.showvalid = {
        email   : $scope.validate.email(),
        password: $scope.validate.password()
      };
			if ($scope.validate.valid()) {
				Auth.login({
						email: $scope.loginUser.email,
						password: $scope.loginUser.password
					})
					.then(function() {
						// Logged in, redirect to home
						$location.path('/');
					})
					.catch(function(err) {
						$scope.errors = err.message;
					});
				$state.go('checkout.info');
			} else {
				$log.error('form not valid');
			}
		};

		$scope.loginOauth = function(provider) {
			$window.location.href = '/auth/' + provider;
		};
	});
