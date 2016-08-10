import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('data-filter/filter-dropdown', 'Integration | Component | data filter/filter dropdown', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{data-filter/filter-dropdown}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#data-filter/filter-dropdown}}
      template block text
    {{/data-filter/filter-dropdown}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
