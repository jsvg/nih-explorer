import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),

  didReceiveAttrs() {
    this._super(...arguments);
    const ajax = get(this, 'ajax'),
          resource = get(this, 'resource'),
          params = get(this, 'params');

    if ( ! params.q ) { delete params.q; }
    return ajax.request(resource, {
      method: 'GET',
      data: params
    }).then(result => {
      set(this, 'statVal', result.data[0].attributes.value);
      set(this, 'isLoading', false);
    }).catch(err => {
      console.log(err);
      set(this, 'statVal', '-');
      set(this, 'isLoading', false);
    });
  },

  didUpdateAttrs() {
    this._super(...arguments);
    set(this, 'isLoading', true);
  }
});
