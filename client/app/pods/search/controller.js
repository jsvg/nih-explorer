// search
import Ember from 'ember';
const { Controller, computed, get, getProperties, set } = Ember;
export default Controller.extend({
  /* query params */
  queryParams: ['q','orgCountry','icName','fundingMechanism','activity','offset'],
  q: null,
  icName: null,
  fundingMechanism: null,
  activity: null,
  orgCountry: null,
  offset: 0,

  /**
   * CPs for generating aggregation params for
   * data-stat components
   * aggParamsBase also used to inform filter values
   */
  aggParamBase: computed('q','icName','fundingMechanism','activity','orgCountry', function() {
    const filters = getProperties(this, 'q', 'icName', 'fundingMechanism', 'activity', 'orgCountry');
    return Object.freeze(filters);
  }),
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
    /* generalized action for updating query param based on filter */
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
    }
  }
});
