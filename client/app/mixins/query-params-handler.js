import Ember from 'ember';
const { Mixin } = Ember;
export default Mixin.create({

  /*
   * Currently setup to clean up qps to remove null
   * and prototyping objects before passing to AJAX,
   * however, might be proper place to handle object-
   * based querying in url params, see ghetto logic
   */
  remapParams(params) {
    // new object initiated, will be populated with valid qps
    let cleanParams = {};

    // make sure params exist
    if ( params ) {
      // loop through each term in params
      for ( let term in params ) {
        /*
         * 1. Pass on prototyping methods
         * 2. Pass on null values
         */
        if ( !params.hasOwnProperty(term) ) { continue; }
        if ( !params[term] ) { continue; }

        // if qp term is valid, add it to fresh object
        cleanParams[term] = params[term];
        
        /*
         * Ghetto logic to handle object QPs
         *
         * JSON.parse() will error out on strings,
         * so let try {} parse arrays, objs, nums
         * and let catch {} assign strings
         *
         * However, where there are multiple of the same QPs,
         * i.e. all arrays, need to prevent overwriting
        
        try {
          cleanParams[term] = JSON.parse(params[term]);
        }
        catch(err) {
          cleanParams[term] = params[term];
          console.log(err);
        }
         */
      }
    }
    return cleanParams;
  },

  /* prepares QPs for aggregate API route
   * called in routes to restrcuture native
   * ember params on the fly to allow multi-
   * model route queries
   */
  makeAggregateQueryParam(params, aggOn, method, methodOn, resource) {
    // new params object to be appended to and returned
    let tmpParams = {};
    tmpParams.resource = resource || 'grant';

    // for aggregations beyond counting:
    if ( aggOn ) { tmpParams.aggBy = aggOn; }
    if ( method ) { tmpParams.aggMethod = method; }
    if ( methodOn ) { tmpParams.aggOn = methodOn; }

    // build out tmpParams object with valid qp terms
    for ( let key in params ) {
      if ( !params.hasOwnProperty(key) ) { continue; }
      if ( key === 'resource' ) { continue; }
      tmpParams[key] = params[key];
    }

    return tmpParams;
  }

});
