'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  fileHandler = require(path.resolve('./modules/core/server/controllers/files.server.controller'));

exports.create = function (req, res) {
  var user = new User(req.body);
  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(user);
    }
  });
};
/**
 * Show the current user
 */
exports.read = function (req, res) {
  res.json(req.model);
};

/**
 * Update a User
 */
exports.update = function (req, res) {
  var user = req.model;

  // For security purposes only merge these parameters
  user.name = req.body.name;
  user.username = req.body.username;
  user.password = req.body.password;
  user.roles = req.body.roles;
  user.email = req.body.email;

  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(user);
  });
};

/**
 * Delete a user
 */
exports.delete = function (req, res) {
  var user = req.model;
  var store = user.store;
  var existingImageUrl = '';
  if (store.image) {
    existingImageUrl = store.image;
  }
  removeStore(store)
    .then(function () {
      if (existingImageUrl) {
        return fileHandler.deleteOldFile(existingImageUrl);
      }
      return null;
    })
    .then(function () {
      return removeUser(user);
    })
    .then(function () {
      res.json({ message: 'アカウントの削除が完了しました。' });
    })
    .catch(function (err) {
      res.status(422).send(err);
    });

  function removeStore(store) {
    return new Promise(function (resolve, reject) {
      if (store) {
        store.remove(function (err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }

  function removeUser(user) {
    return new Promise(function (resolve, reject) {
      user.remove(function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

/**
 * List of Users
 */
exports.list = function (req, res) {
  User.find({}, '-salt -password').sort('-created').populate('user', 'username').exec(function (err, users) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    }

    res.json(users);
  });
};

/**
 * User middleware
 */
exports.userByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ユーザーの情報が見つかりません。'
    });
  }

  User.findById(id, '-salt -password -providerData').populate('store', '-description').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) {
      return next(new Error('Failed to load user ' + id));
    }

    req.model = user;
    console.log('​exports.userByID -> user', user);
    next();
  });
};
