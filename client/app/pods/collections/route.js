import Ember from 'ember';
const { Route, inject: { service }, get } = Ember;
export default Route.extend({
  ajax: service(),
  model() {
    let data = get(this, 'ajax').request('/collections/1');
    console.log(data);
    return data;
  }
});
