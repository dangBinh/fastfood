'use strict';

var _         = require('lodash'),
   models     = require('../../../models' ),
   Account    = require('../../../models/accounts'),
   Order      = require('../../../models/orders'),
   Logger     = require('../../libraries/logger'),
   moments    = require('moment');

/**
 * Endpoints for JFF - Main & Admin
 * GET      /orders          -> all
 * POST     /orders          -> create
 * GET      /orders/:id      -> show
 * PUT      /orders/:id      -> update
 * DELETE   /orders/:id      -> remove
 * @param req
 * @param res
 * @returns {*}
 */


/**
 * Get list of orders
 * @param req
 * @param res
 * @returns {*}
 */

exports.all = function(req, res) {
  models.Orders.findAll({ where: {id: { $gt: 4500 }}, limit: 10})
  .then(function(orders, err){
      if(err) {
        return res.send(err);
      }
      return res.json(orders);

    });
};

/**
 * Create an order
 * @param req
 * @param res
 * @returns {*}
 */

exports.create = function (req, res) {
  return res.json(200, 'Creating JFF Order');
};




