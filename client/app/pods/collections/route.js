import Ember from 'ember';
const { Route, inject: { service }, get } = Ember;
export default Route.extend({
  ajax: service(),

  model() {
    const uuid = 1; // will be managed from a user session later
    return get(this, 'ajax').request(`/collections/${uuid}`);
  },

  actions: {
    deleteCollection(collection) {
      const url = `collections/${collection._id}`;
      get(this, 'ajax').delete(url).then(() => {
        // trigger model refresh and subsequent component update
        this.refresh();
      });
    },
    visitResults(queryParams) {
      // clean queryParams
      delete queryParams.uuid;
      delete queryParams._id;

      this.transitionTo('search', { queryParams });
    }
  }
});
