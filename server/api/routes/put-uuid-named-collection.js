/**
 * Route for creating a single collection for a user
 */

'use strict';
const Router = require('express').Router,
      log = require('bragi').log;

module.exports = new Router().put('/collections', (req, res) => {
  const clxn = req.body,
        db = req.app.locals.db;

  const match = {
    uuid: clxn.uuid,
    name: clxn.name
  };

  db.collection('collection').updateOne(match, {$set: clxn}, (err, r) => {
    if ( err ) {
      log('error', 'issue during collection deletion\n', err.message);
      res.status(500).send(err.message);
      return;
    }

    if ( r.result.n === 0 ) {
      res.send({'message': 'collection not found'});
      return;
    }

    if ( r.result.nModified === 0 ) {
      res.send({'message': 'collection not changed'});
      return;
    }

    res.send({'message': 'collection updated'});
  });
});
