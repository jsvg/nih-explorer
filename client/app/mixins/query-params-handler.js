import Ember from 'ember';
const { Mixin } = Ember;
export default Mixin.create({

  // parse general params
  remapParams(params) {
    let cleanParams = {};
    if ( params ) {
      for ( let term in params ) {
        if ( !params.hasOwnProperty(term) ) { continue; }
        if ( !params[term] ) { continue; }
        if ( !Object.keys(params[term]).length ) { continue; }
        
        /*
         * Ghetto logic to handle object QPs
         *
         * JSON.parse() will error out on strings,
         * so let try {} parse arrays, objs, nums
         * and let catch {} assign strings
         *
         * However, where there are multiple of the same QPs,
         * i.e. all arrays, need to prevent overwriting
         */
        try {
          cleanParams[term] = JSON.parse(params[term]);
        }
        catch(err) {
          cleanParams[term] = params[term];
          console.log(err);
        }
      }
    }
    return cleanParams;
  },

  // prepares QPs for aggregate API route
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
