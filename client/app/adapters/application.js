// application adapter
import JSONAPIAdapter from 'ember-data/adapters/json-api';
import config from 'client/config/environment';

export default JSONAPIAdapter.extend({
  host: config.apiHost,
  namespace: config.apiNamespace
});
