import Controller from 'ember-controller';
import computed from 'ember-computed';
import { reads } from 'ember-computed';
import get from 'ember-metal/get';
import controller from 'ember-controller/inject';

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
