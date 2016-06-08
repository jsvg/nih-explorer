// search
import Ember from 'ember';
const { Controller, computed, get, getProperties, set } = Ember;
export default Controller.extend({
  /* query params */
  queryParams: ['resource','q','orgCountry','icName',
                'fundingMechanism','activity','offset'],
  resource: 'grant',
  q: null,
  icName: null,
  fundingMechanism: null,
  activity: null,
  orgCountry: null,
  offset: 0,

  /* params for getting current data statistics */
  filterBase: computed('q','icName','fundingMechanism','activity','orgCountry', function() {
    const filters = getProperties(this, 'q', 'icName', 'fundingMechanism', 'activity', 'orgCountry');
    return Object.freeze(filters);
  }),
  grantCountParams: computed('filterBase', function() {
    const filterBase = get(this, 'filterBase');
    return Object.assign({resource: 'grant'}, filterBase);
  }),
  sumCostParams: computed('filterBase', function() {
    const filterBase = get(this, 'filterBase');
    return Object.assign({
      resource: 'grant',
      agg: '$sum',
      on: '$totalCost'
    }, filterBase);
  }),
  avgCostParams: computed('filterBase', function() {
    const filterBase = get(this, 'filterBase');
    return Object.assign({
      resource: 'grant',
      agg: '$avg',
      on: '$totalCost'
    }, filterBase);
  }),
  stdCostParams: computed('filterBase', function() {
    const filterBase = get(this, 'filterBase');
    return Object.assign({
      resource: 'grant',
      agg: '$stdDevSamp',
      on: '$totalCost'
    }, filterBase);
  }),

  actions: {
    /* generalized action for updating query param based on filter */
    filterSelection(target, vals) {
      let setTo = vals ? vals.get('id') : null;
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
