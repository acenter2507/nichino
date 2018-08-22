(function (window) {
  'use strict';

  var applicationModuleName = 'nichino';

  var applicationModuleVendorDependencies = [
    'ngResource',
    'ngAnimate',
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'ngFileUpload',
    'ui-notification',
    'ngDialog',
    'thatisuday.dropzone',
    'summernote'
  ];

  var service = {
    applicationEnvironment: window.env,
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };

  window.ApplicationConfiguration = service;
  // Add a new vertical module
  function registerModule(moduleName, dependencies) {
    // Create angular module
    angular.module(moduleName, dependencies || []);
    // Add the module to the AngularJS configuration file
    angular.module(applicationModuleName).requires.push(moduleName);
  }
}(window));
