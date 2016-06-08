import Ember from 'ember';
const { Route } = Ember;
export default Route.extend({
  activate() {
    this.controllerFor('search').set('isSearchIndexRoute', true);
  },
  deactivate() {
    this.controllerFor('search').set('offset', 0);
    this.controllerFor('search').set('isSearchIndexRoute', false);
  }
});
