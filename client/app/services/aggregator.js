import Ember from 'ember';
const { Service, inject: {service} , get, RSVP: {Promise} } = Ember;
export default Service.extend({
  ajax: service(),

  aggregate(resource, params) {
    if ( !params.q ) {
      delete params.q;
    }
    return new Promise((resolve) => {
      get(this, 'ajax').request(resource, {
        method: 'GET',
        data: params
      }).then(result => {
        if ( params.aggBy === 'count' ) {
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
