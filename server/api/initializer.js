'use strict';
const MongoClient = require('mongodb').MongoClient,
      log = require('bragi').log,
      schemas = require('./schemas'),
      config = require('./config'),
      fortune = require('fortune');


const fortuneSettings = {
  adapter: [
    require('fortune-mongodb'),
    { url: config.uri }
  ]
};

const fortuneSerializerSettings = {
  serializers: [
    [
      require('fortune-json-api'),
      {
        prefix: config.apiUrl,
        maxLimit: config.defaultLimit
      }
    ]
  ]
};

const store = fortune(schemas, fortuneSettings);

/**
 * Server initializer sets up fortune middleware to handle most
 * standard json:api reoutes, then establishes connection to MongoDB that
 * 1. persists db connection object on app.locals.db
 * 2. returns locals object for testing uses (w/ server & db)
 */
const initialize = function(app, config) {

  // setup fortune middleware
  app.use(config.apiNamespace, fortune.net.http(store, fortuneSerializerSettings));
  store.connect().then(() => {

    // setup mongo
    MongoClient.connect(config.uri, config.connectionOptions)
      .then((db) => {
        // assign db to locals object for cxn pooling
        app.locals.db = db;

        // kill server if old cxn still running; occurs when DB cxn fails
        if ( app.locals.server ) {
          app.locals.server.close();
        }

        app.locals.server = app.listen(config.port, () => {
          log('info', `Listening at ${config.port}`);
        });

        // attempt reconnection when DB cxn goes down
        db.on('close', err => {
          log('error', '\nDB cxn failed, retrying\n', err.message);
          store.disconnect();
          setTimeout(initialize(app, config), 10000);
        });
      })

      // attempt reconnection if initial cxn fails
      .catch((err) => {
        log('error', '\nDB cxn failed, retrying\n', err.message);
        store.disconnect();
        setTimeout(initialize(app, config), 10000);
      });

    return app.locals.server;
  })
  // attempt reconnection if fortune server goes down
  .catch((err) => {
    log('error', '\nFortune cxn failed, retrying\n', err.message);
    setTimeout(initialize(app, config), 10000);
  });
};

module.exports = initialize;
