import Route from 'ember-route';
import $ from 'jquery';

export default Route.extend({
  activate() {
    this.controllerFor('search').set('isSearchIndexRoute', true);
  },
  deactivate() {
    this.controllerFor('search').set('offset', 0);
    this.controllerFor('search').set('isSearchIndexRoute', false);
  },
  setupController(controller) {
    this._super(...arguments);
    const paginationJsonData = this.controllerFor('search').get('meta.pagination');
    controller.set('isShowingModal', false);
    controller.set('paginationLinks', paginationJsonData);
  },
  actions: {
    /* line-item grant modals */
    showModalAndSetGrant(grant) {
      this.controller.set('modalGrant', grant);
      this.controller.set('isShowingModal', true);
    },
    /**
     * pagination function used by table
     * reset by filterSelection()
     */
    paginator(cursorPosition) {
      this.controllerFor('search').set('offset', Number(cursorPosition));
      $('html, body').animate({ scrollTop: 0 });
    }
  }
});
