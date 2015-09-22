'use strict';

angular.module('dLiteMe')
	.controller('SignupCtrl', function($scope, Auth, $location, postcodeService) {
		$scope.user = {};
		$scope.errors = {};


		$scope.SignUpFromModal = function(form) {}

		$scope.validate = {
			username: function() {
				return {
					'errorMessage': 'Please enter username',
					'valid': !!$scope.user.username
				}
			},
			password: function() {
        if( !$scope.user.password ) {
          return {
            'errorMessage': 'Please enter password',
            'valid'       : !!$scope.user.password
          }
        }
			},
			email: function() {
				if (!$scope.user.email) {
					return {
						'errorMessage': 'Please enter email',
						'valid': false
					}
				} else {
					var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
					return {
						'errorMessage': 'Email address is invalid',
						'valid': re.test($scope.user.email)
					}
				}
			},
			postcode: function() {
				if (!$scope.user.postcode) {
					return {
            'errorMessage': 'Please provide your postcode',
						'valid': false
					}
				} else {
					return {
						'errorMessage': 'Invalid postcode',
						'valid': postcodeService.checkPostCode($scope.user.postcode)
					}
				}
			},
			screenname: function() {
				return {
          'errorMessage': 'Please enter your full name',
					'valid': !!$scope.user.screenname
				}
			},
			valid: function() {
				return this.username().valid && this.password().valid && this.email().valid && this.postcode().valid && this.screenname().valid;
			}
		};

		$scope.signup = function() {
			$scope.submitted = true;

			$scope.validate.showvalid = {
				username: $scope.validate.username(),
				password: $scope.validate.password(),
				email: $scope.validate.email(),
				postcode: $scope.validate.postcode(),
				screenname: $scope.validate.screenname()
			};
			if ($scope.validate.valid()) {
				Auth.createUser({
						userName: $scope.user.username,
						userEmail: $scope.user.email,
						userPassword: $scope.user.password,
						userScreenName: $scope.user.screenname,
						userPostCode: $scope.user.postcode
					})
					.then(function() {
						// Account created, redirect to home
						$location.path('/');
					})
					.catch(function(err) {
						err = err.data;
						$scope.errors = {};

						// Update validity of form fields that match the mongoose errors
						angular.forEach(err.errors, function(error, field) {
							// form[field].$setValidity('mongoose', false);
							$scope.errors[field] = error.message;
						});
					});
			}
		};

		$scope.register = function(form) {
			$scope.submitted = true;

			if (form.$valid) {
				Auth.createUser({
						name: $scope.user.name,
						email: $scope.user.email,
						password: $scope.user.password
					})
					.then(function() {
						// Account created, redirect to home
						$location.path('/');
					})
					.catch(function(err) {
						err = err.data;
						$scope.errors = {};

						// Update validity of form fields that match the mongoose errors
						angular.forEach(err.errors, function(error, field) {
							form[field].$setValidity('mongoose', false);
							$scope.errors[field] = error.message;
						});
					});
			}
		};

	});
