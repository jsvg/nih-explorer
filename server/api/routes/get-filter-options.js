/**
 * Simple route for sending basic filter options
 */

'use strict';
const Router = require('express').Router;

module.exports = new Router().get('/filters/:uuid', (req, res) => {
  const uuid = req.params.uuid,
      db = req.app.locals.db;

  db.collection('filter').find({uuid: uuid}).toArray().then(docs => {
    res.send(docs);
  });
});
