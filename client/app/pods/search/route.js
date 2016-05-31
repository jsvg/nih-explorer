// search
import Ember from 'ember';
import aggregateParser from 'client/mixins/aggregate-params-parser';
const { Route, RSVP } = Ember;
export default Route.extend(aggregateParser, {
  queryParams: {
    q: { refreshModel: true },
    fundingMechanism: { refreshModel: true },
    administeringIc: { refreshModel: true }
  },
  model(params) {
    const fmParams = this.makeAggregateQueryParam(params, 'fundingMechanism'),
          icParams = this.makeAggregateQueryParam(params, 'administeringIc');

    return RSVP.hash({
      grants: this.store.query('grant', params),
      fundingMechanisms: this.store.query('aggregate', fmParams),
      administeringIcs: this.store.query('aggregate', icParams)
    });
  },

  /*
  // only primitives and arrays supported for query params,
  // so override route hooks
  serializeQueryParam(value, urlKey, defaultValueType) {
    if (defaultValueType === 'array') {
      return JSON.stringify(value);
    } else if (urlKey === 'where') {
      return JSON.stringify(value);
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
    } else if (urlKey === 'where') {
      return JSON.parse(value);
    }
    return value;
  }
  */
});
