'use strict';

module.exports = function (app) {
  // User Routes
  var users = require('../controllers/users.server.controller');

  app.route('/api/auth/signup').post(users.signup);
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);
  app.route('/api/auth/forgot').post(users.forgot);
  app.route('/api/auth/reset/:token').get(users.validate);
  app.route('/api/auth/reset/:token').post(users.reset);

  app.route('/api/users/update').put(users.update);
  app.route('/api/users/password').post(users.password);
};
