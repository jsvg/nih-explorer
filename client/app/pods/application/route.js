// application
import Route from 'ember-route';
import get from 'ember-metal/get';
import $ from 'jquery';

export default Route.extend({
  setupController(controller) {
    this._super(...arguments);
    controller.set('showNav', get(this, 'showNav'));
    controller.set('placeholder', 'Search NIH spending...');
  },

  actions: {
    search() {
      let q = this.controller.get('searchVar');
      this.controller.set('searchVar', null);
      if (q === this.controllerFor('search').get('q')) {
        this.controller.set('placeholder', 'Search NIH spending...');
      } else {
        this.controller.set('placeholder', 'searching...');
        this.controllerFor('search').set('offset', 0);
        this.transitionTo('search', { queryParams: { q } });
      }
    }
  }
});

/**
 * Attach loading actions to all routes
 * toggle isLoading property controlls
 * loading-slider component,
 * and remove loading animation
 * from index.html after static assets DLd
 */
Route.reopen({
  beforeModel() {
    this._super(...arguments);
    // rapid toggle of property triggers
    // didUpdateAttrs() on loading-slider - happening in bg on component
    this.controllerFor('application').set('isLoading', false);
    this.controllerFor('application').set('isLoading', true);
  },
  actions: {
    didTransition() {
      this._super(...arguments);
      $('#apploading').fadeOut('fast');
      this.controllerFor('application').set('isLoading', false);
    },
	//transition is a promise that fulfills when loading state is done of any request
    loading(transition) {
      this._super(...arguments);
      this.controllerFor('application').set('isLoading', true);
      transition.promise.finally(() => {
        this.controllerFor('application').set('isLoading', false);
        this.controllerFor('application').set('placeholder', 'Search NIH spending...');
      });
    }
  }
});
