'use strict';

/**
 * Module dependencies
 */
var path = require('path'),
  fs = require('fs'),
  config = require(path.resolve('./config/config'));

/**
 * delete Old File
 */
exports.deleteOldFile = function (existingFileUrl) {
  return new Promise(function (resolve, reject) {
    fs.unlink(path.resolve('.' + existingFileUrl), function (unlinkError) {
      if (unlinkError) {
        // If file didn't exist, no need to reject promise
        if (unlinkError.code === 'ENOENT') {
          console.log('Removing image failed because file did not exist.');
          return resolve();
        }
        console.error(unlinkError);
        reject({
          message: 'Error occurred while deleting old image'
        });
      } else {
        resolve();
      }
    });
  });
};
