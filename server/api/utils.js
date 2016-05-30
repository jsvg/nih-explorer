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
      if ( !reqQuery.hasOwnProperty(key) ) { continue; }
      if ( !schema.hasOwnProperty(key) ) { continue; }
      let val = reqQuery[key];

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
      } else {
        query[key] = val;
      }
    }
    return query;
  }
};