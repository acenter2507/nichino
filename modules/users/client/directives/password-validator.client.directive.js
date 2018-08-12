(function () {
  'use strict';

  angular
    .module('users')
    .directive('passwordValidator', passwordValidator);

  passwordValidator.$inject = ['PasswordValidator'];

  function passwordValidator(PasswordValidator) {
    var directive = {
      require: 'ngModel',
      link: link
    };

    return directive;

    function link(scope, element, attrs, ngModel) {
      ngModel.$validators.requirements = function (password) {
        var status = true;
        if (password) {
          var result = PasswordValidator.getResult(password);

          if (result.errors.length) {
            scope.passwordErrors = result.errors;
            status = false;
          } else {
            scope.passwordErrors = [];
            status = true;
          }
        }
        return status;
      };
    }
  }
}());
