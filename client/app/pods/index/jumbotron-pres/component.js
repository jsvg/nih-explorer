import Component from 'ember-component';
import hbs from 'htmlbars-inline-precompile';

const Jumbotron = Component.extend({
  layout: hbs`
    {{index.info-modal}}
  `
});

export default Jumbotron;
