'use strict';

/* eslint comma-dangle:[0, "only-multiline"] */

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.css',
        'public/lib/font-awesome/css/font-awesome.css',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.css',
        'public/lib/dropzone/dist/min/basic.min.css',
        'public/lib/dropzone/dist/min/dropzone.min.css',
        'public/lib/ng-dialog/css/ngDialog.min.css',
        'public/lib/ng-dialog/css/ngDialog-theme-default.min.css',
        'public/lib/summernote/dist/summernote.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.js',
        'public/lib/angular/angular.js',
        'public/lib/bootstrap/dist/js/bootstrap.js',
        'public/lib/angular-animate/angular-animate.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
        'public/lib/ng-file-upload/ng-file-upload.js',
        'public/lib/angular-messages/angular-messages.js',
        'public/lib/angular-mocks/angular-mocks.js',
        'public/lib/angular-resource/angular-resource.js',
        'public/lib/angular-ui-notification/dist/angular-ui-notification.js',
        'public/lib/angular-ui-router/release/angular-ui-router.js',
        'public/lib/dropzone/dist/min/dropzone.min.js',
        'public/lib/ng-dropzone/dist/ng-dropzone.min.js',
        'public/lib/jquery-slimscroll/jquery.slimscroll.min.js',
        'public/lib/ng-dialog/js/ngDialog.min.js',
        'public/lib/summernote/dist/summernote.js',
        'public/lib/angular-summernote/dist/angular-summernote.min.js',
        'public/lib/lodash/lodash.js',
        // endbower
        // custom
        'public/lib/custom/jquery.metisMenu.js',
        'public/lib/custom/custom.js',
      ],
      tests: ['public/lib/angular-mocks/angular-mocks.js']
    },
    css: [
      'modules/*/client/{css,less,scss}/*.css'
    ],
    less: [
      'modules/*/client/less/*.less'
    ],
    sass: [
      'modules/*/client/scss/*.scss'
    ],
    js: [
      'modules/core/client/app/config.js',
      'modules/core/client/app/init.js',
      'modules/*/client/*.js',
      'modules/*/client/**/*.js'
    ],
    img: [
      'modules/**/*/img/**/*.jpg',
      'modules/**/*/img/**/*.png',
      'modules/**/*/img/**/*.gif',
      'modules/**/*/img/**/*.svg'
    ],
    views: ['modules/*/client/views/**/*.html'],
    templates: ['build/templates.js']
  },
  server: {
    gulpConfig: ['gulpfile.js'],
    allJS: ['server.js', 'config/**/*.js', 'modules/*/server/**/*.js'],
    models: 'modules/*/server/models/**/*.js',
    routes: ['modules/!(core)/server/routes/**/*.js', 'modules/core/server/routes/**/*.js'],
    sockets: 'modules/*/server/sockets/**/*.js',
    config: ['modules/*/server/config/*.js'],
    policies: 'modules/*/server/policies/*.js',
    views: ['modules/*/server/views/*.html']
  }
};
