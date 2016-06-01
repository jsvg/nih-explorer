// search
import Ember from 'ember';
const { Controller, set } = Ember;
export default Controller.extend({
  queryParams: ['resource', 'q', 'icName', 'fundingMechanism', 'activity'],
  resource: 'grant',
  q: null,
  icName: null,
  fundingMechanism: null,
  activity: null,

  actions: {
    filterSelection(target, vals) {
      let setTo = vals ? vals.get('id') : null;
      set(this, target, setTo);
    }
  }
});
