import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('multi-test.real-deal', 'Integration | Component | multi test.real deal', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{multi-test.real-deal}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#multi-test.real-deal}}
      template block text
    {{/multi-test.real-deal}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
