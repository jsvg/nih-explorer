// search
import Ember from 'ember';
const { Controller, set } = Ember;
export default Controller.extend({
  queryParams: ['resource', 'q', 'administeringIc', 'fundingMechanism'],
  resource: 'grant',
  q: null,
  administeringIc: null,
  fundingMechanism: null,

  actions: {
    filterSelection(target, vals) {
      let setTo = vals ? vals.get('id') : null;
      set(this, target, setTo);
    }
  }
});
