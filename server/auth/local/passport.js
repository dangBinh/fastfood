var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
      User.findOne({
        where: {
          email: email.toLowerCase()
        }
      }).then( function (user) {
        if(!user) {
          return done(null, false, {message: 'This email is not registered'});
        }
        if(!user.authenticate(password)) {
          return done(null, false, { message: 'Looks like your password is not correct. Please try again'});
        }
        return done(null, user);
      })
    }
  ))
}
