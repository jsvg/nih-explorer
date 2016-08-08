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
   * for use in template and logic
   */
  setupController(controller, model) {
    controller.set('meta', this.get('meta'));
    this._super(controller, model);
  }
});
