import Ember from 'ember';
const { Controller, set, computed, inject, $ } = Ember;
export default Controller.extend({
  searchController: inject.controller('search'),
  meta: computed.reads('searchController.meta'),

  // modal properties
  isShowingModal: false,
  modalGrant: null,
  actions: {
    /* line-item product modals */
    showModal(grant) {
      set(this, 'modalGrant', grant);
      this.toggleProperty('isShowingModal');
    },

    /* used to dynamically out-link in modals */
    goToPubMed(pmid) {
      const url = `http://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;
      window.open(url);
    },

    /* pagination function used by table
     * reset by filterSelection()
     */
    paginator(n) {
      set(this, 'searchController.offset', Number(n));
      $('html, body').animate({ scrollTop: 0 });
    }
  }
});
