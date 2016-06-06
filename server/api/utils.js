'use strict';
module.exports = {
  /*
   * Utility function to parse out where terms for filtering
   * only accepts keys that are contained in passed in schema
   * 
   * Parses out comma separated query clauses for filtering
   * Supports integer and date comparison operators: =, <>, >, >=, <, <=
   * Supports set value in array with <field>val1|val2...
   */
  reqQueryMapper(reqQuery, query, schema) {
    for ( let key in reqQuery ) {
      /* three checks to make sure that:
       * 1. the loop key is not a prototype prop of reqQuery 
       * 2. the key exists in the schema, t/f is actionable
       * 3. the key is not null
       * 4. the key's value is not an empty object
       */
      if ( !reqQuery.hasOwnProperty(key) ) { continue; }
      if ( !schema.hasOwnProperty(key) ) { continue; }
      if ( !reqQuery[key] ) { continue; }
      if ( !Object.keys(reqQuery[key]).length ) { continue; }

      // extract val w/ key
      let val = reqQuery[key];

      // logic for array case
      if ( Array.isArray(val) ) {
        query[key] = {$in: val};

      // logic for object case
      } else if ( typeof val === 'object' ) {
        // map FE query cmd to DB equivalents
        const map = {
          '>': '$gt',
          '>=': '$gte',
          '<': '$lt',
          '<=': '$lte',
          '=': '$eq',
          '!': '$ne'
        };

        // redefine object key
        let mongoOperator = {};
        for ( let objKey in val ) {
          // skip checks
          if ( !val.hasOwnProperty(objKey) ) { continue; }
          if ( !val[objKey] ) { continue; }
          // check if field is date based on schema
          let schemaType = schema[key].type.name;
          if ( schemaType === 'Date' ) {
            mongoOperator[map[objKey]] = new Date(val[objKey]);
          } else if ( schemaType === 'Number' ) {
            mongoOperator[map[objKey]] = Number(val[objKey]);
          } else {
            mongoOperator[map[objKey]] = val[objKey];
          }
        }
        query[key] = mongoOperator;

      // primitives case
      } else {
        query[key] = val;
      }
    }

    return query;
  }
};