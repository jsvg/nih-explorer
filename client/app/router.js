/* eslint no-empty-function: 0 */
import Router from 'ember-router';
import config from './config/environment';

const emberRouter = Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('search', function() {});
  this.route('collections');
});

export default emberRouter;
