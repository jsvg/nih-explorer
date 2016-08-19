// application
// must be kept for Route.reopen logic
import Controller from 'ember-controller';
import { alias } from 'ember-computed';
export default Controller.extend({
  currentRoute: alias('target.currentPath')
});
