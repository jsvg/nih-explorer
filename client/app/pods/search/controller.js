// search
import Ember from 'ember';
import BaseFilterStateProperties from 'client/mixins/data-filter-options';
const { Controller, computed, get, set } = Ember;
export default Controller.extend(BaseFilterStateProperties, {
  /**
   * Dynamically generated data-filter properties
   * based on URL state (aggParamBase) as well as
   * state of baseFilterSet contained in data-filter-options mixin
   */
  isShowingFilterModal: false,
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
    /* toggles modal for editing filter states */
    showFilterModal() {
      this.toggleProperty('isShowingFilterModal');
    },

    /* toggles filter activation state @ search-filter-modal component */
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
    }
  }
});
