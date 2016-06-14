/**
 * Route that allows aggregation, filtration, and search functions
 * to be dynamically executed against resources defined by schemas.js
 */

'use strict';
const Router = require('express').Router,
      inflection = require('inflection'),
      utils = require('../route-utils'),
      schemas = require('../schemas'),
      config = require('../config'),
      log = require('bragi').log,
      async = require('async');

module.exports = new Router().get('/:resource', (req, res) => {
  const resource = inflection.singularize(req.params.resource),
        db = req.app.locals.db,
        reqQueryParams = req.query,
        limit = parseInt(reqQueryParams.limit) || config.defaultLimit;

  /**
   * Aggregation pipeline params array
   * populated by series of phases for
   * - schema-based filtering
   * - aggregation methods
   * - special functions
   */
  let aggregationParams = [];

  /**
   * Handling nonexistent resource error 
   */
  if ( !schemas.hasOwnProperty(resource) ) {
    res.status(400).json({
      status: '400',
      detail: 'Resource does not exist'
    });
    return;
  }

  /**
   * Handling schema-based filtering actions
   * - schemaAttr=<criteria>
   * - schemaAttr={gt|gte|lte|lt}<criteria>
   */
  const mongoFilterOptions = utils.reqQueryHandler(reqQueryParams, schemas[resource]);
  aggregationParams.unshift(mongoFilterOptions);

  /**
   * Handling agg methods
   * Only execute on aggs if all three properties are present
   * - aggBy: what field to group by: or if it equals COUNT, then count it
   * - aggMethod: count, avg, sum, std, max, min (todo: unique)
   * - aggOn: what field to execute aggMethod across
   */
  if ( reqQueryParams.hasOwnProperty('aggBy') ) {
    const aggMap = {$group: {}},
          aggMethod = reqQueryParams.hasOwnProperty('aggMethod') ?
            '$'+reqQueryParams.aggMethod : '$sum',
          aggOn = reqQueryParams.hasOwnProperty('aggOn') ?
            '$'+reqQueryParams.aggOn : 1;

    // check for proper aggBy param
    const aggBy = schemas[resource].hasOwnProperty(reqQueryParams.aggBy) ?
      '$'+reqQueryParams.aggBy : 'total';

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
    aggregationParams.push({ $skip : parseInt(reqQueryParams.offset) });
  }
  if ( !reqQueryParams.hasOwnProperty('aggBy') ) {
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

  /**
   * Handling route debug
   */
  if ( reqQueryParams.debug === 'true' ) {
    res.json({
      'incoming req': reqQueryParams,
      'mongo': aggregationParams
    });
    return;
  }

  /**
   * Async process to kick off queries for total count
   * and for records; resolved results are then serialized
   */
  const asyncTotal = function(callback) {
    const countCriteria = {};
    if ( searchOptions.hasOwnProperty('$match') ) {
      Object.assign(countCriteria, searchOptions.$match);
    }
    if ( mongoFilterOptions.hasOwnProperty('$match') ) {
      Object.assign(countCriteria, mongoFilterOptions.$match);
    }
    db.collection(resource)
      .count(countCriteria, (err, count) => {
        if ( err ) {
          log('error', 'issue during count mongo query', err);
          res.status(500).send(err.message);
          return;
        }
        callback(null, count);
      });
  };
  const asyncAggregation = function(callback) {
    db.collection(resource)
      .aggregate(aggregationParams, (err, result) => {
        if ( err ) {
          log('error', 'issue during aggregation query\n', err.message);
          res.status(500).send(err.message);
          return;
        }
        callback(null, result);
      });
  };
  const asyncHandler = function(err, results) {
    if ( err ) {
      log('error', 'issue during async cb processing\n', err.message);
      res.status(500).send({err: err.message, results});
      return;
    }
    if ( reqQueryParams.hasOwnProperty('aggBy') ) {
      try {
        res.send(utils.aggSerializer.serialize(results.asyncAggregation));
      } catch(err) {
        log('error', 'issue during async serialization\n', err.message);
        res.status(500).send({err: err.message, results});
        return;
      }
    } else {
      try {
        res.send(
          utils.serializer(
            results.asyncTotal,
            resource,
            schemas[resource],
            reqQueryParams
          ).serialize(results.asyncAggregation)
        );
      } catch(err) {
        log('error', 'issue during async serialization\n', err.message);
        res.status(500).send({err: err.message, results});
        return;
      }
    }
  };
  async.parallel({asyncTotal, asyncAggregation}, asyncHandler);
});
