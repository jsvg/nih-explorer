// data-filter
import Component from 'ember-component';
import { assert } from 'ember-metal/utils';
import { reads } from 'ember-computed';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),
  noResults: false,
  placeholder: reads('properties.placeholder'),

  promise(that) {
    let ajax = get(that, 'ajax'),
      props = get(that, 'properties'),
      aggBy = props.filterAttr,
      params = Object.assign({ aggBy }, props.currentParams);

    if (!params.q) { delete params.q; }
    if (params.offset) { delete params.offset; }
    return ajax.request(props.resource, {
      method: 'GET',
      data: params
    }).then((result) => {
      if (!that.isDestroyed) {
        set(that, 'promiseResults', result.data);

        // no results or one null result
        if (result.data[0].id === '' && result.data.length <= 1) {
          set(that, 'noResults', true);
          set(that, 'placeholder', 'No options available');
        // needs to be reset otherwise
        } else {
          set(that, 'noResults', false);
          set(that, 'placeholder', props.placeholder);
        }
        return result.data;
      }
    }).catch((err) => {
      assert('data-filter component error:', err);
      if (!that.isDestroyed) {
        return { id: 'error' };
      }
    });
  },

  didReceiveAttrs() {
    this._super(...arguments);
    set(this, 'results', get(this, 'promise')(this));
  },

  didUpdateAttrs() {
    set(this, 'loading', true);
    set(this, 'placeholder', 'Searching...');
  }
});
