'use strict';
const jsonApiSerializer = require('fortune-json-api'),
      mongodbAdapter = require('fortune-mongodb'),
      morgan = require('morgan'),
      logger = require('bragi');

let config = module.exports = {};

config.port = process.env.PORT || 8080;
config.apiNamespace = '/api/v1';
config.apiUrl = 'http://localhost:' + config.port + config.apiNamespace;

config.mongoUrl = 'mongodb://localhost:27017/reporter';

config.apiSettings = {};
config.apiSettings.prefix = config.apiUrl;
config.apiSettings.maxLimit = 10;

config.adapterSettings = {
  adapter: [
  mongodbAdapter,
  { url: config.mongoUrl }
  ]
};

config.serializerSettings = {
  serializers: [
    [ jsonApiSerializer,  config.apiSettings ]
  ]
};

/*
 * Ember data makes preflight requests
 * therefore options method must be available
 */
config.allowPreflight = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // intercept OPTIONS method to allow preflight reqs
    'OPTIONS' === req.method ? res.sendStatus(200) : next();
};

/*
 * Logger levels (increasing levels of verbosity):
 * 1. BDD output from tests, bragi warn and error output
 * 2. Morgan req output, bragi warn, error, info output
 * 3. Morgan req, all bragi
 */
config.setupLoggers = function(app, level) {
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
