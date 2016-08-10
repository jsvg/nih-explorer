import Controller from 'ember-controller';
import { reads } from 'ember-computed';
import set from 'ember-metal/set';
import controller from 'ember-controller/inject';
import $ from 'jquery';

export default Controller.extend({
  searchController: controller('search'),
  pagination: reads('searchController.meta.pagination'),

  isShowingModal: false,

  actions: {
    /* line-item product modals */
    showModal(grant) {
      set(this, 'modalGrant', grant);
      this.toggleProperty('isShowingModal');
    },

    /**
     * pagination function used by table
     * reset by filterSelection()
     */
    paginator(n) {
      set(this, 'searchController.offset', Number(n));
      $('html, body').animate({ scrollTop: 0 });
    }
  }
});
