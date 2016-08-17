// index
import Route from 'ember-route';
export default Route.extend({
  actions: {
    indexSearch() {
      this.transitionTo('search', {
        queryParams: {
          q: this.controller.get('searchVar'),
          resource: 'grant'
        }
      });
    }
  }
});
