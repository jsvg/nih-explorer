// collections
import config from 'client/config/environment';
import Route from 'ember-route';
import get from 'ember-metal/get';
import service from 'ember-service/inject';
import $ from 'jquery';

export default Route.extend({
  ajax: service(),

  model() {
    let uuid = 1; // will be managed from a user session later
    return get(this, 'ajax').request(`/collections/${uuid}`);
  },

  extractQueryParams(collection) {
    let queryParams = {};
    for (let key in collection) {
      // gets all filterParams[*] from collection object
      if (/filterParams/.test(key)) {
        // eslint-disable-next-line ember-suave/prefer-destructuring
        let filterName = key.match(/\[(.*)\]/)[1];
        queryParams[filterName] = collection[key];
      }
    }
    return queryParams;
  },

  actions: {
    viewCollection(collection) {
      let queryParams = get(this, 'extractQueryParams')(collection);
      this.transitionTo('search', { queryParams });
    },

    editCollection() {
      // todo
    },

    exportCollection(collection) {
      let queryParams = get(this, 'extractQueryParams')(collection);
      queryParams.export = true;
      let url = `${config.apiHost}/${config.apiNamespace}/grants/?${$.param(queryParams)}`;
      window.open(url, 'Download');
    },

    deleteCollection(collection) {
      let url = `collections/${collection._id}`;
      get(this, 'ajax').delete(url).then(() => {
        this.refresh(); // trigger model refresh and subsequent component update
      });
    }
  }
});
