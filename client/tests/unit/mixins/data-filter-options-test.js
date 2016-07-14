import Ember from 'ember';
import DataFilterOptionsMixin from 'client/mixins/data-filter-options';
import { module, test } from 'qunit';

module('Unit | Mixin | data filter options');

// Replace this with your real tests.
test('it works', function(assert) {
  let DataFilterOptionsObject = Ember.Object.extend(DataFilterOptionsMixin);
  let subject = DataFilterOptionsObject.create();
  assert.ok(subject);
});
