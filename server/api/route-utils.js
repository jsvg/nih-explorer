'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      stringify = require('qs').stringify,
      config = require('./config');


const serializer = function(metaTotal, resource, schema, query) {
  const baseUrl = [config.apiUrl, resource].join('/');
  let jsonApiConfig = {
    id: '_id',
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
  const limit = parseInt(query.limit) || config.defaultLimit,
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
    jsonApiConfig.topLevelLinks.next = config.apiUrl + `/${resource}?` + stringify(nextQuery);
    jsonApiConfig.topLevelLinks.last = config.apiUrl + `/${resource}?` + stringify(lastQuery);
    if ( offset > 0 ) {
      jsonApiConfig.topLevelLinks.prev = config.apiUrl + `/${resource}?` + stringify(prevQuery);
      jsonApiConfig.topLevelLinks.first = config.apiUrl + `/${resource}?` + stringify(firstQuery);
    }
  } else if ( limit < total ) {
    jsonApiConfig.topLevelLinks.prev = config.apiUrl + `/${resource}?` + stringify(prevQuery);
    jsonApiConfig.topLevelLinks.first = config.apiUrl + `/${resource}?` + stringify(firstQuery);
  }

  jsonApiConfig.attributes = schemaAttrs;
  return new JSONAPISerializer('grant', jsonApiConfig);
};

const aggSerializer = new JSONAPISerializer('aggregation', {
  id: '_id',
  attributes: ['value'],
  pluralizeType: false
});

/**
 * check if val is an array
 * two options here:
 * 1. contains multiple items (e.g. state = [VA,TX,MD])
 * 2. contains range (e.g. cost = [lte1000, gt100])
 *
 * Ranges can only be date or number type (defined in schema)
 * t/f check for that, however, can multiselect (i.e. $in),
 * for fields like activityCode (e.g. activityCode: {$in: [1,2,3]})
 */
const parseArrayEqualityTerm = function(key, term, valType) {
  let map = {},
      termMap = {};
  const termKey = '$'+term.split(/([lg]te?)(.*)/g)[1];
  if ( valType === 'Number' ) {
    const termVal = parseFloat(term.split(/([lg]te?)(.*)/g)[2]);
    termMap[termKey] = termVal;
    map[key] = termMap;
  } else if ( valType === 'Date' ) {
    const termVal = new Date(term.split(/([lg]te?)(.*)/g)[2]);
    termMap[termKey] = termVal;
    map[key] = termMap;
  }
  return map;
};
const parseArrayValue = function(key, arrVal, valType) {
  // if value is date or number (i.e. potential for equality param)
  let map = {};
  if ( valType === 'Number' || valType === 'Date' ) {
    // if first value of array has an equality metric
    if ( arrVal[0].match(/[lg]te?/g) ) {
      // setup empty $and array to be filled with range terms
      map.$and = [];
      // push terms into array
      arrVal.map(term => {
        map.$and.push(parseArrayEqualityTerm(key, term, valType));
      });
    // if the item is a number or date, but is not an equality metric
    } else {
      map[key] = {};
      if ( valType === 'Number' ) {
        map[key].$in = arrVal.map(i => parseFloat(i));
      } else if ( valType === 'Date' ) {
        map[key].$in = arrVal.map(i => new Date(i));
      }
    }
  // else value must be a string
  } else {
    map[key] = {};
    map[key].$in = arrVal;
  }
  return map;
};


/**
 * check for type is date or number, equality is allowed
 */
const parseSingleValue = function(key, val, valType) {
  let map = {};
  // inequality mapping
  if ( val.match(/[lg]te?/g) ) {
    let valMap = {};
    const termKey = '$'+val.split(/([lg]te?)(.*)/g)[1];
    if ( valType === 'Number' ) {
      const termVal = parseFloat(val.split(/([lg]te?)(.*)/g)[2]);
      valMap[termKey] = termVal;
    } else if ( valType === 'Date' ) {
      const termVal = new Date(val.split(/([lg]te?)(.*)/g)[2]);
      valMap[termKey] = termVal;
    }
    map[key] = valMap;
  // otherwise, simple mapping
  } else {
    if ( valType === 'Number' ) {
      map[key] = parseFloat(val);
    } else if ( valType === 'Date' ) {
      map[key] = new Date(val);
    } else {
      map[key] = val;
    }
  }
  return map;
};


module.exports = {
  serializer,
  aggSerializer,

  /**
   * Utility function to parse out where terms for filtering
   * only accepts keys that are contained in passed in schema
   * 
   * Parses out comma separated query clauses for filtering
   * Supports integer and date comparison operators: =, <>, >, >=, <, <=
   * Supports set value in array with <field>val1|val2...
   */
  reqQueryHandler(query, schema) {
    let mongoQuery = {};
    
    for ( let key in query ) {
      /**
       * Three checks to make sure that the key:
       * 1. is not a prototype prop of reqQuery 
       * 2. exists in the schema
       * 3. value is not null
       * 4. value is not an empty object or array
       */
      if ( !query.hasOwnProperty(key) ) { continue; }
      if ( !schema.hasOwnProperty(key) ) { continue; }
      if ( !query[key] ) { continue; }
      if ( !Object.keys(query[key]).length ) { continue; }

      // extract val w/ key, get val type
      const val = query[key],
            valType = schema[key].type.name;

      // array case
      if ( Array.isArray(val) ) {
        // need to check for existance of a range to prevent overwriting
        let parsed = parseArrayValue(key, val, valType);
        let queryHasAnd = mongoQuery.hasOwnProperty('$and'),
            valIsRange = parsed.hasOwnProperty('$and');
        if ( queryHasAnd && valIsRange ) {
          parsed.$and.map(i => mongoQuery.$and.push(i));
        } else {
          Object.assign(mongoQuery, parsed);
        }
      }
      // single term case
      else {
        Object.assign(mongoQuery, parseSingleValue(key, val, valType));
      }
    }
    return {$match: mongoQuery};
  }
};


/** 
 * Ember Ajax & url query scenarios
 *
 * Base
 * data = {}
 * $E.get('ajax').request('/grant/search', {method:'GET', data})
 * http://localhost:8080/api/v1/grant/search
 *
 * Primitive
 * data = { icName: 'NATIONAL CANCER INSTITUTE', orgState: 'CA' }
 * ?icName=NATIONAL CANCER INSTITUTE&orgState=CA
 *
 * Primitive w Equality
 * data = { icName: 'NATIONAL CANCER INSTITUTE', totalCost: 'gt100000' }
 * ?icName=NATIONAL CANCER INSTITUTE&totalCost=gt100000
 *
 * Array
 * data = { totalCost: ['gt10000', 'lte10000000'], orgState: ['VA','MD'] }
 * ?totalCost=gt10000&totalCost=lte10000000&orgState=[VA,TX,MD]
 *
 * Nested inclusion
 * data = { nihSpendingCategory=cancer }
 * ?nihSpendingCategory=cancer
 *
 * db.getCollection('grant').find({
 *   $and: [{nihSpendingCats: 'lung'}, {nihSpendingCats: 'rare diseases'}]
 * })
 */
