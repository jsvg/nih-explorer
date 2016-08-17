// search
import BaseFilterStateProperties from 'client/mixins/data-filter-options';
import Controller from 'ember-controller';
import computed, { alias } from 'ember-computed';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import RSVP from 'rsvp';

const QUERY_PARAMS_MAP = {
  q: null,
  offset: 0,
  fundingMechanism: null,
  activity: null,
  icName: null,
  orgCountry: null,
  nihSpendingCats: null,
  applicationType: null,
  edInstType: null,
  coreProjectNum: null,
  programOfficerName: null,
  piNames: null,
  orgDept: null,
  orgState: null,
  orgName: null
};

const QUERY_PARAMS = Object.keys(QUERY_PARAMS_MAP);

export default Controller.extend(QUERY_PARAMS_MAP, BaseFilterStateProperties, {
  queryParams: QUERY_PARAMS,
  ajax: service(),

  /**
   * Dynamically generated data-filter properties
   * based on URL state (currectQueryParams) as well as
   * state of baseFilterSet contained in data-filter-options mixin
   */
  filterProps: computed('baseFilterSet.@each.activated', 'currectQueryParams', function() {
    let currentParams = get(this, 'currectQueryParams'),
      baseSet = get(this, 'baseFilterSet');

    baseSet.forEach((filter) => {
      set(filter, 'currentParams', currentParams);
      set(filter, 'selectedValue', currentParams[filter.filterAttr]);
    });

    return baseSet.filterBy('activated', true);
  }),

  /**
   * Computed props for generating aggregation params
   * used to query on behalf of data-stat components
   * resultant objects used by aggregator service
   */
  currectQueryParams: computed(...QUERY_PARAMS, function() {
    let filters = getProperties(this, ...this.queryParams);
    return Object.freeze(filters);
  }),
  aggParamsBase: computed('currectQueryParams', function() {
    return Object.assign({ aggBy: 'count' }, get(this, 'currectQueryParams'));
  }),
  grantCountParams: alias('aggParamsBase'),
  sumCostParams: computed('aggParamsBase', function() {
    return Object.assign({ aggMethod: 'sum', aggOn: 'totalCost' }, get(this, 'aggParamsBase'));
  }),
  avgCostParams: computed('aggParamsBase', function() {
    return Object.assign({ aggMethod: 'avg', aggOn: 'totalCost' }, get(this, 'aggParamsBase'));
  }),
  stdCostParams: computed('aggParamsBase', function() {
    // eslint-disable-next-line max-len
    return Object.assign({ aggMethod: 'stdDevSamp', aggOn: 'totalCost' }, get(this, 'aggParamsBase'));
  }),

  actions: {
    /**
     * Toggles filter activation state @
     * search-filter-modal component
     */
    toggleActivation(filterProps) {
      // reset filter before turning it inactive
      if (get(this, filterProps.filterAttr)) {
        set(this, filterProps.filterAttr, null);
      }
      set(filterProps, 'activated', !filterProps.activated);
    },

    /**
     * Generalized action for updating
     * query param based on filter action
     */
    filterSelection(target, val) {
      let setTo = val ? val.id : null;
      // changing a filter returns to first page
      if (get(this, 'offset') > 0) {
        set(this, 'offset', 0);
      }
      set(this, target, setTo);
    },

    /* creates a collection based on url state and name given from component */
    createCollection(name) {
      // note: eventually uuid will be defined by user session management
      let filterBase = get(this, 'currectQueryParams'),
        ajax = get(this, 'ajax'),
        uuid = 1;

      // properties will be attached to this object for POSTing
      let collection = { uuid, name };

      /**
       * Clean up the filterBase for only relevant values,
       * and attach those values to collection object
       */
      let filterParams = {};
      for (let key in filterBase) {
        if (!filterBase.hasOwnProperty(key)) { continue; }
        if (!filterBase[key]) { continue; }
        if (key === 'offset' || key === 'limit') { continue; }
        filterParams[key] = filterBase[key];
      }
      collection.filterParams = filterParams;

      /**
       * Trigger parallel promises that, only when complete,
       * allow POST ajax action, and then transition to
       * collections route
       */
      let aggAsyncRequest = (prop, params) => {
        return ajax.aggregate('grants', params).then((res) => {
          collection[prop] = res;
          return collection;
        });
      };
      RSVP.Promise.all([
        aggAsyncRequest('itemCount', get(this, 'grantCountParams')),
        aggAsyncRequest('sumCost', get(this, 'sumCostParams')),
        aggAsyncRequest('avgCost', get(this, 'avgCostParams'))
      ]).then(() => {
        ajax.post('/collections', { data: collection }).then(() => {
          this.transitionToRoute('collections');
        });
      });
    }
  }
});
