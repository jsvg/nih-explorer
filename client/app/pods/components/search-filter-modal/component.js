import Ember from 'ember';
const { Component } = Ember;
export default Component.extend({
  actions: {
    toggleFilter(filterProps) {
      this.sendAction('toggleFilter', filterProps);
    }
  }
});
