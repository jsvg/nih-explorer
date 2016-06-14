// application
import Ember from 'ember';
const { Controller, inject: {controller}, get, set } = Ember;
export default Controller.extend({
  /**
   * Operations responsible for reseting state of search route
   * when conducting a new query on the search bar param
   */
  searchCtrlr: controller('search'),
  actions: {
    search() {
      const q = get(this, 'searchVar'),
            params = { queryParams: { q } };

      this.transitionToRoute('search', params).then(() => {
        // reset filters
        let searchParams = get(this,'searchCtrlr');
        set(this, 'searchVar', null);
        searchParams.set('offset', 0);
        searchParams.set('activity', null);
        searchParams.set('icName', null);
        searchParams.set('fundingMechanism', null);
        searchParams.set('orgCountry', null);
      });
    }
  }
});
