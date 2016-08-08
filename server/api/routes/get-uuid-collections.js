/**
 * Route for retreiving collections of a user (of records from nih-explorer)
 */

'use strict';
const Router = require('express').Router;

module.exports = new Router().get('/collections/:uuid', (req, res) => {
  const uuid = req.params.uuid,
        db = req.app.locals.db;

  db.collection('collection').find({uuid: uuid}).toArray().then(docs => {
    res.send(docs);
  });
});
