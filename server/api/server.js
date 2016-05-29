'use strict';
const schemas = require('./schemas'),
      fortune = require('fortune'),
      express = require('express'),
      config = require('./config'),
      router = express.Router(),
      app = express();

/*
 * Load custom routes
 */
require('./routes/aggregate')(router);
require('./routes/search')(router);

/*
 * Allow preflight reqs to accomodate Ember
 * Setup morgan for req/res logging
 * Config server
 * Load fortune auto-configured end-points and start server
 */
const store = fortune(schemas, config.adapterSettings);
config.setupLoggers(app, 2);
app.use(config.allowPreflight);
app.use(config.namespace, router);
app.use(config.namespace, fortune.net.http(store, config.serializerSettings));
store.connect().then(() => {
  app.listen(config.port);
});
