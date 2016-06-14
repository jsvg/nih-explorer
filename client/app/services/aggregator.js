import Ember from 'ember';
const { Service, inject, get, RSVP } = Ember;
export default Service.extend({
  ajax: inject.service(),

  aggregate(params) {
    return new RSVP.Promise((resolve) => {
      get(this, 'ajax').request('/grant', {
        method: 'GET',
        data: params
      }).then(result => {
        if ( !params.hasOwnProperty('field') ) {
          resolve(result.data[0].attributes.value);
        } else {
          resolve(result.data);
        }
      }).catch(err => {
        console.log(err);
        resolve('-');
      });
    });
  }
});
