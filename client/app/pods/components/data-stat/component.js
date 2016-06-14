import Ember from 'ember';
const { Component, inject: { service }, get, set } = Ember;
export default Component.extend({
  aggregator: service(),
  
  statVal: null,
  resource: null,

  didReceiveAttrs() {
    const api = get(this, 'aggregator'),
          resource = get(this, 'resource'),
          params = get(this, 'params');

    api.aggregate(resource, params).then(val => {
      if ( !this.isDestroyed ) {
        set(this, 'statVal', val);
      }
    });
  }
});
