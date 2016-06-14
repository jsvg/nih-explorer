import JSONAPISerializer from 'ember-data/serializers/json-api';
export default JSONAPISerializer.extend({

  /*
   * Add pagination links to meta object to allow access in templates
   */
  normalizeArrayResponse(...args) {
    const normalized = this._super(...args);

    if (normalized.meta == null) {
      normalized.meta = {};
    }
    normalized.meta.pagination = {};

    // add raw links to meta object
    normalized.meta.pagination.links = normalized.links;
    
    // parse offset value and add to meta object
    for ( var key in normalized.links ) {
      const offsetMatch = normalized.links[key].match(/offset=(\d*)/);
      if ( offsetMatch ) {
        normalized.meta.pagination[key] = Number(normalized.links[key].match(/offset=(\d*)/)[1]) || 0;
      } else {
        normalized.meta.pagination[key] = 0;
      }
    }
    
    return normalized;
  }
});
