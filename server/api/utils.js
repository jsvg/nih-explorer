'use strict';
const mongo = require('mongodb').MongoClient,
      schema = require('./schemas'),
      config = require('./config'),
      logger = require('bragi');

module.exports = {
  /* 
   * Utility function for executing aggregation queries
   */
  mQuery(req, res, collection, query, serializer) {
    mongo.connect(config.mongoUrl, (err, db) => {
      if ( err ) { return logger.log('error: connecting to mongo'); }
      db.collection(collection).aggregate(query, (err, docs) => {
        if ( err ) { return logger.log('error', err); }
        res.send(serializer.serialize(docs));
      });
    });
  },

  /*
   * Utility function to parse out where terms for filtering
   * 
   * Parses out comma separated query clauses for filtering
   * Supports integer and date comparison operators: =, <>, >, >=, <, <=
   * Supports set value in array with <field>val1|val2...
   *
   * Note for future, might be weird action if Null is typed as object
   * http://stackoverflow.com/questions/12996871/why-does-typeof-array-with-objects-return-object-and-not-array
   */
  matchParser(where) {
    let match = {};

    // only populate if there is a where term in req.query
    if ( where ) {
      // loop through clauses in where
      for ( let key in where ) {
        // skip loop if property from prototype
        if ( !where.hasOwnProperty(key) ) { continue; }
        let obj = where[key];

        // CASE: array clauses
        if ( Array.isArray(obj) ) {
          match[key] = {$in: obj};

        // CASE: object clauses
        } else if ( typeof obj === 'object' ) {
          const map = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            '=': '$eq',
            '!': '$ne'
          };
          
          // loop through each obj of the clause
          let mongoOperator = {};
          for ( let objKey in obj ) {
            // check if field is date based on schema
            let schemaType = schema.grant[key].type.name;
            if ( schemaType === 'Date' ) {
              mongoOperator[map[objKey]] = new Date(obj[objKey]);
            } else if ( schemaType === 'Number' ) {
              mongoOperator[map[objKey]] = Number(obj[objKey]);
            } else {
              mongoOperator[map[objKey]] = obj[objKey];
            }
          }

          match[key] = mongoOperator;

        // CASE: boolean, number, string clauses
        } else {
          match[key] = obj;
        }
      }
    }

    return match;
  }
};