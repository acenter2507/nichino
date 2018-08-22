(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    // Users state routing
    $stateProvider
      .state('settings', {
        abstract: true,
        url: '/settings',
        templateUrl: '/modules/users/client/views/users/settings.client.view.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('settings.profile', {
        url: '/profile',
        templateUrl: '/modules/users/client/views/users/edit-profile.client.view.html',
        controller: 'EditProfileController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'プロファイル編集'
        }
      })
      .state('settings.password', {
        url: '/password',
        templateUrl: '/modules/users/client/views/users/change-password.client.view.html',
        controller: 'ChangePasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'パスワード変更'
        }
      })
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        template: '<ui-view/>',
        controllerAs: 'vm'
      })
      .state('authentication.signup', {
        url: '/signup',
        templateUrl: '/modules/users/client/views/users/signup.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: '/modules/users/client/views/users/signin.client.view.html',
        controller: 'AuthenticationController',
        controllerAs: 'vm'
      })
      .state('password', {
        abstract: true,
        url: '/password',
        template: '<ui-view/>'
      })
      .state('password.forgot', {
        url: '/forgot',
        templateUrl: '/modules/users/client/views/users/forgot-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password forgot'
        }
      })
      .state('password.reset', {
        abstract: true,
        url: '/reset',
        template: '<ui-view/>'
      })
      .state('password.reset.invalid', {
        url: '/invalid',
        templateUrl: '/modules/users/client/views/users/reset-password-invalid.client.view.html',
        data: {
          pageTitle: 'Password reset invalid'
        }
      })
      .state('password.reset.success', {
        url: '/success',
        templateUrl: '/modules/users/client/views/users/reset-password-success.client.view.html',
        data: {
          pageTitle: 'Password reset success'
        }
      })
      .state('password.reset.form', {
        url: '/:token',
        templateUrl: '/modules/users/client/views/users/reset-password.client.view.html',
        controller: 'PasswordController',
        controllerAs: 'vm',
        data: {
          pageTitle: 'Password reset form'
        }
      });
  }
}());
