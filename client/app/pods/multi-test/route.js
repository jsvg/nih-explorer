import Route from 'ember-route';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';
import { assert } from 'ember-metal/utils';

export default Route.extend({
  queryParams: {
    orgState: { refreshModel: true },
    icName: { refreshModel: true }
  },

  ajax: service(),

  model(params) {
    return get(this, 'ajax')
      .request('grants', {
        method: 'GET',
        data: params
      })
      .then((result) => {
        return result.data;
      })
      .catch((err) => {
        assert(err);
        return '-';
      });
  },

  setupController(controller) {
    this._super(...arguments);
    controller.set('urlQueryParams', this.paramsFor('multi-test'));
  },

  actions: {
    selectionMade(filterKey, selections) {
      this.controller.set(filterKey, selections.mapBy('id'));
    }
  }
});
