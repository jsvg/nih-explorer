// search
import Ember from 'ember';
const { Controller, get, isEmpty } = Ember;
export default Controller.extend({
  queryParams: ['q', 'where'],
  q: null,
  where: {},

  actions: {
    update() {
      const filterFields = ['fundingMechanism','administeringIc'];
      let where = {};
      filterFields.forEach((field) => {
        let obj = get(this,field);
        if ( !isEmpty(obj) ) {
          where[field] = obj.getEach('id');
        }
      });

      let query = {};
      query.q = get(this, 'q');
      query.where = where;
      this.transitionToRoute({queryParams: query});
    }
  }
});
