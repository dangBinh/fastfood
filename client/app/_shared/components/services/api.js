angular.module('dLiteMe')
  .service('Modals', ['$rootScope', function ($rootScope) {

  /**
   *  Triggers the opening of the modal window - allows
   *  an options object to be passed, required options
   *  are target & template, any additional data will be
   *  attached to scope and avaliable in the modal
   *  controller and view files.
   *  @param {Object} options
   */
  function _triggerModal (options) {
    $rootScope.$emit('dm:open', options);
  }

  /**
   *  Triggers the close method of the modal window
   */
  function _closeModal () {
    $rootScope.$emit('dm:close');
  }

  // Return the public API
  return {
    trigger: _triggerModal,
    close: _closeModal
  };

}]);
