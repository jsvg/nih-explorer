/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  var app = new EmberApp(defaults, {
    sassOptions: {
      includePaths: ['app']
    },
    'ember-font-awesome': {
      useScss: true,
    },
    'ember-bootstrap': {
      'importBootstrapCSS': false,
      'importBootstrapFont': false
    }
  });

  return app.toTree();
};
