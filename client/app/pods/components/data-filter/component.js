import Component from 'ember-component';
import { reads } from 'ember-computed';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),
  noResults: false,
  disabled: false,
  placeholder: reads('properties.placeholder'),

  didReceiveAttrs() {
    const ajax = get(this, 'ajax'),
          props = get(this, 'properties'),
          aggBy = props.filterAttr;

    const params = Object.assign({aggBy, 'limit': 10}, props.currentParams);

    function getData(that) {
      if ( !params.q ) { delete params.q; }
      return ajax.request(props.resource, {
          method: 'GET',
          data: params
        }).then(result => {
          if ( !that.isDestroyed ) {
            set(that, 'promiseResults', result.data);
          }
          // no results
          if ( result.data[0].id === '' ) {
            set(that, 'noResults', true);
            set(that, 'placeholder', 'No options available');
            set(that, 'disabled', true);
          }
          return result.data;
        }).catch(err => {
          console.log(err);
          return '-';
        });
    }

    set(this, 'promise', getData(this));
  },

});
