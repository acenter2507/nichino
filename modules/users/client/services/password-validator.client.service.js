(function () {
  'use strict';

  // PasswordValidator service used for testing the password strength
  angular
    .module('users.services')
    .factory('PasswordValidator', PasswordValidator);

  PasswordValidator.$inject = ['$window'];

  function PasswordValidator($window) {
    return {
      getResult: function (password) {
        var result = { errors: [] };
        var check = 0;
        if (password.length < 8) {
          result.errors.push('パスワードは８文字以上入力してください！');
        }
        if (password.length > 32) {
          result.errors.push('パスワードは３２文字以内入力してください！');
        }
        return result;
      }
    };
  }

}());
