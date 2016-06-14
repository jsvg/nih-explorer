import Ember from 'ember';
const { Component } = Ember;
export default Component.extend({
  actions: {
    /* used to dynamically out-link in modals */
    goToPubMed(pmid) {
      const url = `http://www.ncbi.nlm.nih.gov/pubmed/${pmid}`;
      window.open(url);
    }
  }
});
