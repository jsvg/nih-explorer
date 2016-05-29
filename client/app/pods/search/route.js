// search
import Ember from 'ember';
const { Route, RSVP } = Ember;
export default Route.extend({
  queryParams: {
    q: { refreshModel: true },
    where: { refreshModel: true }
  },
  model(params) {
    let searchQ = {
      resource: 'grant',
      q: params.q,
      where: params.where
    };
    return RSVP.hash({
      grants: this.store.query('grant', searchQ),
      fundingMechanisms: this.store.query('aggregate', {
        field: 'grant.fundingMechanism',
        search: params.q,
        where: params.where
      }),
      administeringIcs: this.store.query('aggregate', {
        field: 'grant.administeringIc',
        search: params.q,
        where: params.where
      }),
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
