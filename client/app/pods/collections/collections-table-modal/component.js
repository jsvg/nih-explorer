// collections-table-modal
import Component from 'ember-component';
import get from 'ember-metal/get';
import computed from 'ember-computed';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),

  notesPlaceholder: 'Begin typing collection notes...',

  clxnFilters: computed('collectionData', function() {
    let clxn = get(this, 'collectionData');
    let filters = this.extractQueryParams(clxn);
    return filters;
  }),

  clxnFilterKeys: computed('clxnFilters', function() {
    return Object.keys(get(this, 'clxnFilters'));
  }),

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
    saveNote() {
      // todo
    }
  }
});
