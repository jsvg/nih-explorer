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
  placeholder: 'Search NIH spending...',
  actions: {
    search() {
      const q = get(this, 'searchVar'),
            transitionParams = { queryParams: { q } };

      /**
       * User flow: if query exists, and make new query, clear filters
       * else if filtering across all grants, and make new query, dont clear filters
       */
      set(this, 'searchVar', null);
      set(this, 'placeholder', 'searching...');
      if ( !q ) {
        this.transitionToRoute('search', transitionParams).then(() => {
          set(this, 'placeholder', 'Search NIH spending...');
        });
      } else {
        this.transitionToRoute('search', transitionParams).then(() => {
          // reset search bar
          set(this, 'placeholder', 'Search NIH spending...');
          // reset query param filters
          const searchRouteCtrlr = get(this,'searchCtrlr');
          searchRouteCtrlr.set('offset', 0);
          searchRouteCtrlr.set('fundingMechanism', null);
          searchRouteCtrlr.set('activity', null);
          searchRouteCtrlr.set('icName', null);
          searchRouteCtrlr.set('orgCountry', null);
          searchRouteCtrlr.set('nihSpendingCats', null);
          searchRouteCtrlr.set('applicationType', null);
          searchRouteCtrlr.set('edInstType', null);
          searchRouteCtrlr.set('coreProjectNum', null);
          searchRouteCtrlr.set('programOfficerName', null);
          searchRouteCtrlr.set('piNames', null);
          searchRouteCtrlr.set('orgDept', null);
          searchRouteCtrlr.set('orgState', null);
          searchRouteCtrlr.set('orgName', null);
        });
      }
    }
  }
});
