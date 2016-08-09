/**
 * Route for deleting a single collection for a user
 */

'use strict';
const Router = require('express').Router,
      ObjectID = require('mongodb').ObjectID,
      log = require('bragi').log;

module.exports = new Router().delete('/collections/:id', (req, res) => {
  const _id = new ObjectID(req.params.id),
        db = req.app.locals.db;

  db.collection('collection').deleteOne({_id}, (err, r) => {
    if ( err ) {
      log('error', 'issue during collection deletion\n', err.message);
      res.status(500).send(err.message);
      return;
    }

    if ( r.result.n === 0 ) {
      res.send({'message': 'collection not found'});
      return;
    }

    res.send({'message': 'collection deleted'});
  });
});
