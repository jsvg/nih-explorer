// index
import Route from 'ember-route';
export default Route.extend({
  actions: {
    search() {
      this.transitionTo('search', {
        queryParams: {
          q: this.controller.get('searchVar'),
          resource: 'grant'
        }
      });
    }
  }
});
