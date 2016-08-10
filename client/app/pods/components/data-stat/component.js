import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

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
