'use strict';

/**
 * Module dependencies
 */
var _ = require('lodash'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  fs = require('fs'),
  path = require('path'),
  multer = require('multer'),
  multerS3 = require('multer-s3'),
  aws = require('aws-sdk'),
  amazonS3URI = require('amazon-s3-uri'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  passport = require('passport'),
  validator = require('validator');

var smtpTransport = nodemailer.createTransport(config.mailer.options);
var whitelistedFields = ['firstName', 'lastName', 'email', 'username'];

var useS3Storage = config.uploads.storage === 's3' && config.aws.s3;
var s3;

if (useS3Storage) {
  aws.config.update({
    accessKeyId: config.aws.s3.accessKeyId,
    secretAccessKey: config.aws.s3.secretAccessKey
  });

  s3 = new aws.S3();
}

exports.signup = function (req, res) {
  delete req.body.roles;
  // Init user and add missing fields
  var user = new User(req.body);
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(422).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};
exports.signin = function (req, res, next) {
  console.log('req.body', req.body);
  passport.authenticate('local', function (err, user, info) {
    console.log('err', err);
    console.log('user', user);
    console.log('info', info);
    if (err || !user) return res.status(422).send(info);

    // Remove sensitive data before login
    user.password = undefined;
    user.salt = undefined;
    req.login(user, function (err) {
      if (err) return res.status(400).send(err);
      return res.json(user);
    });
  })(req, res, next);
};
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};
exports.update = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  var user = req.user;

  if (user) {
    // Update whitelisted fields only
    user = _.extend(user, _.pick(req.body, whitelistedFields));
    user.updated = Date.now();
    user.displayName = user.firstName + ' ' + user.lastName;

    user.save(function (err) {
      if (err) return res.status(422).send({ message: errorHandler.getErrorMessage(err) });
      req.login(user, function (err) {
        if (err)
          return res.status(400).send(err);
        return res.json(user);
      });
    });
  } else {
    return res.status(401).send({ message: 'User is not signed in' });
  }
};
exports.password = function (req, res) {
  if (!req.user) return res.status(400).send({ message: 'ユーザーがログインしていません！' });
  var passwordDetails = req.body;

  if (!passwordDetails.newPassword)
    return res.status(400).send({ message: '新しいパスワードを入力してください！' });
  User.findById(req.user._id, function (err, user) {
    if (err || !user)
      return res.status(400).send({ message: 'ユーザー情報が見つかりません！' });

    if (user.authenticate(passwordDetails.currentPassword)) {
      if (passwordDetails.newPassword !== passwordDetails.verifyPassword)
        return res.status(422).send({ message: '確認パスワードと新しいパスワードが統一していません！' });

      user.password = passwordDetails.newPassword;
      user.save(function (err) {
        if (err)
          return res.status(422).send({ message: 'パスワードを保存できません！' });
        req.login(user, function (err) {
          if (err) return res.status(400).send(err);
          return res.end();
        });
      });
    } else {
      return res.status(422).send({ message: '現在のパスワードが間違います！' });
    }

  });

};
exports.forgot = function (req, res, next) {
  async.waterfall([
    // Generate random token
    function (done) {
      crypto.randomBytes(20, function (err, buffer) {
        var token = buffer.toString('hex');
        done(err, token);
      });
    },
    // Lookup user by username
    function (token, done) {
      if (req.body.usernameOrEmail) {

        var usernameOrEmail = String(req.body.usernameOrEmail).toLowerCase();

        User.findOne({
          $or: [
            { username: usernameOrEmail },
            { email: usernameOrEmail }
          ]
        }, '-salt -password', function (err, user) {
          if (err || !user) {
            return res.status(400).send({
              message: 'No account with that username or email has been found'
            });
          } else {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            user.save(function (err) {
              done(err, token, user);
            });
          }
        });
      } else {
        return res.status(422).send({
          message: 'Username/email field must not be blank'
        });
      }
    },
    function (token, user, done) {

      var httpTransport = 'http://';
      if (config.secure && config.secure.ssl === true) {
        httpTransport = 'https://';
      }
      var baseUrl = config.domain || httpTransport + req.headers.host;
      res.render(path.resolve('modules/users/server/templates/reset-password-email'), {
        name: user.displayName,
        appName: config.app.title,
        url: baseUrl + '/api/auth/reset/' + token
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Password Reset',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with further instructions.'
          });
        } else {
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }

        done(err);
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};
exports.validate = function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (err || !user) {
      return res.redirect('/password/reset/invalid');
    }

    res.redirect('/password/reset/' + req.params.token);
  });
};
exports.reset = function (req, res, next) {
  // Init Variables
  var passwordDetails = req.body;

  async.waterfall([

    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!err && user) {
          if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
            user.password = passwordDetails.newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              if (err) {
                return res.status(422).send({
                  message: errorHandler.getErrorMessage(err)
                });
              } else {
                req.login(user, function (err) {
                  if (err) {
                    res.status(400).send(err);
                  } else {
                    // Remove sensitive data before return authenticated user
                    user.password = undefined;
                    user.salt = undefined;

                    res.json(user);

                    done(err, user);
                  }
                });
              }
            });
          } else {
            return res.status(422).send({
              message: 'Passwords do not match'
            });
          }
        } else {
          return res.status(400).send({
            message: 'Password reset token is invalid or has expired.'
          });
        }
      });
    },
    function (user, done) {
      res.render('modules/users/server/templates/reset-password-confirm-email', {
        name: user.displayName,
        appName: config.app.title
      }, function (err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send reset email using service
    function (emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Your password has been changed',
        html: emailHTML
      };

      smtpTransport.sendMail(mailOptions, function (err) {
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) {
      return next(err);
    }
  });
};
// exports.picture = function (req, res) {
//   var user = req.user;
//   var existingImageUrl;
//   var multerConfig;


//   if (useS3Storage) {
//     multerConfig = {
//       storage: multerS3({
//         s3: s3,
//         bucket: config.aws.s3.bucket,
//         acl: 'public-read'
//       })
//     };
//   } else {
//     multerConfig = config.uploads.profile.image;
//   }

//   // Filtering to upload only images
//   multerConfig.fileFilter = require(path.resolve('./config/lib/multer')).imageFileFilter;

//   var upload = multer(multerConfig).single('newProfilePicture');

//   if (user) {
//     existingImageUrl = user.profileImageURL;
//     uploadImage()
//       .then(updateUser)
//       .then(deleteOldImage)
//       .then(login)
//       .then(function () {
//         res.json(user);
//       })
//       .catch(function (err) {
//         res.status(422).send(err);
//       });
//   } else {
//     res.status(401).send({
//       message: 'User is not signed in'
//     });
//   }

//   function uploadImage() {
//     return new Promise(function (resolve, reject) {
//       upload(req, res, function (uploadError) {
//         if (uploadError) {
//           reject(errorHandler.getErrorMessage(uploadError));
//         } else {
//           resolve();
//         }
//       });
//     });
//   }

//   function updateUser() {
//     return new Promise(function (resolve, reject) {
//       user.profileImageURL = config.uploads.storage === 's3' && config.aws.s3 ?
//         req.file.location :
//         '/' + req.file.path;
//       user.save(function (err, theuser) {
//         if (err) {
//           reject(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }

//   function deleteOldImage() {
//     return new Promise(function (resolve, reject) {
//       if (existingImageUrl !== User.schema.path('profileImageURL').defaultValue) {
//         if (useS3Storage) {
//           try {
//             var { region, bucket, key } = amazonS3URI(existingImageUrl);
//             var params = {
//               Bucket: config.aws.s3.bucket,
//               Key: key
//             };

//             s3.deleteObject(params, function (err) {
//               if (err) {
//                 console.log('Error occurred while deleting old profile picture.');
//                 console.log('Check if you have sufficient permissions : ' + err);
//               }

//               resolve();
//             });
//           } catch (err) {
//             console.warn(`${existingImageUrl} is not a valid S3 uri`);

//             return resolve();
//           }
//         } else {
//           fs.unlink(path.resolve('.' + existingImageUrl), function (unlinkError) {
//             if (unlinkError) {

//               // If file didn't exist, no need to reject promise
//               if (unlinkError.code === 'ENOENT') {
//                 console.log('Removing profile image failed because file did not exist.');
//                 return resolve();
//               }

//               console.error(unlinkError);

//               reject({
//                 message: 'Error occurred while deleting old profile picture'
//               });
//             } else {
//               resolve();
//             }
//           });
//         }
//       } else {
//         resolve();
//       }
//     });
//   }

//   function login() {
//     return new Promise(function (resolve, reject) {
//       req.login(user, function (err) {
//         if (err) {
//           res.status(400).send(err);
//         } else {
//           resolve();
//         }
//       });
//     });
//   }
// };

