// search
import Ember from 'ember';
const { Controller, computed, get, set } = Ember;
export default Controller.extend({
  queryParams: ['resource','q','orgCountry','icName','totalCost',
                'fundingMechanism','activity','offset'],
  resource: 'grant',
  q: null,
  icName: null,
  totalCost: null,
  fundingMechanism: null,
  activity: null,
  orgCountry: null,
  offset: 0,

  // relatively ineffective way to populate inputs
  /*
  minCost: computed('totalCost', function() {
    return parseInt(JSON.parse(this.get('totalCost'))['>']) || null;
  }),
  maxCost: computed('totalCost', function() {
    return parseInt(JSON.parse(this.get('totalCost'))['<']) || null;
  }),
  */

  // modal properties
  isShowingModal: false,
  modalGrant: null,

  // c3 properties
  activityChartData: computed('model.activities', function() {
    let activities = get(this, 'model.activities');

    return activities;
  }),

  c3Axis: {
    x: {
      type: 'category'
    },
    y: {
      label: {
        text: 'Total Weight',
        position: 'outer-middle'
      }
    },
    y2: {
      show: true,
      label: {
        text: 'Num. Products',
        position: 'outer-middle'
      }
    }
  },
  c3Legend: {
    position: 'inset',
    inset: {
      anchor: 'top-right',
      x: 25,
      y: 10,
      step: 1
    }
  },
  c3Tooltip: {
    format: { value(v) { return Math.round(v); }}
  },
  c3Padding: {
    top: 15
  },

  actions: {
    showDetails(id) {
      this.transitionToRoute('grants.grant', {grant_id: id});
    },

    showModal(grant) {
      set(this, 'modalGrant', grant);
      this.toggleProperty('isShowingModal');
    },

    goToPubMed(pmid) {
      let url = 'http://www.ncbi.nlm.nih.gov/pubmed/' + pmid;
      window.open(url);
    },

    filterSelection(target, vals) {
      let setTo = vals ? vals.get('id') : null;
      set(this, target, setTo);
    },

    setMaxCost(cost) {
      set(this, 'totalCost', {'<': cost});
    },
    setMinCost(cost) {
      set(this, 'totalCost', {'>': cost});
    },

    paginator(n) {
      set(this, 'offset', Number(n));
    }
  }
});
