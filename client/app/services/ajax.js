import config from 'client/config/environment';
import { assert } from 'ember-metal/utils';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  host: `${config.apiHost}/${config.apiNamespace}`,

  /**
   * Helper function for
   * aggregation requests
   */
  aggregate(resource, params) {
    if (!params.q) { delete params.q; }
    return this.request(resource, {
      method: 'GET',
      data: params
    }).then((result) => {
      if (params.aggBy === 'count') {
        return result.data[0].attributes.value;
      }
      return result.data;
    }).catch((err) => {
      assert(err);
      return '-';
    });
  }
});
