angular.module("dLite.Modals.View", [])

/**
 *  Dynamic modal window directive this will allow you to
 *  open a dynamic modal window that allows you pass in
 *  a template and target scope via an event to open the
 *  modal window.
 */
.directive('dynamicModals', [
  '$rootScope',
  '$timeout',
  '$debug',
  function($rootScope, $timeout, $debug) {
    var debug = $debug('Modals: ', false);
    return {
      restrict: 'AE',
      replace: true,
      template: '<div data-ng-include="modal.template" data-onload="triggerModal()"></div>',
      scope: {},
      link: function (scope, elm, attrs) {
        var oldTemplate;

        var modal       = '#dynamicModal';
        var options     = {
          backdrop: 'static',
          keyboard: false
        };

        // Modal object
        scope.modal = {};

        // We need to attatch an event to all modal backdrops as they need to trigger
        // our custom close event
        $(document).click(function (e) {
          if (e.target === $('#dynamicModal')[0] && $('body').hasClass('modal-open')) {
            $rootScope.modals.close();
          }
        });

        /**
         *  Opens the modal window
         */
        scope.triggerModal = function () {
          // Trigger an event for the modal - this can be used to load additional
          // data once the modal is opened
          $rootScope.$emit('dm:loaded');
          // Now open the modal window
          $(modal).modal(options).modal('show');
        };

        /**
         *  Opens the modal window with the new scope data
         *  @param {Object} data
         */
        function openModalWindow(data) {
          scope.modal = angular.copy(data);
          if (angular.equals(scope.modal.template, oldTemplate)) {
            scope.triggerModal();
          } else {
            oldTemplate = scope.modal.template;
          }
        }

        /**
         *  Tries to rest the scope of the modal window
         *  @param {Object}   data
         *  @param {Function} callbck
         */
        function resetModalScope(data, callback) {
          var self      = this;
          var modalCtrl = angular.element('#dynamicModal').scope();
          // If the controller is defined and the templates have changed we want to destroy the scope so we
          // are able to attatch a new controller and template
          if (typeof oldTemplate !== 'undefined' && angular.equals(data.template, oldTemplate) === false) {
            if (typeof modalCtrl !== 'undefined' ) modalCtrl.$destroy();
          }
          // If the template has not changed we do not want to destroy the scope as the modal window
          // will stop working, so we will just call a reset method if one exists
          else {
            if (typeof modalCtrl !== 'undefined' && typeof modalCtrl.reset === 'function') {
              modalCtrl.reset();
            }
          }
          return callback();
        }

        /**
         *  Destroys all modal windows
         *  @param {Object}   data
         *  @param {Function} callback
         */
        function destroyModals (data, callback) {
          resetModalScope(data, function () {
            $(modal).modal('hide').removeData('modal');
            $timeout(function () {
              scope.modal.template = "";
              callback.call(this);
            });
          });
        }

        // Event for closing the modal window
        $rootScope.$on("dm:close", function (e) {
          var data = { template: oldTemplate }; // please do not edit this line ben...
          destroyModals(data, function () {
            debug.log('Modal closed');
          });
        });

        // Trigger event to open the modal window
        $rootScope.$on('dm:open', function (e, data) {
          // Destroy any previous modals
          destroyModals(data, function () {
            return openModalWindow(data);
          });
        });
      }
    };
  }
]);
