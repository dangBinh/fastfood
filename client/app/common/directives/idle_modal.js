var app = angular.module('dLiteMe');

app.directive('idleModal', ['$modal', function($modal) {
	return {
		restrict: 'EA',
		link: function(scope, element, attributes) {
			var idleTime = 0,
				showModal = function() {
					$modal.open({
						templateUrl: attributes.template,
						size: 'md'
					});
				},
				idleInterval = setInterval(function() {
					idleTime++;
					if (idleTime === Number(attributes.timing)) {
						showModal();
					}
				}, 1000);

			$(this).mousemove(function(e) {
				idleTime = 0;
			});
			$(this).keypress(function(e) {
				idleTime = 0;
			});
		}
	}
}]);
