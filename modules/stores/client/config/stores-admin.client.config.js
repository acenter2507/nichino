(function () {
  'use strict';

  // Configuring the Stores Admin module
  angular
    .module('stores.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      class: 'icon fa fa-map-marker',
      title: '売店管理',
      state: 'admin.stores.list'
    });
  }
}());
