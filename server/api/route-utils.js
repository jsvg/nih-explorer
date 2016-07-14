'use strict';
const JSONAPISerializer = require('jsonapi-serializer').Serializer,
      stringify = require('qs').stringify,
      schemas = require('./schemas'),
      config = require('./config');


const serializer = function(metaTotal, resource, query) {
  const baseUrl = [config.apiUrl, resource].join('/'),
        schema = schemas[resource];
  const jsonApiConfig = {
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
  const schemaAttrs = [];
  for ( const key in schema ) {
    if ( !schema.hasOwnProperty(key) ) {
      continue;
    }
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
  const limit = parseInt(query.limit, 10) || config.defaultLimit,
        offset = parseInt(query.offset, 10) || 0,
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
  return new JSONAPISerializer(resource, jsonApiConfig);
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
  const map = {},
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
  const map = {};
  if ( valType === 'Number' || valType === 'Date' ) {
    // if first value of array has an equality metric
    if ( arrVal[0].match(/[lg]te?/g) ) {
      // setup empty $and array to be filled with range terms
      map.$and = [];
      // push terms into array
      arrVal.map((term) => {
        map.$and.push(parseArrayEqualityTerm(key, term, valType));
      });
    // if the item is a number or date, but is not an equality metric
    } else {
      map[key] = {};
      if ( valType === 'Number' ) {
        map[key].$in = arrVal.map((i) => parseFloat(i));
      } else if ( valType === 'Date' ) {
        map[key].$in = arrVal.map((i) => new Date(i));
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
  const map = {};
  // inequality mapping
  if ( val.match(/[lg]te?/g) ) {
    const valMap = {},
          termKey = '$'+val.split(/([lg]te?)(.*)/g)[1];
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

/**
 * Aggregation pipeline params array
 * populated by series of phases for
 * - schema-based filtering
 * - aggregation methods
 * - special functions
 */
const urlQueryParamsParser = function(reqQueryParams, resource) {
  /**
   * Quick check for resource existance
   * then set schema and initiate aggParams array
   */
  if ( !schemas.hasOwnProperty(resource) ) {
    return false;
  }
  const schema = schemas[resource];
  const aggregationParams = [];

  /**
   * Handling schema-based filtering actions
   * - schemaAttr=<criteria>
   * - schemaAttr={gt|gte|lte|lt}<criteria>
   */
  const mongoFilterOptions = this.reqFilters(reqQueryParams, schema);
  aggregationParams.unshift(mongoFilterOptions);

  /**
   * Handling agg methods
   * Only execute on aggs if all three properties are present
   * - aggBy: what field to group by: or if it equals COUNT, then count it
   * - aggMethod: count, avg, sum, std, max, min
   * - aggOn: what field to execute aggMethod across
   *
   * If aggregation occurs on a nested item, 
   * $unwind is pushed into aggregationParams
   */
  if ( reqQueryParams.hasOwnProperty('aggBy') ) {
    const aggMap = {$group: {}},
          aggMethod = reqQueryParams.hasOwnProperty('aggMethod') ?
            '$'+reqQueryParams.aggMethod : '$sum',
          aggOn = reqQueryParams.hasOwnProperty('aggOn') ?
            '$'+reqQueryParams.aggOn : 1;

    // check for proper aggBy param
    const aggBy = schema.hasOwnProperty(reqQueryParams.aggBy) ?
      '$'+reqQueryParams.aggBy : 'total';

    // add $unwind if grouping on array
    if ( aggBy!== 'total' && schema[reqQueryParams.aggBy].type.name === 'Array' ) {
      aggregationParams.push({$unwind: aggBy});
    }

    aggMap.$group._id = aggBy;
    aggMap.$group.value = {};
    aggMap.$group.value[aggMethod] = aggOn;
    aggregationParams.push(aggMap);
  }

  /**
   * Handling special functions
   * - limit: default = 20
   * - offset
   * - q: index search
   */
  const searchOptions = {};
  if ( reqQueryParams.hasOwnProperty('q') ) {
    searchOptions.$match = { $text: { $search: reqQueryParams.q } };
    aggregationParams.unshift(searchOptions);
  }
  if ( reqQueryParams.hasOwnProperty('offset') ) {
    aggregationParams.push({ $skip : parseInt(reqQueryParams.offset, 10) });
  }
  if ( !reqQueryParams.hasOwnProperty('aggBy') ) {
    const limit = parseInt(reqQueryParams.limit, 10) || config.defaultLimit;
    aggregationParams.push({$limit: limit});
  }

  /**
   * Sort results
   * - if query invovles aggregation, sort by value (desc)
   * - else if query involves a search, sort by relevancy
   */
  if ( reqQueryParams.hasOwnProperty('aggBy') ) {
    aggregationParams.push({$sort: { value: -1 }});
  } else if ( reqQueryParams.hasOwnProperty('q') ) {
    aggregationParams.push({$sort: { score: { $meta: 'textScore' }, totalCost: -1 }});
  }

  return {
    aggregationParams,
    searchOptions,
    mongoFilterOptions
  };
};

module.exports = {
  serializer,
  aggSerializer,
  urlQueryParamsParser,

  /**
   * Utility function to parse out where terms for filtering
   * only accepts keys that are contained in passed in schema
   * 
   * Parses out comma separated query clauses for filtering
   * Supports integer and date comparison operators: =, <>, >, >=, <, <=
   * Supports set value in array with <field>val1|val2...
   */
  reqFilters(query, schema) {
    const mongoQuery = {};
    
    for ( const key in query ) {
      /**
       * Three checks to make sure that the key:
       * 1. is not a prototype prop of reqQuery 
       * 2. exists in the schema
       * 3. value is not null
       * 4. value is not an empty object or array
       */
      if ( !query.hasOwnProperty(key) ) {
        continue;
      }
      if ( !schema.hasOwnProperty(key) ) {
        continue;
      }
      if ( !query[key] ) {
        continue;
      }
      if ( !Object.keys(query[key]).length ) {
        continue;
      }

      // extract val w/ key, get val type
      const val = query[key],
            valType = schema[key].type.name;

      // array case
      if ( Array.isArray(val) ) {
        // need to check for existance of a range to prevent overwriting
        const parsed = parseArrayValue(key, val, valType),
              queryHasAnd = mongoQuery.hasOwnProperty('$and'),
              valIsRange = parsed.hasOwnProperty('$and');
        if ( queryHasAnd && valIsRange ) {
          parsed.$and.map((i) => mongoQuery.$and.push(i));
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

 /**
db.grant.aggregate([
    {$project: {nihSpendingCats: 1} },
    {$unwind: '$nihSpendingCats'},
    {$match: {nihSpendingCats: {$regex: 'stem'}} },
    {$group: {_id: '$nihSpendingCats', value: {$sum: 1}} },
    {$sort: {value: -1} },
    {$limit: 10}
])

db.grant.aggregate([
    {$project: {piNames: 1} },
    {$unwind: '$piNames'},
    {$match: {piNames: "sharma, leena"}},
    {$group: {_id: '$piNames', value: {$sum: 1}} },
    {$sort: {value: -1} },
    {$limit: 10}
])

db.grant.aggregate([
    {$project: {projectTitle: 1} },
    {$unwind: '$projectTitle'},
    {$match: {projectTitle: {$regex: 'cancer'}}},
    {$group: {_id: '$projectTitle', value: {$sum: 1}} },
    {$sort: {value: -1} },
    {$limit: 10}
])
*/
