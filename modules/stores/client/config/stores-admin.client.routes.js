(function () {
  'use strict';

  angular
    .module('stores.admin.routes')
    .config(routeConfig);

  routeConfig.$inject = ['$stateProvider'];

  function routeConfig($stateProvider) {
    $stateProvider
      .state('admin.stores', {
        abstract: true,
        url: '/stores',
        template: '<ui-view/>'
      })
      .state('admin.stores.list', {
        url: '',
        templateUrl: '/modules/stores/client/views/admin/list-stores.client.view.html',
        controller: 'StoresAdminListController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '売店一覧'
        }
      })
      .state('admin.stores.create', {
        url: '/create',
        templateUrl: '/modules/stores/client/views/admin/form-store.client.view.html',
        controller: 'StoresAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '売店登録'
        },
        resolve: {
          storeResolve: newStore
        }
      })
      .state('admin.stores.edit', {
        url: '/:storeId/edit',
        templateUrl: '/modules/stores/client/views/admin/form-store.client.view.html',
        controller: 'StoresAdminController',
        controllerAs: 'vm',
        data: {
          roles: ['admin'],
          pageTitle: '売店編集'
        },
        resolve: {
          storeResolve: getStore
        }
      });
  }

  getStore.$inject = ['$stateParams', 'StoresService'];

  function getStore($stateParams, StoresService) {
    return StoresService.get({
      storeId: $stateParams.storeId
    }).$promise;
  }

  newStore.$inject = ['StoresService'];

  function newStore(StoresService) {
    return new StoresService();
  }
}());
