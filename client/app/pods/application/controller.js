// application
import Ember from 'ember';
const { Controller, inject, get } = Ember;
export default Controller.extend({
  // to reset filters on search route
  searchCtrlr: inject.controller('search'),
  ajax: inject.service(),
  
  actions: {
    search() {
      this.transitionToRoute('search', {
        queryParams: {q: get(this, 'searchVar'), resource: 'grant'}
      }).then(() => {
        // reset filters
        let searchParams = get(this,'searchCtrlr');
        this.set('searchVar', null);
        searchParams.set('offset', 0);
        searchParams.set('activity', null);
        searchParams.set('icName', null);
        searchParams.set('fundingMechanism', null);
        searchParams.set('orgCountry', null);
      });
    }
  }
});
