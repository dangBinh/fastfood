var log = require('./logger');

/**
 *  Emits an event via proccess.emit, this should then be picked up by the pusher
 *  event handler to set the notification to the UI
 *  @param {String} evt
 *  @param {Object} data
 *  @param {Object} id
 */
module.exports = function sendNotification (evt, data, id) {
  if (typeof id.toString === 'function') {
    id = id.toString();
  }  
  if (typeof id === 'string' && id !== '') {
    data.user = id;
    process.emit(evt, data);
  } else {
    log.warn('No user id given for: "%s"', evt);
  }
};