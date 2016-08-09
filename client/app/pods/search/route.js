// search
import Ember from 'ember';
const { Route, RSVP: {hash}, get, set } = Ember;
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
    // need to delete params.q in case where filtering
    // without an active search (e.g. "cancer")
    if ( !params.q ) {
      delete params.q;
    }
    return hash({
      // IMPORTANT: get(...).query(...).then(...) needs to be refactored
      // away so that ajax/agg service should be used instead then
      // models folder can be removed and ember-data dependency dropped
      //
      // .query() returns table data, .then() sets controller's meta count
      // property to enable smart pagination
      grants: get(this, 'store').query('grant', params).then(result => {
        set(this, 'meta', result.get('meta'));
        return result;
      })
    });
  },

  /*
   * Small override in order to 
   * pass meta property to controller
   * for use in template and logic,
   * and reset modal showing property
   */
  setupController(controller, model) {
    controller.set('meta', this.get('meta'));
    controller.set('isShowingCreateCollectionsModal', false);
    this._super(controller, model);
  },

  /**
   * Required to drop sticky query params
   */
  resetController(controller, isExiting) {
    // isExiting would be false if only the route's model was changing
    if (isExiting) {
      controller.set('q', null);
      controller.set('offset', 0);
      controller.set('fundingMechanism', null);
      controller.set('activity', null);
      controller.set('icName', null);
      controller.set('orgCountry', null);
      controller.set('nihSpendingCats', null);
      controller.set('applicationType', null);
      controller.set('edInstType', null);
      controller.set('coreProjectNum', null);
      controller.set('programOfficerName', null);
      controller.set('piNames', null);
      controller.set('orgDept', null);
      controller.set('orgState', null);
      controller.set('orgName', null);
    }
  }
});
