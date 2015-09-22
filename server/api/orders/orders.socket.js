/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Orders = require('../../models/orders');

exports.register = function(socket) {
  socket.on('save', function (doc) {
    onSave(socket, doc);
  });
  socket.on('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('orders:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('orders:remove', doc);
}
