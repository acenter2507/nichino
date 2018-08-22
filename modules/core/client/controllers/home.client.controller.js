(function () {
  'use strict';

  angular
    .module('core')
    .controller('HomeController', HomeController);

  HomeController.$inject = ['UsersService'];
  function HomeController(UsersService) {
    var vm = this;

    UsersService.information(function (data) {

      vm.total_admin = _.find(data, {
        _id: 'admin'
      }).count;
      vm.total_manager = _.find(data, {
        _id: 'manager'
      }).count;
      vm.total_user = _.find(data, {
        _id: 'user'
      }).count;
    });
  }
}());
