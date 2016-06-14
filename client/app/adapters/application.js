// application adapter
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import config from 'client/config/environment';

export default JSONAPIAdapter.extend({
  host: config.apiHost,
  namespace: config.apiNamespace,

  ajax(url, type, options) {
    const log = false;
    if ( log ) {
      console.log('+AJAX: ', type, url, options.data);
    }
    return this._super(...arguments);
  }
});
