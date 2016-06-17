// search
import Ember from 'ember';
const { Route, RSVP: {hash}, get, set } = Ember;
export default Route.extend({
  queryParams: {
    q: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    icName: { refreshModel: true },
    activity: { refreshModel: true },
    offset: { refreshModel: true },
    orgCountry: { refreshModel: true },
    nihSpendingCats: { refreshModel: true }
  },

  model(params) {
    if ( !params.q ) {
      delete params.q;
    }
    return hash({
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
