'use strict';
const reHelper = require('./helpers').reHelper,
      expect = require('chai').expect;


describe('Top-level routes loaded', function() {
  function ex(res) { return expect(res.status).to.equal(200); }
  reHelper('returns 200 status', '/', ex);
});


describe('Grants route', function() {
  function ex1(res) { return expect(res.body.meta.count).to.equal(58623); }
  reHelper('has 58623 docs in response meta', '/grants', ex1);

  let query = {
    'filter[activity]': 'R01',
    'filter[administeringIc]': 'HL'
  };
  function ex2(res) { return expect(res.body.meta.count).to.equal(2614); }
  reHelper('proper filtering', '/grants', ex2, query);
  
});


describe('Aggregation API', function() {

  describe('Default aggregation', function() {
    let query = {
      resource: 'grant',
      field: 'icName'
    };
    function ex1(res) {
      return expect(res.body.data.length).to.equal(44),
        expect(res.body.data[0].attributes.value).to.equal(8136);
    }
    reHelper('proper distinct items, and aggregation count', '/aggregate', ex1, query);
  });

  describe('Avg agg on total cost', function() {
    let query = {
      resource: 'grant',
      field:'icName',
      agg:'$avg',
      on:'$totalCost'
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('only returns one item for NCI', '/aggregate', ex1, query);
  });

  describe('Test agg with null filter value', function() {
    let query = {
      resource: 'grant',
      field: 'icName',
      icName: ''
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('should return same value as if icName were not a param', '/aggregate', ex1, query);
  });

  describe('Avg agg on total cost w for >$1MM NCI only by org state', function() {
    let query = {
      resource: 'grant',
      field:'orgState',
      agg:'$sum',
      on:'$totalCost',
      icName: 'NATIONAL CANCER INSTITUTE',
      totalCost: {'>': '1000000' }
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(45); }
    function ex2(res) {
      return expect(Math.ceil(res.body.data[0].attributes.value)).to.equal(581179112);
    }
    reHelper('proper distinct items for each org state', '/aggregate', ex1, query);
    reHelper('first value has value of 581179112', '/aggregate', ex2, query);
  });

  describe('Agg w a search and complex query embedded', function() {
    let query = {
      resource: 'grant',
      field: 'icName',
      agg: '$sum',
      on: '$totalCost',
      orgState: ['VA','MD','MA'],
      totalCost: {'>': '1000000'},
      awardNoticeDate: {
        '>=': '2016-01-01'
      },
      q: 'cancer'
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(5); }
    function ex2(res) {
      return expect(res.body.data[0].attributes.value).to.equal(418294512);
    }
    reHelper('returns 15 docs total', '/aggregate', ex1, query);
    reHelper('first doc has value of 418294512', '/aggregate', ex2, query);
  });
});


describe('Search API', function() {

  describe('1. Blank search returns all docs', function() {
    let query = {
      resource: 'grant'
    };
    function ex1(res) { return expect(res.body.meta.total).to.equal(58623); }
    reHelper('returns all docs', '/search', ex1, query);
  });

  describe('2. Retrieve >=$1MM docs for NCI by search route', function() {
    let query = {
      resource: 'grant',
      icName: 'NATIONAL CANCER INSTITUTE',
      totalCost: {
        '>=': '1000000'
      }
    };
    function ex1(res) { return expect(res.body.meta.total).to.equal(728); }
    reHelper('returns all docs', '/search', ex1, query);
  });

  describe('3. Search for a term in a resource', function() {
    let query = {
      q: 'pharmacology',
      resource:'grant'
    };
    function ex1(res) { return expect(res.body.meta.total).to.equal(5476); }
    reHelper('search returns 5476 docs', '/search', ex1, query);
  });

  // sometimes fails arbitrarily
  describe('4. Search with all implementations of filters', function() {
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

  describe('5. Make sure bogus query param does not cause get consumer', function() {
    let query = {
      resource: 'grant',
      q: 'pharmacology',
      foo: 'bar',
      baz: {'>': 'bing'}
    };
    function ex1(res) { return expect(res.body.meta.total).to.equal(5476); }
    reHelper('search returns 5476 docs', '/search', ex1, query);
  });
});

// ember test
// $E.store.query('search', {resource: 'grant', q: 'cancer', icName: 'NATIONAL CANCER INSTITUTE', orgState: ['VA','CA','TX','MA'], totalCost: {'>': '1000000' }, awardNoticeDate: {'>=': '01-01-2016'} })
