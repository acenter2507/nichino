(function () {
  'use strict';

  angular
    .module('stores.admin')
    .controller('StoresAdminController', StoresAdminController);

  StoresAdminController.$inject = ['$scope', '$state', '$timeout', 'storeResolve', 'Authentication', 'Upload', 'Notification'];

  function StoresAdminController($scope, $state, $timeout, store, Authentication, Upload, Notification) {
    var vm = this;
    vm.store = store;
    vm.authentication = Authentication;
    vm.form = {};
    vm.save = save;

    // Save Store
    function save(isValid) {
      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'vm.form.storeForm');
        return false;
      }

      // Create a new store, or update the current instance
      vm.store.createOrUpdate()
        .then(successCallback)
        .catch(errorCallback);

      function successCallback(res) {
        $state.go('admin.stores.list');
        Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> この売店の保存が完了しました。' });
      }

      function errorCallback(res) {
        Notification.error({ message: res.data.message, title: '<i class="glyphicon glyphicon-remove"></i> この売店の保存が失敗しました。' });
      }
    }

    vm.progress = 0;
    vm.upload = function (dataUrl) {
      Upload.upload({
        url: '/api/stores/' + vm.store._id,
        data: {
          image: dataUrl
        }
      }).then(function (response) {
        $timeout(function () {
          onSuccessItem(response.data);
        });
      }, function (response) {
        if (response.status > 0) onErrorItem(response.data);
      }, function (evt) {
        vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
      });
    };

    // Called after the user has successfully uploaded a new picture
    function onSuccessItem(response) {
      // Show success message
      Notification.success({ message: '<i class="glyphicon glyphicon-ok"></i> Successfully changed profile picture' });
      // Populate user object
      vm.store = response;
      // Reset form
      vm.fileSelected = false;
      vm.progress = 0;
    }

    // Called after the user has failed to upload a new picture
    function onErrorItem(response) {
      vm.fileSelected = false;
      vm.progress = 0;
      // Show error message
      Notification.error({ message: response.message, title: '<i class="glyphicon glyphicon-remove"></i> Failed to change profile picture' });
    }
  }
}());
