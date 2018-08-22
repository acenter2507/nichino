(function () {
  'use strict';

  // Setting up route
  angular
    .module('users.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.users', {
        abstract: true,
        url: '/users',
        template: '<ui-view/>'
      })
      .state('admin.users.list', {
        url: '',
        templateUrl: '/modules/users/client/views/admin/list-users.client.view.html',
        controller: 'UserListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: 'アカウント一覧'
        }
      })
      .state('admin.users.create', {
        url: '/create',
        templateUrl: '/modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: newUser
        },
        data: {
          pageTitle: 'アカウント登録'
        }
      })
      .state('admin.user-edit', {
        url: '/users/:userId/edit',
        templateUrl: '/modules/users/client/views/admin/edit-user.client.view.html',
        controller: 'UserController',
        controllerAs: 'vm',
        resolve: {
          userResolve: getUser
        },
        data: {
          pageTitle: 'アカウント編集'
        }
      });

    getUser.$inject = ['$stateParams', 'AdminService'];
    function getUser($stateParams, AdminService) {
      return AdminService.get({
        userId: $stateParams.userId
      }).$promise;
    }

    newUser.$inject = ['AdminService'];
    function newUser(AdminService) {
      return new AdminService();
    }

  }
}());
