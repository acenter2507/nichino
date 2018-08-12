(function () {
  'use strict';

  angular
    .module('users')
    .controller('ChangePasswordController', ChangePasswordController);

  ChangePasswordController.$inject = ['$scope', 'UsersService', 'PasswordValidator', 'Notification'];

  function ChangePasswordController($scope, UsersService, PasswordValidator, Notification) {
    var vm = this;

    vm.handleChangePassword = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.passwordForm');
        return false;
      }

      UsersService.changePassword(vm.passwordDetails)
        .then(function (response) {
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> パスワードを変更しました！' });
          vm.passwordDetails = null;
        })
        .catch(function (response) {
          Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> パスワード変更が失敗しました!' });
        });
    };
  }
}());
