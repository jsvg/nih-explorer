// figure out end-to-end integration test later
'use strict';
const //initializeServer = require('../api/initializer'),
      MongoClient = require('mongodb').MongoClient,
      TEST_URI = 'mongodb://127.0.0.1:27017/test',
      fixtures = require('./fixtures'),
      expect = require('chai').expect,
      //app = require('express')(),
      re = require('superagent');

describe('Integration Test', function() {
  /*
  before(function(done) {
    // start server
    initializeServer(app, {uri: TEST_URI, port: 8080});
    // populate test db w fixtures
    MongoClient.connect(TEST_URI, (err, db) => {
      if ( err ) { return done(err); }
      let clxn = db.collection('grant');
      clxn.drop(() => {});
      clxn.insertMany(fixtures.grants, (err) => {
        if ( err ) { return done(err); }
        db.close(()=>{});
        done();
      });
    });

    //let server = require('../api/server');
  });
  */


  it('test string is a string', function(done) {
    /*
    re.get('localhost:8080/api/v1/grant/search/')
      .end((res) => {
        console.log(res);
        //expect(res).to.exist;
        //expect(res.status).to.equal(200);
        //expect('test').to.be.a('string');
        done();
      });
    */
    expect(10).to.exist;
    done();
  });

  after(function() {
    //app.locals.server.close();
  });
});
