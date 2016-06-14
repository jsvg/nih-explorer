'use strict';
module.exports = {
  port: 8080,
  defaultLimit: 10,
  apiNamespace: '/api/v1',
  apiUrl: 'http://localhost:8080/api/v1',
  uri: 'mongodb://localhost:27017/reporter',
  connectionOptions: {
    server: {
      reconnectTries: 1E9,
      reconnectInterval: 1E3
    }
  },
  allowPreflight(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // intercept OPTIONS method to allow preflight reqs
    'OPTIONS' === req.method ? res.sendStatus(200) : next();
  }
};
