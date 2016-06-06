'use strict';
const schemas = require('./schemas'),
      fortune = require('fortune'),
      express = require('express'),
      config = require('./config'),
      store = fortune(schemas, config.adapterSettings),
      router = express.Router(),
      app = express();

/*
 * Load custom routes
 */
require('./routes/aggregate')(router);
require('./routes/search')(router);

/*
 * Middleware
 */
config.setupLoggers(app, 3);
app.use(config.allowPreflight);
app.use(config.apiNamespace, router);
app.use(config.apiNamespace, fortune.net.http(store, config.serializerSettings));

/*
 * Catch 404 and forward to error handler
 */
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/*
 * dev/prod error handler to print stacktrace
 */
app.use((err, req, res) => {
  res.status(err.status || 500);
  let msg = { message: err.message };
  msg.error = app.get('env') === 'development' ? err : {};
  res.render('error', msg);
});

/*
 * Load fortune auto-configured end-points and start server
 */
store.connect().then(() => {
  app.listen(config.port);
});
