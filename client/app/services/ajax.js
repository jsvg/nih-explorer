import config from 'client/config/environment';
import AjaxService from 'ember-ajax/services/ajax';

export default AjaxService.extend({
  host: `${config.apiHost}/${config.apiNamespace}`,
  
  /**
   * Helper function for
   * aggregation requests
   */
  aggregate(resource, params) {
    if ( !params.q ) { delete params.q; }
    return this.request(resource, {
      method: 'GET',
      data: params
    }).then(result => {
      if ( params.aggBy === 'count' ) {
        return result.data[0].attributes.value;
      } else {
        return result.data;
      }
    }).catch(err => {
      console.log(err);
      return '-';
    });
  }
});
