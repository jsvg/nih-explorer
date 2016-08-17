// data-stat
import Component from 'ember-component';
import { assert } from 'ember-metal/utils';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),

  didReceiveAttrs() {
    this._super(...arguments);
    let ajax = get(this, 'ajax'),
      resource = get(this, 'resource'),
      params = get(this, 'params');

    if (!params.q) { delete params.q; }
    if (params.offset) { delete params.offset; }
    return ajax.request(resource, {
      method: 'GET',
      data: params
    }).then((result) => {
      if (!this.isDestroyed) {
        set(this, 'statVal', result.data[0].attributes.value);
        set(this, 'isLoading', false);
      }
    }).catch((err) => {
      assert(err);
      if (!this.isDestroyed) {
        set(this, 'statVal', '-');
        set(this, 'isLoading', false);
      }
    });
  },

  didUpdateAttrs() {
    this._super(...arguments);
    set(this, 'isLoading', true);
  }
});
