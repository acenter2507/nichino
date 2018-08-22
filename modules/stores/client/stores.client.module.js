(function (app) {
  'use strict';

  app.registerModule('stores', ['core']);// The core module is required for special route handling; see /core/client/config/core.client.routes
  app.registerModule('stores.admin', ['core.admin']);
  app.registerModule('stores.admin.routes', ['core.admin.routes']);
  app.registerModule('stores.services');
  app.registerModule('stores.routes', ['ui.router', 'core.routes', 'stores.services']);
}(ApplicationConfiguration));
