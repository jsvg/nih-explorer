import config from 'client/config/environment';
import AjaxService from 'ember-ajax/services/ajax';
export default AjaxService.extend({
  host: `${config.apiHost}/${config.apiNamespace}`
});
