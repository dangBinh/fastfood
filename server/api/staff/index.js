'use strict';

var express = require('express');
var controller = require('./staff.controller');

var router = express.Router();

// router.put('/:id', controller.update);
router.put('/updateLocation', controller.updateLocation);
router.put('/changeStatus', controller.changeStatus);
router.get('/nearestByPostcode', controller.getNearest);

module.exports = router;