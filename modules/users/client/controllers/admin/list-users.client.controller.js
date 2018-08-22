(function () {
  'use strict';

  angular
    .module('users.admin')
    .controller('UserListController', UserListController);

  UserListController.$inject = ['$scope', '$state', '$filter', 'AdminService', 'UsersService', 'Notification'];

  function UserListController($scope, $state, $filter, AdminService, UsersService, Notification) {
    var vm = this;
    vm.buildPager = buildPager;
    vm.figureOutItemsToDisplay = figureOutItemsToDisplay;
    vm.pageChanged = pageChanged;
    vm.itemsPerPageData = [10, 20, 50];
    vm.itemsPerPage = 10;
    vm.remove = remove;
    init();

    function init() {
      AdminService.query(function (data) {
        vm.users = data;
        vm.buildPager();
      });
    }

    function buildPager() {
      vm.pagedItems = [];
      vm.currentPage = 1;
      vm.figureOutItemsToDisplay();
    }

    function figureOutItemsToDisplay() {
      vm.filteredItems = $filter('filter')(vm.users, {
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
        message: 'このアカウントを削除します。よろしいですか？'
      }, function () {
        var user = new AdminService({ _id: _id });
        user.$remove(function () {
          init();
          Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> アカウントの削除が完了しました。' });
        });
      });
    }
  }
}());
