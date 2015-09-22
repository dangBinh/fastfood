'use strict';

angular.module('dLiteMe')
	.controller('LoginCtrl', function($scope, Auth, $location, $modal, $log) {
		$scope.user = {};
		$scope.errors = {};
		$scope.remember_me = true;

		$scope.login = function(form, size) {
			var modalInstance = $modal.open({
				//animation: true,
				templateUrl: 'app/modals/login.html',
				controller: 'LoginModalCtrl',
				size: size,
			});
			modalInstance.result.then(function() {
				console.log('result here');
				// Modal is opened here
			});
		};
	})
	.controller('LoginModalCtrl', function($scope, $modalInstance, $log, Auth) {
		$scope.user = {};
		$scope.showError = false; // a flag to hide the message and just show it when user click on signup
		$scope.errorMsg = "";

		$scope.signin = function() {
			$log.info('Submitting user info.');
			$scope.showError = true;

			if (this.modalForm.$valid) {
				$log.info('form is valid', $scope.user.email);
				Auth.login({
						email: $scope.user.email,
						password: $scope.user.password
					})
					.then(function(res) {
						$modalInstance.close(true);
					})
					.catch(function(err){
						$scope.errorMsg = err.message;
					});
			}
		};

		$scope.cancel = function() {
			$modalInstance.dismiss('cancel');
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
		};
	});
