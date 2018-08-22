'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Store = mongoose.model('Store'),
  User = mongoose.model('User'),
  fs = require('fs'),
  _ = require('lodash'),
  config = require(path.resolve('./config/config')),
  multer = require('multer'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  fileHandler = require(path.resolve('./modules/core/server/controllers/files.server.controller'));

/**
 * Create an store
 */
exports.create = function (req, res) {
  var username = req.body.account.username;
  var password = req.body.account.password;
  if (!username) {
    return res.status(422).send({
      message: 'ユーザー名を入力してください'
    });
  }
  if (!password) {
    return res.status(422).send({
      message: 'パスワードを入力してください'
    });
  }
  inserUser(username, password)
    .then(function (account) {
      var store = new Store(req.body);
      store.account = account;

      store.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(store);
        }
      });
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Show the current store
 */
exports.read = function (req, res) {
  // convert mongoose document to JSON
  var store = req.store ? req.store.toJSON() : {};
  store.isCurrentUserOwner = !!(req.account && store.account && store.account._id.toString() === req.user._id.toString());

  res.json(store);
};

/**
 * Update an store
 */
exports.update = function (req, res) {
  var username = req.body.account.username;
  var password = req.body.account.password;
  var store = req.store;
  if (!username) {
    return res.status(422).send({
      message: 'ユーザー名を入力してください'
    });
  }

  getUser(store.account._id)
    .then(function (user) {
      return updateUser(user, username, password);
    })
    .then(function () {
      store.name = req.body.name;
      store.description = req.body.description;
      store.openingHours = req.body.openingHours;
      store.image = req.body.image;
      store.tel = req.body.tel;
      store.zipCode = req.body.zipCode;
      store.address = req.body.address;
      store.save(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(store);
        }
      });
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * Delete an store
 */
exports.delete = function (req, res) {
  var store = req.store;
  getUser(store.account._id)
    .then(function (user) {
      return removeUser(user);
    })
    .then(function () {
      return fileHandler.deleteOldFile(store.image);
    })
    .then(function () {
      store.remove(function (err) {
        if (err) {
          return res.status(422).send({
            message: errorHandler.getErrorMessage(err)
          });
        } else {
          res.json(store);
        }
      });
    })
    .catch(err => {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    });
};

/**
 * List of Stores
 */
exports.list = function (req, res) {
  Store.find().sort('-created').populate('account', 'username').exec(function (err, stores) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(stores);
    }
  });
};

/**
 * Store middleware
 */
exports.storeByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: '店名の情報が見つかりません！'
    });
  }

  Store.findById(id).populate('account', 'username').exec(function (err, store) {
    if (err) {
      return next(err);
    } else if (!store) {
      return res.status(404).send({
        message: '店名の情報が見つかりません！'
      });
    }
    req.store = store;
    next();
  });
};


exports.changePicture = function (req, res) {
  var store = req.store;
  var existingImageUrl;
  var multerConfig = config.uploads.stores;
  // Filtering to upload only images
  multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;
  var upload = multer(multerConfig).single('image');

  if (store) {
    existingImageUrl = store.image;
    uploadImage()
      .then(updateStore)
      .then(function () {
        return fileHandler.deleteOldFile(existingImageUrl);
      })
      .then(function () {
        res.json(store);
      })
      .catch(function (err) {
        res.status(422).send(err);
      });
  } else {
    res.status(401).send({
      message: '店名が必要です。'
    });
  }

  function uploadImage() {
    return new Promise(function (resolve, reject) {
      upload(req, res, function (uploadError) {
        if (uploadError) {
          reject(errorHandler.getErrorMessage(uploadError));
        } else {
          resolve();
        }
      });
    });
  }

  function updateStore() {
    return new Promise(function (resolve, reject) {
      store.image = '/' + req.file.path;
      store.save(function (err, result) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

function getUser(id) {
  return new Promise(function (resolve, reject) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reject({
        message: 'アカウントの情報が見つかりません！'
      });
    }

    User.findById(id, '-salt -password -providerData').exec(function (err, user) {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

function updateUser(user, username, password = null) {
  return new Promise(function (resolve, reject) {
    user.username = username;
    if (password) {
      user.password = password;
    }

    user.save(function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

function inserUser(username, password) {
  return new Promise(function (resolve, reject) {
    var user = new User();
    user.username = username;
    user.password = password;
    user.roles = ['manager'];

    user.save(function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
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

