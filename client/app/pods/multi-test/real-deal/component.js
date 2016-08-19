import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import { assert } from 'ember-metal/utils';

export default Component.extend({
  ajax: service(),

  getData(that) {
    let params = get(that, 'currentFilters');
    params.aggBy = get(that, 'filterKey');

    return get(that, 'ajax')
      .request('grants', {
        method: 'GET',
        data: params
      })
      .then((result) => {
        let selectedVars = params[get(that, 'filterKey')],
          selectedObjs = result.data.filter((opt) => selectedVars.contains(opt.id));
        set(that, 'selected', selectedObjs);
        return result.data;
      })
      .catch((err) => {
        assert(err);
        return '-';
      });
  },

  didReceiveAttrs() {
    this._super(...arguments);
    // make promise available to template
    set(this, 'promise', get(this, 'getData')(this));
  }
});
