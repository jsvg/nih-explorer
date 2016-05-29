'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      mongo = require('mongodb').MongoClient,
      config = require('../config'),
      schema = require('../schemas'),
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
  return new JSONAPISerializer('grant', {
  id: '_id',
  attributes: [
    'activity','administeringIc','applicationType','awardNoticeDate','budgetStart',
    'budgetEnd','edInstType','fundingIcs','fundingMechanism','fy','icName','nihSpendingCats',
    'orgCity','orgCountry','orgDept','orgDistrict','orgDuns','orgFips','orgName','orgState',
    'orgZip','phr','piIds','piNames','programOfficerName','projectStart','projectEnd',
    'projectTerms','projectTitle','studySection','studySectionName','supportYear',
    'totalCost','activityType'
  ],
  pluralizeType: false,
  meta: {total: metaTotal}
  });
}

module.exports = function(router) {
  router.route('/search').get((req, res) => {
    const q = req.query,
          limit = Number(q.limit) || 10,
          collection = q.resource || '';

    logger.log('info: req.query', '\n', q);

    let query = {};
    query.$text = { $search: q.q };
    delete q.q;
    delete q.resource;

    for ( let key in q ) {
      if ( !q.hasOwnProperty(key) ) { continue; }
      let val = q[key];

      if ( Array.isArray(val) ) {
        query[key] = {$in: val};
      } else if ( typeof val === 'object' ) {
        const map = {
          '>': '$gt',
          '>=': '$gte',
          '<': '$lt',
          '<=': '$lte',
          '=': '$eq',
          '!': '$ne'
        };

        let mongoOperator = {};
        for ( let objKey in val ) {
          // check if field is date based on schema
          let schemaType = schema.grant[key].type.name;
          if ( schemaType === 'Date' ) {
            mongoOperator[map[objKey]] = new Date(val[objKey]);
          } else if ( schemaType === 'Number' ) {
            mongoOperator[map[objKey]] = Number(val[objKey]);
          } else {
            mongoOperator[map[objKey]] = val[objKey];
          }
        }

        query[key] = mongoOperator;
      } else {
        query[key] = val;
      }
    }

    // log out
    logger.log('info: mongo query', '\n', query);

    // make req
    mongo.connect(config.mongoUrl, (err, db) => {
      if ( err ) { return logger.log('error', err); }
      // get total number of results
      let metaTotal;
      db.collection(collection)
        .count(query, (err, count) => {
          if ( err ) { return logger.log('error', err); }
          metaTotal = count;
        });
      
      // serialize the docs
      db.collection(collection)
        .find(query, { score: { $meta: 'textScore' } })
        .sort( { score: { $meta: 'textScore' } } )
        .limit(limit)
        .toArray((err, docs) => {
          if ( err ) { return logger.log('error', err); }
          res.send(searchSerializer(metaTotal).serialize(docs));
      });
    });
  });
};
