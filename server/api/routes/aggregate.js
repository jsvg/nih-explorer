'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      utils = require('../utils'),
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
  router.route('/aggregate').get((req, res) => {
    const collection = req.query.field.split('.')[0],
          field = req.query.field.split('.')[1],
          where = req.query.where,
          search = req.query.search,
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

    query[0].$match = utils.matchParser(where);
    query[1].$group.value[agg] = on;
    if ( search ) {
      query.unshift({$match: { $text: { $search: search } }});
    }

    // make req
    logger.log('info: mongo query', '\n', query);
    utils.mQuery(req, res, collection, query, aggSerializer);
  });
};
