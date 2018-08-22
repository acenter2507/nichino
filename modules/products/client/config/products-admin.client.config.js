(function () {
  'use strict';

  // Configuring the Products Admin module
  angular
    .module('products.admin')
    .run(menuConfig);

  menuConfig.$inject = ['menuService'];

  function menuConfig(menuService) {
    menuService.addSubMenuItem('topbar', 'admin', {
      class: 'icon fa fa-medkit',
      title: '商品管理',
      state: 'admin.products.list'
    });
  }
}());
