import Ember from 'ember';
const { Service, inject, run, RSVP } = Ember;
export default Service.extend({
  ajax: inject.service(),

  aggregate(resource, agg, on, field) {
    console.log('fire1');
    return new RSVP.Promise((resolve) => {
      console.log('fire2');
      run.later(() => {
        console.log('fire3');
        resolve(1234);
      }, 1500);
    });
  }
});
