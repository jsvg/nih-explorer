import Component from 'ember-component';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Component.extend({
  ajax: service(),

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
          return result.data;
        }).catch(err => {
          console.log(err);
          return '-';
        });
    }

    set(this, 'promise', getData(this));
  }
});
