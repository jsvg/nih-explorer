import Ember from 'ember';
import moment from 'moment';
const { Component, computed, set } = Ember;
export default Component.extend({
  // used to provide suggestive placeholder for collection naming 
  inputPlaceholder: computed(function() {
    return `custom grant set ${moment().format('MM/DD/YYYY')}`;
  }),

  actions: {
    // needed to reset name after closing modal
    resetName() {
      set(this, 'name', null);
    }
  }
});
