/**
 * Route for creating a single collection for a user
 */

'use strict';
const Router = require('express').Router,
      log = require('bragi').log;

module.exports = new Router().post('/collections', (req, res) => {
  const clxn = req.body,
        db = req.app.locals.db;

  db.collection('collection').insertOne(clxn, err => {
    if ( err ) {
      /**
       * Note that 'collection' collection in mongoDb
       * has a compound index as defined by:
       * db.collection.createIndex({uuid: 1, name: 1}, {unique: true})
       * thus uuid + name cannot be repeated or 11000 error thrown
       */
      if ( err.code === 11000 ) {
        res.status(500).send({'message': 'collection already exists'});
        return;
      } else {
        log('error', 'issue during collection deletion\n', err.message);
        res.status(500).send(err.message);
        return;
      }
    }

    res.send({'message': 'collection created'});
  });
});
