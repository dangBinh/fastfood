angular.module("consoleDebug", [])
  .provider('$debug', function () {

    // Logger's state
    this.enabled = false;
    this.level   = 'debug';
    this.levels  = {
      error: 1,
      warn:  2,
      info:  3,
      log:   4,
      debug: 5
    };

    // allows us to enable / disable console logs
    this.enable = function (bool) {
      this.enabled = bool;
    };

    // Sets the logging level
    this.level = function (type) {
      this.level = type;
    };

    // Return the provider object
    this.$get = function () {
      var enabled = this.enabled;
      var levels  = this.levels;
      var level   = this.level;

      /**
       *  checks if it is allowed to log to the console
       *  @param   {String}  name
       *  @param   {Boolean} override
       *  @returns {Boolean}
       */
      function canLog (name, override) {
        return (enabled && levels[name] <= levels[level] ||
        override && levels[name] <= levels[level]);
      }

      /**
       * Sets up the logging method and passes the module name, and
       * override enabled value
       * @param   {String}   name
       * @param   {String}   module
       * @param   {Boolean}  override
       * @returns {Function}
       */
      function method (name, module, override) {
        /**
         *  Log method - Accepts any number of arguments
         *  @param {*}
         *
         */
        return function _debugLogger () {
          if (canLog(name, override))  {
            // Adds the module name as the first argument of the log the message
            // Array.prototype.unshift.call(arguments, { module: module });
            Array.prototype.unshift.call(arguments, module);
            console.log.apply(console, arguments);
          }
        };
      }

      /**
       *  Debugger class
       *  @param {String}  module
       *  @param {Boolean} isEnabled
       */
      var deBugger = function (module, isEnabled) {
        return {
          log:   method('log', module, isEnabled),
          info:  method('info', module, isEnabled),
          error: method('error', module, isEnabled),
          warn:  method('warn', module, isEnabled),
          debug: method('debug', module, isEnabled)
        };
      };

      // Return the debug class
      return deBugger;

    };

  });
