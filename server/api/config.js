const jsonApiSerializer = require('fortune-json-api'),
      mongodbAdapter = require('fortune-mongodb'),
      morgan = require('morgan'),
      logger = require('bragi');

const port = process.env.PORT || 8080;

const mongoUrl = 'mongodb://localhost:27017/reporter';

const apiSettings = {
  prefix: 'http://localhost:8080/api/v1',
  maxLimit: 20
};

const adapterSettings = {
  adapter: [
  mongodbAdapter,
  { url: mongoUrl }
  ]
};

const serializerSettings = {
  serializers: [
    [ jsonApiSerializer,  apiSettings ]
  ]
};

const allowPreflight = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // intercept OPTIONS method to allow preflight reqs
    'OPTIONS' === req.method ? res.sendStatus(200) : next();
};

const setupLoggers = function(app, level) {
  logger.options.groupsEnabled = true; 
  if ( level === 1 ) {
    logger.options.groupsDisabled = ['info'];
  } else if (level === 2 ) {
    app.use(morgan('dev'));
    logger.options.groupsDisabled = ['info: mongo query', 'info: req'];
  } else if (level === 3 ) {
    app.use(morgan('dev'));
  }
};

module.exports = {
  setupLoggers: setupLoggers,
  apiSettings: apiSettings,
  adapterSettings: adapterSettings,
  serializerSettings: serializerSettings,
  allowPreflight: allowPreflight,
  mongoUrl: mongoUrl,
  namespace: '/api/v1',
  port: port
};
