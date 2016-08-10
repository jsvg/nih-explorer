// index
import Controller from 'ember-controller';
import get from 'ember-metal/get';

export default Controller.extend({
  actions: {
    search() {
      this.transitionToRoute('search', {
        queryParams: {q: get(this,'searchVar'), resource: 'grant'}
      });
    }
  }
});
