(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserController', UserController);

  UserController.$inject = ['$scope', '$state', '$window', 'Authentication', 'userResolve', 'Notification'];

  function UserController($scope, $state, $window, Authentication, user, Notification) {
    var vm = this;
    vm.authentication = Authentication;
    vm.user = user;
    vm.update = update;
    vm.isContextUserSelf = isContextUserSelf;
    function update(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      vm.user.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.users.list');
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> このアカウントの保存が完了しました。' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> このアカウントの保存が失敗しました。' });
      }
    }

    function isContextUserSelf() {
      return vm.user.username === vm.authentication.user.username;
    }
  }
}());
