/**
 * Route that allows aggregation, filtration, and search functions
 * to be dynamically executed against resources defined by schemas.js
 */

'use strict';
const Router = require('express').Router,
      inflection = require('inflection'),
      utils = require('../route-utils'),
      csv = require('express-csv'),
      log = require('bragi').log,
      async = require('async');

module.exports = new Router().get('/:resource', (req, res) => {
  const resource = inflection.singularize(req.params.resource),
        reqQueryParams = req.query,
        db = req.app.locals.db,
        params = utils.urlQueryParamsParser(reqQueryParams, resource);

  /**
   * Handling nonexistent resource error
   * params returns false if resource doesn't exist 
   */
  if ( !params ) {
    res.status(400).json({
      status: '400',
      detail: 'Resource does not exist'
    });
    return;
  }

  /**
   * Handling route debug
   */
  if ( reqQueryParams.debug === 'true' ) {
    res.json({
      'incoming req': reqQueryParams,
      'mongo': params.aggregationParams
    });
    return;
  }

  /**
   * Export functionality to send static file
   */
  if ( reqQueryParams.export === 'true' ) {
    for (let paramSet of params.aggregationParams) {
      if ( Object.keys(paramSet)[0] === '$limit' ) {
        // hack to prevent result limiting
        paramSet.$limit = parseInt(1E15);
      }
    }
    const aggOptions = {allowDiskUse: true};
    const cursor = db.collection(resource)
      .aggregate(params.aggregationParams, aggOptions);
    cursor.toArray().then((docs) => {
      // add headers to file
      docs.unshift(Object.keys(docs[0]));
      res.csv(docs);
    }).catch((err) => {
      log('error', 'issue during export', err);
      res.status(500).send(err.message);
      return;
    });
    return;
  }

  /**
   * Async process to kick off queries for total count
   * and for records; resolved results are then serialized
   */
  const asyncTotal = function(callback) {
    const countCriteria = {};
    if ( params.searchOptions.hasOwnProperty('$match') ) {
      Object.assign(countCriteria, params.searchOptions.$match);
    }
    if ( params.mongoFilterOptions.hasOwnProperty('$match') ) {
      Object.assign(countCriteria, params.mongoFilterOptions.$match);
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
      .aggregate(params.aggregationParams, (err, result) => {
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
