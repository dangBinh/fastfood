var app = angular.module('dLiteMe');

app.directive('validationInput', ['$timeout', function($timeout) {
	return {
		restrict: 'EA',
		scope: {
			callback: "&callback",
			showvalid: '=showvalid'
		},
		link: function(scope, element, attributes) {
			$(element).addClass('validation-input');
			$input = $(element).find('input');
			$input.after('<div class="validation-icon"><i class="fa"></i></div>');
			$input.after('<div class="error-message text-danger"></div>');

			scope.$watch('showvalid', function(value) {
				console.log(scope.showvalid);
				if (value) {
					showStatus(value);
				}
			});

			var showStatus = function(valid) {
					if (valid.valid) {
						$(element).find('.validation-icon').removeClass('text-danger').addClass('text-success');
						$(element).find('.validation-icon i.fa').removeClass('fa-times').addClass('fa-check');
						$(element).find('.error-message').html('');
						$(element).removeClass('has-error').addClass('is-valid');
					} else {
						$(element).find('.validation-icon').removeClass('text-success').addClass('text-danger');
						$(element).find('.validation-icon i.fa').removeClass('fa-check').addClass('fa-times');
						if (valid.errorMessage) {
							$(element).addClass('has-error').removeClass('is-valid');
							$(element).find('.error-message').html(valid.errorMessage);
						}
					};
				},
				validate = function() {
					if ($(element).find('input').val() || attributes.required) {
						var valid = scope.callback()();
						showStatus(valid);
					} else {
						$(element).removeClass('has-error').removeClass('is-valid');
						$(element).find('.validation-icon').removeClass('text-danger').removeClass('text-success');
						$(element).find('.validation-icon i.fa').removeClass('fa-times').removeClass('fa-check');
					}
				},
				action = function() {
					if ($input.css('padding-top')) {
						var height = $input.height() + Number($input.css('padding-top').split('px')[0]) + Number($input.css('padding-bottom').split('px')[0]);
						if (height) {
							$input.on('keyup', function() {
								validate();
							});
							$input.on('change', function() {
								validate();
							});
						} else {
							$timeout(action, 100);
						}
					} else {
						$timeout(action, 100);
					}
				}
			action();
		}
	}
}]);
