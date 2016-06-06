'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      mapper = require('../utils').reqQueryMapper,
      mongo = require('mongodb').MongoClient,
      stringify = require('qs').stringify,
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
function searchSerializer(metaTotal, schema, query) {
  const baseUrl = [config.apiUrl, pluralize(query.resource)].join('/');
  let jsonApiConfig = {
    id: '_id',
    pluralizeType: false,
    meta: {
      count: metaTotal
    },
    topLevelLinks: {
      self() {
        return baseUrl;
      }
    },
    dataLinks: {
      self(item) {
        return [baseUrl, item._id].join('/');
      }
    }
  };

  /*
   * Pagination conditional flow used to 
   * only display available pagination links
   *
   * Two gotchas here:
   * 1) Objects need to be cloned with Object.assign
   *    since basic assignment provides references
   * 2) Node's stringify fn only provides shallow encoding,
   *    so qs library required
   */
  const limit = parseInt(query.limit) || config.apiSettings.maxLimit,
        offset = parseInt(query.offset) || 0,
        total = metaTotal,
        firstQuery = Object.assign({}, query),
        lastQuery = Object.assign({}, query),
        prevQuery = Object.assign({}, query),
        nextQuery = Object.assign({}, query);

  delete firstQuery.offset;
  lastQuery.offset = total - (total % limit);
  prevQuery.offset = offset - limit;
  nextQuery.offset = offset + limit;

  if ( offset + limit < total ) {
    jsonApiConfig.topLevelLinks.next = config.apiUrl + '/search?' + stringify(nextQuery);
    jsonApiConfig.topLevelLinks.last = config.apiUrl + '/search?' + stringify(lastQuery);
    if ( offset > 0 ) {
      jsonApiConfig.topLevelLinks.prev = config.apiUrl + '/search?' + stringify(prevQuery);
      jsonApiConfig.topLevelLinks.first = config.apiUrl + '/search?' + stringify(firstQuery);
    }
  } else if ( limit < total ) {
    jsonApiConfig.topLevelLinks.prev = config.apiUrl + '/search?' + stringify(prevQuery);
    jsonApiConfig.topLevelLinks.first = config.apiUrl + '/search?' + stringify(firstQuery);
  }

  /*
   * Dynamically construct attributes based on
   * resource schema definition, to include
   * logic for relationships
   */
  let schemaAttrs = [];
  for ( let key in schema ) {
    if ( !schema.hasOwnProperty(key) ) { continue; }
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
            return [baseUrl, parent.id, key].join('/');
          },
          self(record, current, parent) { // jshint ignore:line
            return [baseUrl, parent.id, 'relationships', key].join('/');
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
          offset = parseInt(req.query.offset) || 0,
          limit = parseInt(req.query.limit) || config.apiSettings.maxLimit;

    // setup query
    let query = {};
    if ( req.query.q ) {
      query.$text = { $search: req.query.q };
    }
    mapper(req.query, query, schema[collection]);

    // log out
    logger.log('info: req query', '\n', req.query);
    logger.log('info: mongo query', '\n', query);

    // make req
    mongo.connect(config.mongoUrl, (err, db) => {
      if ( err ) { return logger.log('error', err); }

      /*
       * Promise to get total number of results
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
              res
                .send(searchSerializer(metaTotal, schema[collection], req.query)
                .serialize(docs));
          });
        })
        .catch((err) => {
          logger.log('Error', 'Search promise malfunction', err);
        });    
    });
  });
};
