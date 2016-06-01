'use strict';
const re = require('superagent'),
      logger = require('bragi'),
      config = require('../api/config');

module.exports = {
  reHelper(itMsg, namespace, expectation, query) {
    it(itMsg, function(done) {
      re.get(config.apiSettings.prefix+namespace)
        .query(query)
        .end((err, res) => {
          if ( err ) { return logger.log('error: test', err.code); }
          expectation(res);
          done();
        });
    });
  }
};
