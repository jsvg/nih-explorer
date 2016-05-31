'use strict';
const reHelper = require('./helpers').reHelper,
      expect = require('chai').expect;


describe('Top-level routes loaded', function() {
  function ex(res) { return expect(res.status).to.equal(200); }
  reHelper('returns 200 status', '/', ex);
});


describe('Fortune.js grants route', function() {
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

  describe('Default aggregation for grants', function() {
    let query = {
      resource: 'grant',
      field: 'icName'
    };
    function ex1(res) {
      return expect(res.body.data.length).to.equal(44),
        expect(res.body.data[0].attributes.value).to.equal(8136);
    }
    reHelper('returns 44 items, and aggregates first item to 8136', '/aggregate', ex1, query);
  });

  describe('Avg on total cost by icName', function() {
    let query = {
      resource: 'grant',
      field:'icName',
      agg:'$avg',
      on:'$totalCost'
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('returns 44 items for each icName', '/aggregate', ex1, query);
  });

  describe('Agg with null filter value', function() {
    let query = {
      resource: 'grant',
      field: 'icName',
      icName: ''
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(44); }
    reHelper('ignores null filter and returns 44 items', '/aggregate', ex1, query);
  });

  describe('Avg agg on total cost where totalCost>$1MM at NCI, by org state', function() {
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
    reHelper('returns 45 items for each orgState', '/aggregate', ex1, query);
    reHelper('first item has value of 581179112', '/aggregate', ex2, query);
  });

  describe('Default agg with a search and complex query', function() {
    let query = {
      resource: 'grant',
      field: 'icName',
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
    reHelper('returns 15 items', '/aggregate', ex1, query);
    reHelper('first result has value of 418294512', '/aggregate', ex2, query);
  });

  describe('Default aggregation for publications', function() {
    let query = {
      resource: 'publication',
      field: 'journal'
    };
    function ex1(res) { return expect(res.body.data.length).to.equal(5352); }
    reHelper('returns items for 5351 journals', '/aggregate', ex1, query);
  });
});


describe('Search API', function() {

  describe('Empty search on grants resource', function() {
    let query = {
      resource: 'grant'
    };
    function ex1(res) { return expect(res.body.meta.count).to.equal(58623); }
    reHelper('returns all 58623 grants', '/search', ex1, query);
  });

  describe('Empty search on grants, filtered to >=$1MM total cost and for NCI only', function() {
    let query = {
      resource: 'grant',
      icName: 'NATIONAL CANCER INSTITUTE',
      totalCost: {
        '>=': '1000000'
      }
    };
    function ex1(res) { return expect(res.body.meta.count).to.equal(728); }
    reHelper('returns 728 grants', '/search', ex1, query);
  });

  describe('Search for a "pharmacology" in grants', function() {
    let query = {
      q: 'pharmacology',
      resource:'grant'
    };
    function ex1(res) { return expect(res.body.meta.count).to.equal(5476); }
    reHelper('returns 5476 results', '/search', ex1, query);
  });

  // sometimes fails arbitrarily
  describe('Search with all filter implementations', function() {
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
    function ex1(res) { return expect(res.body.meta.count).to.equal(14); }
    reHelper('search returns 14 results', '/search', ex1, query);
  });

  describe('Search with bogus query params', function() {
    let query = {
      resource: 'grant',
      q: 'pharmacology',
      foo: 'bar',
      baz: {'>': 'bing'}
    };
    function ex1(res) { return expect(res.body.meta.count).to.equal(5476); }
    reHelper('returns 5476 results, query does not use unknown params', '/search', ex1, query);
  });

  describe('Search for "neurodegenerativity" publications', function() {
    let query = {
      resource: 'publication',
      q: 'neurodegenerativity'
    };
    function ex1(res) { return expect(res.body.meta.count).to.equal(104); }
    reHelper('returns 104 results', '/search', ex1, query);
  });

  describe('Search route offset and limits', function() {
    let query = {
      resource: 'grant',
      q: 'cancer',
      limit: 5,
      offset: 10
    };
    function ex1(res) { return expect(res.body.data[0].id).to.equal('9113110'); }
    reHelper('first result has id of 9113110', '/search', ex1, query);
    function ex2(res) { return expect(res.body.data.length).to.equal(5); }
    reHelper('results are limited to 5 items', '/search', ex2, query);
  });

  describe('Relationships contained in results (grants -> publications)', function() {
    let query = {
      resource: 'grant',
      q: 'epidemiology',
      limit: 5,
      offset: 4000
    };
    function ex1(res) {
      return expect(res.body.data[0].relationships.publications.data.length).to.equal(0);
    }
    reHelper('first result has no related grants', '/search' , ex1, query);
    function ex2(res) {
      return expect(res.body.data[1].relationships.publications.data.length).to.equal(2);
    }
    reHelper('second result has two related grants', '/search' , ex2, query);
    function ex3(res) {
      const relatedLink = 'http://localhost:8080/api/v1/grants/8786557/publications';
      return expect(res.body.data[1].relationships.publications.links.related)
        .to.equal(relatedLink);
    }
    reHelper('second result has proper related link', '/search' , ex3, query);
    function ex4(res) {
      const relatedSelfLink = 'http://localhost:8080/api/v1/grants/8786557/' +
        'relationships/publications';
      return expect(res.body.data[1].relationships.publications.links.self)
        .to.equal(relatedSelfLink);
    }
    reHelper('second result has proper related self-link', '/search' , ex4, query);
  });
});

// ember test
// $E.store.query('search', {resource: 'grant', q: 'cancer', icName: 'NATIONAL CANCER INSTITUTE', orgState: ['VA','CA','TX','MA'], totalCost: {'>': '1000000' }, awardNoticeDate: {'>=': '01-01-2016'} })
