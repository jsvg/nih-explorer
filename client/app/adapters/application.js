// application adapter
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import config from 'client/config/environment';

export default JSONAPIAdapter.extend({
  host: config.apiHost,
  namespace: config.apiNamespace,

  // for case where search term (q) is provided to query
  // against grant model
  urlForQuery(query, modelName) {
    //if ( modelName === 'grant' ) {
    //  return `${this.urlPrefix()}/search`;
    //}
    return this._super(...arguments);
  },

  ajax(url, type, options) {
    const log = false;
    if ( log ) {
      console.log('+AJAX: ', type, url, options.data);
    }
    return this._super(...arguments);
  }
});
