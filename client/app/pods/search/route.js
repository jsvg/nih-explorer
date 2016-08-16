// search
import Route from 'ember-route';
import get from 'ember-metal/get';
import set from 'ember-metal/set';

export default Route.extend({
  queryParams: {
    q: { refreshModel: true },
    offset: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    activity: { refreshModel: true },
    icName: { refreshModel: true },
    orgCountry: { refreshModel: true },
    nihSpendingCats: { refreshModel: true },
    applicationType: { refreshModel: true },
    edInstType: { refreshModel: true },
    coreProjectNum: { refreshModel: true },
    programOfficerName: { refreshModel: true },
    piNames: { refreshModel: true },
    orgDept: { refreshModel: true },
    orgState: { refreshModel: true },
    orgName: { refreshModel: true }
  },

  model(params) {
    if ( !params.q ) { delete params.q; }
    return get(this, 'store').query('grant', params).then(result => {
      set(this, 'meta', result.get('meta'));
      return result;
    });
  },

  /*
   * Small override in order to 
   * pass meta property to controller
   * for use in template and logic,
   * and reset modal showing property
   */
  setupController(controller) {
    this._super(...arguments);
    controller.setProperties({
      meta: get(this, 'meta'),
      isShowingFilterModal: false,
      isShowingCreateCollectionsModal: false
    });
  },

  /**
   * Required to drop sticky query params
   */
  resetController(controller, isExiting) {
    // isExiting would be false if only the route's model was changing
    if (isExiting) {
      this.controller.queryParams.forEach(param => {
        if ( param === 'offset' ) { this.controller.set(param, 0); } 
        else { this.controller.set(param, null); }
      });
    }
  }
});
