(function () {
  'use strict';

  angular
    .module('stores.services')
    .factory('StoresService', StoresService)
    .factory('StoresApi', StoresApi);

  StoresService.$inject = ['$resource', '$log'];

  function StoresService($resource, $log) {
    var Store = $resource('/api/stores/:storeId', {
      storeId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });

    angular.extend(Store.prototype, {
      createOrUpdate: function () {
        var store = this;
        return createOrUpdate(store);
      }
    });

    return Store;

    function createOrUpdate(store) {
      if (store._id) {
        return store.$update(onSuccess, onError);
      } else {
        return store.$save(onSuccess, onError);
      }

      // Handle successful response
      function onSuccess(store) {
        // Any required internal processing from inside the service, goes here.
      }

      // Handle error response
      function onError(errorResponse) {
        var error = errorResponse.data;
        // Handle error internally
        handleError(error);
      }
    }

    function handleError(error) {
      // Log error
      $log.error(error);
    }
  }

}());
