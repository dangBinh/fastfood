var util      = require('util'),
    moment    = require('moment'),
    cluster   = require('cluster'),
    chars     = require('./chars'),
    debugMode = false;

/**
 * Logger
 * Logs messages.
 * @param  {Boolean} debugMode
 */
function logger () {
  var req, preText, method, url, message;
  if (!debugMode && this.type !== 'sys') return;

  // Build the message
  message = chars.FgGreen + '[' + moment().format('HH:mm:ss') + '] ' +
            this.color + '[' + this.type + '#' + this.postType + ']' +
            this.space + chars.Reset + 
            util.format.apply(this, arguments) + '\n';

  // Log to the console
  process.stdout.write(message);
}

/**
 * Log Wrapper
 * Returns a customised logger function.
 * @param  {String} type
 * @return {Function}
 */
function logWrapper (type) {
  var color, space, postType;
  switch (type) {
    // Red
    case 'error':
      color = chars.FgRed;
      space = ' ';
    break;

    // Cyan
    case 'route':
      color = chars.FgCyan;
      space = ' ';
    break;
    case 'sys':
      color = chars.FgCyan;
      space = '   ';
    break;

    // Yellow
    case 'warn':
      color = chars.FgYellow;
      space = '  ';
    break;

    // Blue
    case 'debug':
      color = chars.FgBlue;
      space = ' ';
    break;
    case 'info':
      color = chars.FgBlue;
      space = '  ';
    break;
    default:
      color = chars.FgBlue;
      space = '  ';
    break;
  }

  // Determine whether we're a master or child process
  postType = (cluster.isMaster) ? 'M' : 'C';

  // Bind required scope variables
  // and return logger function
  return logger.bind({
    color: color,
    postType: postType,
    space: space,
    type: type
  });
}

var Logger = module.exports = function (debug) {
  // Set debug mode
  debugMode = (debug === true || debug === 'true') ? true : false;
  
  // Return logger methods
  return {
    debug:    logWrapper('debug'),
    err:      logWrapper('error'),
    error:    logWrapper('error'),
    info:     logWrapper('info'),
    route:    logWrapper('route'),
    router:   logWrapper('route'),
    sys:      logWrapper('sys'),
    system:   logWrapper('sys'),
    warn:     logWrapper('warn'),
    warning:  logWrapper('warn')
  };
};