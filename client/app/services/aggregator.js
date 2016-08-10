import Service from 'ember-service';
import get from 'ember-metal/get';
import service from 'ember-service/inject';
import RSVP from 'rsvp';

export default Service.extend({
  ajax: service(),

  aggregate(resource, params) {
    if ( !params.q ) {
      delete params.q;
    }
    return new RSVP.Promise((resolve) => {
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
