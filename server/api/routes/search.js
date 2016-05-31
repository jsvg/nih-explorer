'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      mapper = require('../utils').reqQueryMapper,
      mongo = require('mongodb').MongoClient,
      pluralize = require('pluralize'),
      schema = require('../schemas'),
      config = require('../config'),
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
 * <limit> = num of results to return
 * <offset> = for pagination
 *
 */
function searchSerializer(metaTotal, resource, schema) {
  let jsonApiConfig = {
    id: '_id',
    pluralizeType: false,
    meta: { count: metaTotal },
    dataLinks: {
      self(item) {
        return [config.url, pluralize(resource), item._id].join('/');
      },
      /*
       * pagination todo
       * first() {}
       * next() {}
       * prev() {}
       * last() {}
       */
    }
  };

  let schemaAttrs = [];
  for ( let key in schema ) {
    // map all schema attrs to an array
    schemaAttrs.push(key);

    // if there are relationships in schema:
    if ( schema[key].hasOwnProperty('link') ) {
      
      jsonApiConfig[key] = {
        // create relationships references
        ref(collection, field) { // jshint ignore:line
          return field;
        },
        // create relationships links
        relationshipLinks: {
          related(record, current, parent) { // jshint ignore:line
            return [config.url, pluralize(parent.type), parent.id, key].join('/');
          },
          self(record, current, parent) { // jshint ignore:line
            return [config.url, pluralize(parent.type), parent.id, 'relationships', key].join('/');
          }
        }
      };
    }
  }

  jsonApiConfig.attributes = schemaAttrs;
  return new JSONAPISerializer('grant', jsonApiConfig);
}

module.exports = function(router) {
  router.get('/search', (req, res) => {
    const collection = req.query.resource || '',
          offset = Number(req.query.offset) || 0,
          limit = Number(req.query.limit) || 10;

    // setup query
    let query = {};
    if ( req.query.q ) { query.$text = { $search: req.query.q }; }
    mapper(req.query, query, schema[collection]);

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
            .skip(offset)
            .toArray((err, docs) => {
              if ( err ) { return logger.log('error', err); }
              res.send(searchSerializer(metaTotal, collection, schema[collection]).serialize(docs));
          });
        })
        .catch((err) => {
          logger.log('Error', 'Search promise malfunction', err);
        });    
    });
  });
};
