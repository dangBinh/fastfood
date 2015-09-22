var app = angular.module('dLiteMe');
app.factory('Checkout', [
	'$rootScope',
	'socketFactory',
	'api', //why did you comment out api? yet you're using it in the dependency??
	'queryString',
	function($rootScope, socketFactory, $api, queryString) {
		return {}
	}
]);
