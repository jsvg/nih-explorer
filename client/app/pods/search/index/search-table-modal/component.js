// search-table-modal
import Component from 'ember-component';
export default Component.extend({
  actions: {
    /**
     * Used to dynamically out-link in modals
     */
    goToPubMed(pmid) {
      let url = `http://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;
      window.open(url);
    }
  }
});
