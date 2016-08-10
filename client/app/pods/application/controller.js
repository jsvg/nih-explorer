// application
import Controller from 'ember-controller';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import controller from 'ember-controller/inject';

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

      /**
       * User flow: if query exists, and make new query, clear filters
       * else if filtering across all grants, and make new query, dont clear filters
       */
      if ( !q ) {
        this.transitionToRoute('search', params);
      } else {
        this.transitionToRoute('search', params).then(() => {
          // reset filters
          let searchParams = get(this,'searchCtrlr');
          set(this, 'searchVar', null);
          searchParams.set('offset', 0);
          searchParams.set('activity', null);
          searchParams.set('icName', null);
          searchParams.set('fundingMechanism', null);
          searchParams.set('orgCountry', null);
          searchParams.set('nihSpendingCats', null);
        });
      }
    }
  }
});
