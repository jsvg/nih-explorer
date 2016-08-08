/**
 * Route for deleting a single collection for a user
 */

'use strict';
const Router = require('express').Router,
      log = require('bragi').log;

module.exports = new Router().delete('/collections/:uuid/:name', (req, res) => {
  const uuid = req.params.uuid,
        name = req.params.name,
        db = req.app.locals.db;

  db.collection('collection').deleteOne({uuid, name}, (err, r) => {
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
