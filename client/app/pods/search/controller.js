// search
import BaseFilterStateProperties from 'client/mixins/data-filter-options';
import Controller from 'ember-controller';
import computed from 'ember-computed';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import RSVP from 'rsvp';

export default Controller.extend(BaseFilterStateProperties, {
  ajax: service(),
  aggregator: service(),

  isShowingFilterModal: false,
  isShowingCreateCollectionsModal: false,

  /**
   * Dynamically generated data-filter properties
   * based on URL state (aggParamBase) as well as
   * state of baseFilterSet contained in data-filter-options mixin
   */
  filterProps: computed('baseFilterSet.@each.activated', 'aggParamBase', function() {
    const currentParams = get(this, 'aggParamBase');
    let baseSet = get(this, 'baseFilterSet');
    baseSet.forEach(filter => {
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
  grantCountParams: computed('aggParamBase', function() {
    const aggParamBase = get(this, 'aggParamBase');
    return Object.assign({aggBy: 'count'}, aggParamBase);
  }),
  sumCostParams: computed('aggParamBase', function() {
    const aggParamBase = get(this, 'aggParamBase');
    return Object.assign({
      aggBy: 'count',
      aggMethod: 'sum',
      aggOn: 'totalCost'
    }, aggParamBase);
  }),
  avgCostParams: computed('aggParamBase', function() {
    const aggParamBase = get(this, 'aggParamBase');
    return Object.assign({
      aggBy: 'count',
      aggMethod: 'avg',
      aggOn: 'totalCost'
    }, aggParamBase);
  }),
  stdCostParams: computed('aggParamBase', function() {
    const aggParamBase = get(this, 'aggParamBase');
    return Object.assign({
      aggBy: 'count',
      aggMethod: 'stdDevSamp',
      aggOn: 'totalCost'
    }, aggParamBase);
  }),

  actions: {
    /* toggles filter activation state @ search-filter-modal component */
    toggleActivation(filterProps) {
      // reset filter before turning it inactive
      if ( get(this, filterProps.filterAttr) ) {
        set(this, filterProps.filterAttr, null);
      }
      set(filterProps, 'activated', !filterProps.activated);
    },

    /** 
     * Generalized action for updating 
     * query param based on filter action
     */
    filterSelection(target, val) {
      const setTo = val ? val.id : null;
      // changing a filter returns to first page
      if ( get(this, 'offset') > 0 ) {
        set(this, 'offset', 0);
      }
      set(this, target, setTo);
    },

    /* for sidebar nav buttons */
    changeRoute(route) {
      if ( route === 'table' ) {
        this.transitionToRoute('search.index').then(()=> { get(this, 'isSearchIndexRoute'); });
      } else if ( route === 'viz' ) {
        this.transitionToRoute('search.viz').then(()=> { get(this, 'isSearchIndexRoute'); });
      }
    },

    /* triggered by button to clear search */
    clearSearch() {
      set(this, 'q', null);
    },

    /* creates a collection based on url state and name given from component */
    createCollection(name) {
      // note: eventually uuid will be defined by user session management
      const filterBase = get(this, 'aggParamBase'),
            uuid = 1;
      
      // properties will be attached to this object for POSTing
      const collection = {};
      collection.uuid = uuid;
      collection.name = name;

      /**
       * Clean up the filterBase for only relevant values,
       * and attach those values to collection object
       */
      const filterParams = {};
      for ( let key in filterBase ) {
        if ( !filterBase.hasOwnProperty(key) ) { continue; }
        if ( !filterBase[key] ) { continue; }
        if ( (key === 'offset') || (key === 'limit') ) { continue; }
        filterParams[key] = filterBase[key];
      }
      collection.filterParams = filterParams;

      /**
       * Fetch aggregated meta values for easy caching on server,
       * high degree of async here
       */
      const agg = get(this, 'aggregator');
      let aggAsync = (prop, params) => {
        return new RSVP.Promise((resolve) => {
          agg.aggregate('grants', params).then(res => {
            resolve(collection[prop] = res);
          });
        });
      };

      /**
       * Trigger parallel promises that, only when complete,
       * allow POST ajax action, and then transition to
       * collections route
       */
      RSVP.Promise.all([
        aggAsync('itemCount', get(this, 'grantCountParams')),
        aggAsync('sumCost', get(this, 'sumCostParams')),
        aggAsync('avgCost', get(this, 'avgCostParams'))
      ]).then(() => {
        // POST call
        get(this, 'ajax').post('/collections', { data: collection }).then(() => {
          this.transitionToRoute('collections');
        });
      });
    }
  }
});
