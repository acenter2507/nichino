(function () {
  'use strict';

  angular
    .module('users')
    .controller('AuthenticationController', AuthenticationController);

  AuthenticationController.$inject = ['$scope', 'UsersService', '$location', 'Authentication', 'PasswordValidator', 'Notification'];

  function AuthenticationController($scope, UsersService, $location, Authentication, PasswordValidator, Notification) {
    // If user is signed in then redirect back home
    if ($scope.isLogged) { $location.path('/'); }

    var vm = this;
    // vm.signup = signup;
    // vm.callOauthProvider = callOauthProvider;
    // vm.usernameRegex = /^(?=[\w.-]+$)(?!.*[._-]{2})(?!\.)(?!.*\.$).{3,34}$/;


    vm.signin = function (isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.userForm');
        return false;
      }

      UsersService.userSignin(vm.credentials)
        .then(function (res) {
          Authentication.user = res;
          $scope.handleBackScreen('home');
        })
        .catch(function (err) {
          Notification.error({ err: err.data.message, title: '<i class="glyphicon glyphicon-remove"></i> ログイン失敗!', delay: 6000 });
        });
    };

    // function signup(isValid) {

    //   if (!isValid) {
    //     $scope.$broadcast('show-errors-check-validity', 'vm.userForm');

    //     return false;
    //   }

    //   UsersService.userSignup(vm.credentials)
    //     .then(onUserSignupSuccess)
    //     .catch(onUserSignupError);
    // }
    // Authentication Callbacks
    // function onUserSignupSuccess(response) {
    //   // If successful we assign the response to the global user model
    //   vm.authentication.user = response;
    //   Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Signup successful!' });
    //   // And redirect to the previous or home page
    //   $state.go($state.previous.state.name || 'home', $state.previous.params);
    // }
    // function onUserSignupError(response) {
    //   Notification.error({ message: response.data.message, title: '<i class="glyphicon glyphicon-remove"></i> Signup Error!', delay: 6000 });
    // }

  }
}());
