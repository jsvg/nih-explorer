// search - should become an abstract route
import Ember from 'ember';
import queryParamsHandler from 'client/mixins/query-params-handler';
const { Route, RSVP, get, set } = Ember;
export default Route.extend(queryParamsHandler, {
  queryParams: {
    q: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    icName: { refreshModel: true },
    activity: { refreshModel: true },
    offset: { refreshModel: true },
    orgCountry: { refreshModel: true }
  },

  model(params) {
    // validate params
    params = this.remapParams(params);

    // refactor params for aggregation routes
    const fmParams = this.makeAggregateQueryParam(params, 'fundingMechanism'),
          icParams = this.makeAggregateQueryParam(params, 'icName'),
          activityParams = this.makeAggregateQueryParam(params, 'activity'),
          countryParams = this.makeAggregateQueryParam(params, 'orgCountry');

    return RSVP.hash({
      // table data
      grants: get(this, 'store').query('grant', params).then(result => {
        set(this, 'meta', result.get('meta'));
        return result;
      }),

      // for filters
      fundingMechanisms: get(this, 'store').query('aggregate', fmParams),
      icNames: get(this, 'store').query('aggregate', icParams),
      activities: get(this, 'store').query('aggregate', activityParams),
      countries: get(this, 'store').query('aggregate', countryParams)
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
