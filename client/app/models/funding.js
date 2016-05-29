import Fragment from 'model-fragments/fragment';
import attr from 'ember-data/attr';
export default Fragment.extend({
  ic: attr('string'),
  cost: attr('string')
});
