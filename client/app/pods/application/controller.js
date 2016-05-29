// application
import Ember from 'ember';
const { Controller, inject, get } = Ember;
export default Controller.extend({
  // to reset filters on search route
  searchCtrlr: inject.controller('search'),
  
  actions: {
    search() {
      this.transitionToRoute('search', {
        queryParams: {q: get(this, 'searchVar')}
      }).then(() => {
        get(this,'searchCtrlr').set('where', null);
      });
    }
  }
});
