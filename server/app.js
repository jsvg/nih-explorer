const initializeServer = require('./api/initializer'),
      config = require('./api/config'),
      express = require('express'),
      app = express(),
      http = require('http'),
      morgan = require('morgan'),
      compression = require('compression'),
      fnRoute = require('./api/routes/functional-route'),
      clientRoute = require('./api/routes/client');

app.use(morgan('dev'));
app.use(compression());
app.use(config.allowPreflight);
app.use(config.apiNamespace, fnRoute);
app.use(config.apiNamespace, clientRoute);
app.use(express.static(__dirname + '/public'));
http.globalAgent.maxSockets = Infinity;

module.exports = initializeServer(app, config);
