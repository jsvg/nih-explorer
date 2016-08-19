import Controller from 'ember-controller';

export default Controller.extend({
  queryParams: [
    'orgState',
    'icName'
  ],
  orgState: [],
  icName: []
});
