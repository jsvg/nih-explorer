import Route from 'ember-route';
export default Route.extend({
  activate() {
    this.controllerFor('search').set('isSearchIndexRoute', true);
  },
  deactivate() {
    this.controllerFor('search').set('offset', 0);
    this.controllerFor('search').set('isSearchIndexRoute', false);
  }
});
