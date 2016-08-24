/* eslint no-empty-function: 0 */
import Router from 'ember-router';
// import service from 'ember-service/inject';
// import get from 'ember-metal/get';
// import { next } from 'ember-runloop';
import config from './config/environment';

const emberRouter = Router.extend({
  // redux: service('redux'),
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('search', function() {});
  this.route('collections');
});

// let isTimeTraveling = false;
// const timeTravel = () => {
//   let redux = this.get('redux'),
//     current = this.currentPath,
//     routerState = redux.getState().router,
//     path, params = routerState;

//   if (path !== current) {
//     isTimeTraveling = true;
//     if (Object.keys(routerState.params).length > 0) {
//       this.transitionTo(path, params);
//     } else {
//       this.transitionTo(path);
//     }
//     next(function() {
//       isTimeTraveling = false;
//     });
//   }
// };

// Router.reopen({
//   didTransition() {
//     this._super(...arguments);
//     let redux = get(this, 'redux');
//     redux.subscribe(timeTravel.bind(this));

//     if (!isTimeTraveling) {
//       let path = this.currentPath,
//         params = get(this, 'currentState.routerJsState').params[path];
//       redux.dispatch({ type: '@@router/LOCATION_CHANGE', path, params });
//     }
//   }
// });

export default emberRouter;
