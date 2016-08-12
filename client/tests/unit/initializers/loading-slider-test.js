import Ember from 'ember';
import LoadingSliderInitializer from 'client/initializers/loading-slider';
import { module, test } from 'qunit';

let application;

module('Unit | Initializer | loading slider', {
  beforeEach() {
    Ember.run(function() {
      application = Ember.Application.create();
      application.deferReadiness();
    });
  }
});

// Replace this with your real tests.
test('it works', function(assert) {
  LoadingSliderInitializer.initialize(application);

  // you would normally confirm the results of the initializer here
  assert.ok(true);
});
