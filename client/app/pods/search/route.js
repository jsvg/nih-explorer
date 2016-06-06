// search - should become an abstract route
import Ember from 'ember';
import queryParamsHandler from 'client/mixins/query-params-handler';
const { Route, RSVP } = Ember;
export default Route.extend(queryParamsHandler, {
  queryParams: {
    q: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    icName: { refreshModel: true },
    activity: { refreshModel: true },
    offset: { refreshModel: true },
    orgCountry: { refreshModel: true },
    totalCost: { refreshModel: true },
  },
  meta: null,
  model(params) {

    console.log('before parse:', params);
    params = this.remapParams(params);
    console.log('after parse:', params);

    const fmParams = this.makeAggregateQueryParam(params, 'fundingMechanism'),
          icParams = this.makeAggregateQueryParam(params, 'icName'),
          activityParams = this.makeAggregateQueryParam(params, 'activity'),
          countryParams = this.makeAggregateQueryParam(params, 'orgCountry');

    return RSVP.hash({
      grants: this.store.query('grant', params).then((result) => {
        this.set('meta', result.get('meta'));
        return result;
      }),
      fundingMechanisms: this.store.query('aggregate', fmParams),
      icNames: this.store.query('aggregate', icParams),
      activities: this.store.query('aggregate', activityParams),
      countries: this.store.query('aggregate', countryParams)
    });
  },
  setupController(controller, model) {
    controller.set('meta', this.get('meta'));
    this._super(controller, model);
  },


  // only primitives and arrays supported for query params,
  // so override route hooks
  serializeQueryParam(value, urlKey, defaultValueType) {
    if (defaultValueType === 'array') {
      return JSON.stringify(value);
    } else if ( value instanceof Object ) {
      console.log('seializer', value);
      return value;
    }
    return `${value}`;
  },

  deserializeQueryParam(value, urlKey, defaultValueType) {
    // Use the defaultValueType of the default value (the initial value assigned to a
    // controller query param property), to intelligently deserialize and cast.
    if (defaultValueType === 'boolean') {
      return (value === 'true') ? true : false;
    } else if (defaultValueType === 'number') {
      return (Number(value)).valueOf();
    } else if (defaultValueType === 'array') {
      return Ember.A(JSON.parse(value));
    } else if ( value instanceof Object ) {
      return JSON.parse(value);
    }
    return value;
  }


});
