import Ember from 'ember';
const { Component, inject, get, set } = Ember;
export default Component.extend({
  aggregator: inject.service(),
  
  statVal: null,
  resource: null,

  didReceiveAttrs() {
    const api = get(this, 'aggregator'),
          params = get(this, 'params');

    api.aggregate(params).then(val => {
      if ( !this.isDestroyed ) {
        set(this, 'statVal', val);
      }
    });
  }
});
