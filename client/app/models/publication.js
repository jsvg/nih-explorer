import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import { array } from 'model-fragments/attributes';

export default Model.extend({
  affiliation: attr('string'),
  authors: array(),
  country: attr('string'),
  issn: attr('string'),
  journalIssue: attr('number'),
  journal: attr('string'),
  journalVol: attr('number'),
  lang: attr('string'),
  page: attr('string'),
  pmcId: attr('number'),
  pubDate: attr('string'),
  title: attr('string'),
  pubYear: attr('number'),
  projects: hasMany('grant')
});
