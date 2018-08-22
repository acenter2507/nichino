(function () {
  'use strict';

  angular
    .module('stores.admin')
    .controller('StoresAdminListController', StoresAdminListController);

  StoresAdminListController.$inject = ['$scope', '$state', '$filter', 'StoresService', 'Notification'];

  function StoresAdminListController($scope, $state, $filter, StoresService, Notification) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;
    vm.itemsPerPageData = [10, 20, 50];
    vm.itemsPerPage = 10;
    vm.remove = remove;
    init();

    function init() {
      StoresService.query(function (data) {
        vm.stores = data;
        vm.buildPager();
      });
    }

    function buildPager() {
      vm.pagedItems = [];
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.stores, {
        $: vm.search
      });
      vm.filterLength = vm.filteredItems.length;
      var begin = ((vm.currentPage - 1) * vm.itemsPerPage);
      var end = begin + vm.itemsPerPage;
      vm.pagedItems = vm.filteredItems.slice(begin, end);
    }

    function pageChanged() {
      if (vm.filteredItems) {
        vm.figureOutItemsToDisplay();
      }
    }

    function remove(_id) {
      $scope.handleShowConfirm({
        message: 'この売店を削除します。よろしいですか？'
      }, function () {
        var store = new StoresService({ _id: _id });
        store.$remove(function () {
          init();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> 売店の削除が完了しました。' });
        });
      });
    }
  }
}());
