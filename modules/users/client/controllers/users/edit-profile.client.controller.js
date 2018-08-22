(function () {
  'use strict';

  angular
    .module('users')
    .controller('EditProfileController', EditProfileController);

  EditProfileController.$inject = ['$scope', '$http', '$location', 'UsersService', 'Authentication', 'Notification'];

  function EditProfileController($scope, $http, $location, UsersService, Authentication, Notification) {
    var vm = this;

    vm.user = Authentication.user;
    vm.updateUserProfile = updateUserProfile;

    // Update a user profile
    function updateUserProfile(isValid) {

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

        return false;
      }

      var user = new UsersService(vm.user);
      console.log(user);
      user.$updateProfile(function (response) {
        $scope.$broadcast('show-errors-reset', 'vm.userForm');

        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> このアカウントの保存が完了しました。' });
        Authentication.user = response;
      }, function (response) {
        Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> このアカウントの保存が失敗しました。' });
      });
    }
  }
}());
