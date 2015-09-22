'use strict';

var express = require('express');
var controller = require('./orders.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/home', controller.getFew);
router.get('/orderStartStop', controller.calculateOrderStartStopPosition);
router.get('/:id', controller.show);
router.post('/', controller.create);

module.exports = router;
