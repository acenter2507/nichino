'use strict';

module.exports = function (app) {
  var users = require('../controllers/users.server.controller');

  // ウェッブ版のみ
  app.route('/api/auth/signin').post(users.signin);
  app.route('/api/auth/signout').get(users.signout);
  app.route('/api/users/password').post(users.password);
  app.route('/api/users/information').get(users.information);
  app.route('/api/users/update').put(users.update);

  // 農家のモバイル版のみ
  app.route('/api/mobile/auth/device').post(users.m_device); // 農家のデバイスの初回ロード
  app.route('/api/mobile/auth/link').post(users.m_link); // 農家のデバイス同期のリクエスト
  app.route('/api/mobile/auth/signup').post(users.m_signup); // 農家がデバイス同期のためアカウントを作成する

  // マネージャーのモバイル版のみ
  app.route('/api/mobile/auth/signin').post(users.m_signin);

  // app.route('/api/auth/forgot').post(users.forgot);
  // app.route('/api/auth/reset/:token').get(users.validate);
  // app.route('/api/auth/reset/:token').post(users.reset);
};
