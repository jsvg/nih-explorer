import Ember from 'ember';
const { Component, inject: { service }, get, set } = Ember;
export default Component.extend({
  aggregator: service(),

  didReceiveAttrs() {
    const api = get(this, 'aggregator'),
          resource = get(this, 'resource'),
          aggBy = get(this, 'filterAttr'),
          currentParams = get(this, 'currentParams');

    // set 'format' with filter item format, default title
    const passedFormat = get(this, 'itemFormat') || 'title';
    set(this, 'format', passedFormat);

    // set 'results' with filter items
    const params = Object.assign({ aggBy }, currentParams);
    api.aggregate(resource, params).then(result => {
      if ( !this.isDestroyed ) {
        set(this, 'results', result);
      }
    });
  }
});
