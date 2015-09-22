'use strict';

var models      = require('../../models'),
    User        = models.Accounts,
    passport    = require('passport'),
    config      = require('../../config/environment'),
    jwt         = require('jsonwebtoken');

var validationError = function (res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 * @param req
 * @param res
 */
exports.index = function (req, res) {
  User.findAll({limit: req.query.limitTo})
    .then( function (err, users) {
      if(err) { return res.send(err) }
      return res.envelope(users);
    });
};

/**
 * Creates a new user
 * @param req
 * @param res
 * @param next
 */
exports.create = function(req, res, next) {
  var newUser = User.build(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  console.log('signing up new user', req.body);
  newUser
    .setPassword(req.body.password)
    .then(function ( user, role) {
      var token = jwt.sign({_id: user._id, role: role }, config.all.secrets.session, { expiredInMinutes: 60*5});
      res.json({token: token});
    }).catch(function(err) {
      if(err) return validationError(res, err);
    })
};

/**
 * Get a single user
 * @param req
 * @param res
 * @param next
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId)
  .then(res.needOne("No user with that ID"))
  .then(res.envelope)
  .catch(res.error);

};

/**
 * Change a users password
 * @param req
 * @param res
 * @param next
 * @private
 */
exports.changePassword = function (req, res, next) {

  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Returns users profile
 * @param req
 * @param res
 * @param next
 */
exports.profile = function (req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.authCallback = function(req, res, next) {
  res.redirect('/');
};



