import Route from 'ember-route';
import $ from 'jquery';
export default Route.extend({
  setupController(controller) {
    this._super(...arguments);
    controller.set('placeholder', 'Search NIH spending...');
  },

  actions: {
    search() {
      const q = this.controller.get('searchVar'),
            transitionParams = { queryParams: { q } };

      this.controller.set('searchVar', null);
      this.controller.set('placeholder', 'searching...');
      this.transitionTo('search', transitionParams);
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
    // rapid toggle of property triggers
    // didUpdateAttrs() on loading-slider - happening in bg on component
	this.controllerFor('application').set('isLoading', false);
    this.controllerFor('application').set('isLoading', true);
  },
  actions: {
    didTransition() {
      $('#apploading').fadeOut('fast');
      this.controllerFor('application').set('isLoading', false);
    },
	//transition is a promise that fulfills when loading state is done of any request
    loading(transition) {
      const ctrllr = this.controllerFor('application');
      ctrllr.set('isLoading', true);
      transition.promise.finally(() => {
        ctrllr.set('isLoading', false);
        ctrllr.set('placeholder', 'Search NIH spending...');
      });
    }
  }
});
