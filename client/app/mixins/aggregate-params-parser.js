import Ember from 'ember';
const { Mixin } = Ember;
export default Mixin.create({
  makeAggregateQueryParam(params, aggOn) {
    let tmpParams = {};
    tmpParams.resource = 'grant';
    tmpParams.field = aggOn;

    for ( let key in params ) {
      if ( !params.hasOwnProperty(key) ) { continue; }
      if ( key === 'resource' ) { continue; }
      tmpParams[key] = params[key];
    }

    return tmpParams;
  }
});
