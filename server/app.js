const initializeServer = require('./api/initializer'),
      config = require('./api/config'),
      express = require('express'),
      app = express(),
      http = require('http'),
      morgan = require('morgan'),
      bodyParser = require('body-parser'),
      compression = require('compression'),
      fnRoute = require('./api/routes/functional-route'),
      getClxnRoute = require('./api/routes/get-uuid-collections'),
      deleteClxnRoute = require('./api/routes/delete-uuid-named-collection'),
      postClxnRoute = require('./api/routes/post-uuid-named-collection'),
      putClxnRoute = require('./api/routes/put-uuid-named-collection'),
      clientRoute = require('./api/routes/client');

app.use(morgan('dev'));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(config.allowPreflight);
app.use(config.apiNamespace, fnRoute);
app.use(config.apiNamespace, getClxnRoute);
app.use(config.apiNamespace, deleteClxnRoute);
app.use(config.apiNamespace, postClxnRoute);
app.use(config.apiNamespace, putClxnRoute);
app.use(config.apiNamespace, clientRoute);
app.use(express.static(__dirname + '/public'));
http.globalAgent.maxSockets = Infinity;

module.exports = initializeServer(app, config);
