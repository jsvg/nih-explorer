import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('search', function() {
    this.route('viz');
  });
  this.route('collections');
});

export default Router;
