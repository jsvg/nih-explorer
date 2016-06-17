import Ember from 'ember';
const { Controller, get, computed, computed: { reads } , inject: { controller } } = Ember;
export default Controller.extend({
  searchController: controller('search'),
  filterBase: reads('searchController.aggParamBase'),
  c3Params: computed('filterBase', function() {
    let rawFilters = get(this, 'filterBase'),
        c3Filters = rawFilters;
    if ( rawFilters.hasOwnProperty('q') ) {
      delete c3Filters.q;
    }
    console.log(c3Filters);
    return Object.assign({
      resource: 'grant',
      field: 'fundingMechanism',
      agg: '$avg',
      on: '$totalCost'
    }, c3Filters);
  })
});
