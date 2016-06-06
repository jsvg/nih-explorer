import Ember from 'ember';
import QueryParamsHandlerMixin from 'client/mixins/query-params-handler';
import { module, test } from 'qunit';

module('Unit | Mixin | query params handler');

// Replace this with your real tests.
test('it works', function(assert) {
  let QueryParamsHandlerObject = Ember.Object.extend(QueryParamsHandlerMixin);
  let subject = QueryParamsHandlerObject.create();
  assert.ok(subject);
});
