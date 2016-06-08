import Ember from 'ember';
const { Controller, get, computed, inject } = Ember;
export default Controller.extend({
  searchController: inject.controller('search'),
  c3Params: computed('searchController.filterBase', function() {
    const filters = get(this, 'searchController.filterBase');
    return Object.assign({
      resource: 'grant',
      field: 'fundingMechanism',
      agg: '$avg',
      on: '$totalCost'
    }, filters);
  })
});
