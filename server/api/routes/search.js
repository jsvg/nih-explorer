'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      mapper = require('../utils').reqQueryMapper,
      mongo = require('mongodb').MongoClient,
      config = require('../config'),
      schema = require('../schemas').grant,
      logger = require('bragi');

/* 
 * GET /search?resource=<collection>&where=<match>&search=<q>
 * Aggregate on unique elements for attribute of a resource,
 * default aggregation is to count
 *
 * Variables:
 * <collection> = string, resource attribute name
 * <match> = criteria for filtering
 * <q> = search term - hits all indices
 *
 */
function searchSerializer(metaTotal) {
  let attrs = [];
  for ( let key in schema ) { attrs.push(key); }
  return new JSONAPISerializer('grant', {
  id: '_id',
  attributes: attrs,
  pluralizeType: false,
  meta: {total: metaTotal}
  });
}

module.exports = function(router) {
  router.get('/search', (req, res) => {
    const collection = req.query.resource || '',
          limit = Number(req.query.limit) || 10;

    // setup query
    let query = {};
    if ( req.query.q ) { query.$text = { $search: req.query.q }; }
    mapper(req.query, query, schema);

    // log out
    logger.log('info: req query', '\n', req.query);
    logger.log('info: mongo query', '\n', query);

    // make req
    mongo.connect(config.mongoUrl, (err, db) => {
      if ( err ) { return logger.log('error', err); }

      /*
       * promise to get total number of results
       * then metaTotal passed into find() result 
       * to be serialized into response
       */
      new Promise((resolve) => {
        db.collection(collection)
          .count(query, (err, count) => {
            if ( err ) { return logger.log('error', err); }
            resolve(count);
          });
        })
        .then((metaTotal) => {
          // serialize the docs
          db.collection(collection)
            .find(query, { score: { $meta: 'textScore' } })
            .sort( { score: { $meta: 'textScore' } } )
            .limit(limit)
            .toArray((err, docs) => {
              if ( err ) { return logger.log('error', err); }
              res.send(searchSerializer(metaTotal).serialize(docs));
          });
        })
        .catch((err) => {
          logger.log('Error', 'Search promise malfunction', err);
        });    
    });
  });
};
