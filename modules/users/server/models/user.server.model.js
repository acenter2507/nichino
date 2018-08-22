'use strict';

/**
 * Module dependencies
 */
var mongoose = require('mongoose'),
  path = require('path'),
  paginate = require('mongoose-paginate'),
  config = require(path.resolve('./config/config')),
  Schema = mongoose.Schema,
  crypto = require('crypto'),
  validator = require('validator'),
  chalk = require('chalk');

/**
 * A Validation function for username
 * - at least 3 characters
 * - only a-z0-9_-.
 * - contain at least one alphanumeric character
 * - not in list of illegal usernames
 * - no consecutive dots: "." ok, ".." nope
 * - not begin or end with "."
 */
// var validateUsername = function (username) {
//   var usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;
//   return (
//     this.provider !== 'local' ||
//     (username && usernameRegex.test(username) && config.illegalUsernames.indexOf(username) < 0)
//   );
// };
var validateLocalStrategyEmail = function (email) {
  if (!email.length) return true;
  return validator.isEmail(email);
};

/**
 * User Schema
 */
var UserSchema = new Schema({
  // 氏名
  name: { type: String, default: '' },
  // ユーザーID
  username: { type: String, lowercase: true, trim: true, unique: 'ユーザー名は既に存在します' },
  // パスワード
  password: { type: String, default: '' },
  // 端末リスト
  devices: [{
    deviceId: { type: String },
    logins: [{ type: Date }],
    description: { type: String }
  }],
  // メール
  email: {
    type: String, lowercase: true, trim: true, default: '',
    validate: [validateLocalStrategyEmail, 'Please fill a valid email address']
  },
  // 役割
  roles: {
    type: [{
      type: String,
      enum: ['user', 'manager', 'admin']
    }],
    default: ['user'],
    required: true
  },
  // 小売店
  store: { type: Schema.ObjectId, ref: 'Store' },
  // ログインログ
  logins: [{ type: Date }],
  // System info
  updated: { type: Date },
  created: { type: Date, default: Date.now },
  salt: { type: String },
  // Manager info
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});
UserSchema.plugin(paginate);

UserSchema.pre('save', function (next) {
  if (this.password && this.isModified('password')) {
    this.salt = crypto.randomBytes(16).toString('base64');
    this.password = this.hashPassword(this.password);
  }
  next();
});

UserSchema.methods.hashPassword = function (password) {
  if (this.salt && password) {
    return crypto.pbkdf2Sync(password, new Buffer(this.salt, 'base64'), 10000, 64, 'SHA1').toString('base64');
  } else {
    return password;
  }
};

UserSchema.methods.authenticate = function (password) {
  return this.password === this.hashPassword(password);
};

UserSchema.statics.generateRandomPassphrase = function () {
  return new Promise(function (resolve, reject) {
    var password = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&@';
    for (var i = 0; i < 8; i++) {
      password += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return resolve(password);
  });
};
// ユーザーに小売店情報を割り当てる
UserSchema.statics.setStore = function (userId, storeId) {
  return new Promise(function (resolve, reject) {
    return this.findById(userId).exec((err, user) => {
      // ユーザー情報が見つからない
      if (err || !user) return reject({ message: 'ユーザー情報が見つかりません！' });
      // 既に小売店が割り当てされた
      if (user.store) return reject({ message: '既に小売店が割り当てされました！' });
      user.store = storeId;
      return user.save();
    });
  });
};

UserSchema.statics.seed = seed;
mongoose.model('User', UserSchema);

/**
* Seeds the User collection with document (User)
* and provided options.
*/
function seed(doc, options) {
  var User = mongoose.model('User');

  return new Promise(function (resolve, reject) {

    skipDocument()
      .then(add)
      .then(function (response) {
        return resolve(response);
      })
      .catch(function (err) {
        return reject(err);
      });

    function skipDocument() {
      return new Promise(function (resolve, reject) {
        User.findOne({ username: doc.username }).exec(function (err, user) {
          if (err) return reject(err);
          if (!user) return resolve(false);
          if (user && !options.overwrite) return resolve(true);

          // Remove User (overwrite)
          user.remove(function (err) {
            if (err) return reject(err);
            return resolve(false);
          });
        });
      });
    }

    function add(skip) {
      return new Promise(function (resolve, reject) {
        if (skip)
          return resolve({ message: chalk.yellow('ユーザー情報作成: User\t\t' + doc.username + ' skipped') });

        User.generateRandomPassphrase()
          .then(function (passphrase) {
            var user = new User(doc);
            user.password = passphrase;
            user.save(function (err) {
              if (err) return reject(err);
              return resolve({ message: 'ユーザーID： ' + user.username + ' ・パスワード： ' + passphrase });
            });
          })
          .catch(function (err) { return reject(err); });
      });
    }

  });
}
