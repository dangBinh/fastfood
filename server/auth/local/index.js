'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user) {
    console.log(user.dataValues);
    var error = err;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, theres no user.'});

    // There is no userRole yet, but just in case then we have it here too
    var token = auth.signToken(user.id, user.userRole);
    res.json({
      success: true,
      message: 'Successfully generated token',
      token: token
    });
  })(req, res, next)
});

module.exports = router;
