'use strict';
const reHelper = require('./helpers').reHelper,
      expect = require('chai').expect;

describe('Top-level routes loaded', () => {
  function ex(res) { return expect(res.status).to.equal(200); }
  reHelper('returns 200 status', '/', ex);
});

describe('Grants route', () => {
  function ex1(res) { return expect(res.body.meta.count).to.equal(58623); }
  reHelper('has 58623 docs in response meta', '/grants', ex1);

  let query = {'filter[activity]': 'R01', 'filter[administeringIc]': 'HL'};
  function ex2(res) { return expect(res.body.meta.count).to.equal(2614); }
  reHelper('proper filtering', '/grants', ex2, query);
  
});

describe('Aggregation API', () => {

  describe('Default aggregation', () => {
    let query = {field: 'grant.icName'};
    function ex1(res) {
      return expect(res.body.data.length).to.equal(44),
        expect(res.body.data[0].attributes.value).to.equal(8136);
    }
    reHelper('proper distinct items, and aggregation count', '/aggregate', ex1, query);
  });

  describe('Avg agg on total cost', () => {
    let query = {field:'grant.icName', agg:'$avg', on:'$totalCost'};
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('proper distinct items, and aggregation count', '/aggregate', ex1, query);
  });

  describe('Avg agg on total cost', () => {
    let query = {field:'grant.icName', agg:'$avg', on:'$totalCost'};
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('proper distinct items, and aggregation count', '/aggregate', ex1, query);
  });
});

describe('Search API', () => {

  describe('Search for "pharmacology" in grant resource', () => {
    let query = {q: 'pharmacology', 'resource':'grant'};
    function ex1(res) { return expect(res.body.meta.total).to.equal(5476); }
    reHelper('search returns 5476 docs', '/search', ex1, query);
  });

  describe('Search for "pharmacology" in grant resource', () => {

    let query = {
      resource: 'grant',
      q: 'cancer',
      icName: 'NATIONAL CANCER INSTITUTE',
      orgState: ['VA','CA','TX','MA'],
      awardNoticeDate: {
        '>=': '2016-01-01'
      },
      totalCost: {
        '>': '1000000'
      }
    };
    function ex1(res) { return expect(res.body.meta.total).to.equal(14); }
    reHelper('search returns 911 docs', '/search', ex1, query);
  });
});

// ember test
// $E.store.query('search', {resource: 'grant', q: 'cancer', icName: 'NATIONAL CANCER INSTITUTE', orgState: ['VA','CA','TX','MA'], totalCost: {'>': '1000000' }, awardNoticeDate: {'>=': '01-01-2016'} })
