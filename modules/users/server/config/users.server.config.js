'use strict';

/**
 * Module dependencies
 */
var passport = require('passport'),
  User = require('mongoose').model('User'),
  path = require('path'),
  config = require(path.resolve('./config/config'));

/**
 * Module init function
 */
module.exports = function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function (id, done) {
    User.findOne({
      _id: id
    }, '-salt -password', function (err, user) {
      done(err, user);
    });
  });
  config.utils.getGlobbedPaths(path.join(__dirname, './strategies/**/*.js')).forEach(function (strategy) {
    require(path.resolve(strategy))(config);
  });
  app.use(passport.initialize());
  app.use(passport.session());
};
