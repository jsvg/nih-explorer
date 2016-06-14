const initializeServer = require('./initializer'),
      config = require('./config'),
      app = require('express')(),
      http = require('http'),
      morgan = require('morgan'),
      compression = require('compression'),
      fnRoute = require('./routes/functional-route');

app.use(morgan('dev'));
app.use(compression());
app.use(config.allowPreflight);
app.use(config.apiNamespace, fnRoute);
http.globalAgent.maxSockets = Infinity;

module.exports = initializeServer(app, config);
