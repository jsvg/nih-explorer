import Route from 'ember-route';
import $ from 'jquery';
export default Route.extend({
  /**
   * Remove loading animation in index.html
   * after static assets have been downloaded
   */
  afterModel() {
    $('#apploading').remove();
  },

  actions: {
    didTransition() {
      this._super(...arguments);
      // reset placeholder in search bar
      this.controllerFor('application').set('placeholder', 'Search NIH spending...');
    }
  }
});

/**
 * Attach loading actions to all routes
 * toggle isLoading property controlls
 * loading-slider component
 */
Route.reopen({
  actions: {
    loading(transition, originRoute) {
      const ctrllr = this.controllerFor('application');
      ctrllr.set('isLoading', true);
      transition.promise.finally(() => {
        ctrllr.set('isLoading', false);
      });
    }
  }
});
