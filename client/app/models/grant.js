import Ember from 'ember';
const { computed } = Ember;
import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import {
  fragmentArray,
  array
} from 'model-fragments/attributes';

export default Model.extend({
  // primary attrs
  activity: attr('string'),
  administeringIc: attr('string'),
  applicationType: attr('string'),
  awardNoticeDate: attr('string'),
  budgetStart: attr('string'),
  budgetEnd: attr('string'),
  edInstType: attr('string'),
  fundingMechanism: attr('string'),
  fy: attr('string'),
  icName: attr('string'),
  orgCity: attr('string'),
  orgCountry: attr('string'),
  orgDept: attr('string'),
  orgDistrict: attr('string'),
  orgDuns: attr('string'),
  orgFips: attr('string'),
  orgName: attr('string'),
  orgState: attr('string'),
  orgZip: attr('string'),
  phr: attr('string'),
  programOfficerName: attr('string'),
  projectTitle: attr(),
  projectStart: attr('string'),
  projectEnd: attr('string'),
  studySection: attr('string'),
  studySectionName: attr('string'),
  supportYear: attr('string'),
  totalCost: attr('string'),
  activityType: attr('string'),
  // nested attrs
  fundingIcs: fragmentArray('funding'),
  nihSpendingCats: array(),
  projectTerms: array(),
  piIds: array(),
  piNames: array(),
  publications: hasMany('publication'),
  pubCount: computed('publications', function() {
    return this.get('publications.length');
  })
});
