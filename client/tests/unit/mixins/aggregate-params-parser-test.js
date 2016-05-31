import Ember from 'ember';
import AggregateParamsParserMixin from 'client/mixins/aggregate-params-parser';
import { module, test } from 'qunit';

module('Unit | Mixin | aggregate params parser');

// Replace this with your real tests.
test('it works', function(assert) {
  let AggregateParamsParserObject = Ember.Object.extend(AggregateParamsParserMixin);
  let subject = AggregateParamsParserObject.create();
  assert.ok(subject);
});
