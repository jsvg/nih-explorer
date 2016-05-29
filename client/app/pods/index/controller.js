// index
import Ember from 'ember';
const { Controller, get } = Ember;
export default Controller.extend({
  actions: {
    search() {
      this.transitionToRoute('search', {
        queryParams: {q: get(this,'searchVar')}
      });
    }
  }
});
