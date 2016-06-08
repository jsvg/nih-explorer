'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      mapper = require('../utils').reqQueryMapper,
      mongo = require('mongodb').MongoClient,
      schema = require('../schemas').grant,
      config = require('../config'),
      logger = require('bragi');

/* 
 * GET /aggregate?field=<attr>&agg=<agg>&on=<on>&where=<match>&search=<q>
 * Aggregate on unique elements for attribute of a resource,
 * default aggregation is to count
 *
 * Variables:
 * <attr> = string, resource attribute name DOT field name
 * <agg> = string, aggregation function sum, avg, first, last, min, max, stdDevSamp
 * <on> = string, attr to sum on
 * <match> = criteria for filtering
 * <q> = search term - hits all indices
 *
 * Response Attributes:
 * id: unique elements
 * value: value of aggregation
 */
const aggSerializer = new JSONAPISerializer('aggregate', {
  id: '_id',
  attributes: ['value'],
  pluralizeType: false
});

module.exports = function(router) {
  router.get('/aggregate', (req, res) => {
    const collection = req.query.resource,
          field = req.query.field,
          q = req.query.q,
          on = req.query.on || 1,
          agg = req.query.agg || '$sum';

    // build query
    let query = [
      { $match: {}},
      { $group: {
        _id: '$'+field,
        value: {}
      }},
      { $sort: {
        value: -1
      }}
    ];

    mapper(req.query, query[0].$match, schema);
    query[1].$group.value[agg] = on;
    if ( q ) {
      // unshift bc $text search needs to be first in aggregation pipeline
      query.unshift({$match: { $text: { $search: q } }});
    }

    // log out
    logger.log('info: req query', '\n', req.query);
    logger.log('info: mongo query', '\n', query);

    // make req
    mongo.connect(config.mongoUrl, (err, db) => {
      if ( err ) { return logger.log('error: connecting to mongo', err); }
      db.collection(collection).aggregate(query, (err, docs) => {
        if ( err ) { return logger.log('error', err); }
        res.send(aggSerializer.serialize(docs));
      });
    });
  });
};
