var util   = require('util'),
    config = require('../config'),
    moment = require('moment'),
    Reset = "\x1b[0m";
    Bright = "\x1b[1m";
    Dim = "\x1b[2m";
    Underscore = "\x1b[4m";
    Blink = "\x1b[5m";
    Reverse = "\x1b[7m";
    Hidden = "\x1b[8m";

    FgBlack = "\x1b[30m";
    FgRed = "\x1b[31m";
    FgGreen = "\x1b[32m";
    FgYellow = "\x1b[33m";
    FgBlue = "\x1b[34m";
    FgMagenta = "\x1b[35m";
    FgCyan = "\x1b[36m";
    FgWhite = "\x1b[37m";
    
    BgBlack = "\x1b[40m";
    BgRed = "\x1b[41m";
    BgGreen = "\x1b[42m";
    BgYellow = "\x1b[43m";
    BgBlue = "\x1b[44m";
    BgMagenta = "\x1b[45m";
    BgCyan = "\x1b[46m";
    BgWhite = "\x1b[47m";

/**
 *  Outputs a info log message
 */
module.exports.info = function logInfo () {
  var message = util.format.apply(this, arguments) + '\n';
  process.stdout.write('CHANGE TO LOGGER: ' + message);
};

/**
 *  Outputs a error log message
 */
module.exports.error = function logInfo () {
  var message = util.format.apply(this, arguments) + '\n';
  process.stdout.write('CHANGE TO LOGGER: ' + message);
};

/**
 *  Outputs a warning log message
 */
module.exports.warn = function logInfo () {
  var message = util.format.apply(this, arguments) + '\n';
  process.stdout.write('CHANGE TO LOGGER: ' + message);
};

// /**
//  *  Creates the pre message text colors and stuff
//  *  @param {String} type
//  */
// function preStr (type) {
//   var color, space, time;
//   switch (type) {
//     case 'error':
//       color = FgRed;
//       space = ' ';
//       break;
//     case 'warn':
//       color = FgYellow;
//       space = '  ';
//       break;
//     default:
//       color = FgBlue;
//       space = '  ';
//       break;
//   }
//   time = FgGreen + '[' + moment().format('HH:mm:ss') + '] ';
//   return time + color + '[' + type + ']' + space + Reset;
// }