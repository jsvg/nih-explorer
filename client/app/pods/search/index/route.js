// search.index
import Route from 'ember-route';
import $ from 'jquery';

export default Route.extend({
  /**
   * Set initial modal state to not show
   * and make search route model's pagination
   * links in JSON response available for table
   */
  setupController(controller) {
    this._super(...arguments);
    let paginationLinks = this.controllerFor('search').get('meta.pagination');
    controller.setProperties({
      isShowingModal: false,
      paginationLinks
    });
  },

  actions: {
    /**
     * Sets modalGrant to grant
     * of clicked table row
     */
    setModalGrant(grant) {
      this.controller.set('modalGrant', grant);
    },

    /**
     * Pagination function used by table
     * prev and next buttons. Reset by
     * filterSelection() in parent route
     */
    paginator(cursorPosition) {
      this.controllerFor('search').set('offset', Number(cursorPosition));
      $('html, body').animate({ scrollTop: 0 });
    }
  }
});
