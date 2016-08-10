import Component from 'ember-component';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import moment from 'moment';

export default Component.extend({
  // suggestive placeholder for collection naming 
  inputPlaceholder: computed(function() {
    return `custom grant set ${moment().format('MM/DD/YYYY')}`;
  }),

  actions: {
    resetName() {
      set(this, 'name', null); // reset name after closing modal
    }
  }
});
