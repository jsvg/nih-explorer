// search
import Ember from 'ember';
const { Controller, inject, computed, get, set, $ } = Ember;
export default Controller.extend({
  queryParams: ['resource','q','orgCountry','icName',
                'fundingMechanism','activity','offset'],
  resource: 'grant',
  q: null,
  icName: null,
  fundingMechanism: null,
  activity: null,
  orgCountry: null,
  offset: 0,

  // modal properties
  isShowingModal: false,
  modalGrant: null,

  // stat properties
  aggregator: inject.service(),
  avgForQuery: computed('q','icName','fundingMechanism','activity','orgCountry', function() {
    console.log('fire0');
    let x= null;
    get(this, 'aggregator').aggregate().then((cities) => {
      //this.set('cities', cities);
      //return cities;
      x = cities;
    });
    return x;
  }),

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
    /* line-item product modals */
    showModal(grant) {
      set(this, 'modalGrant', grant);
      this.toggleProperty('isShowingModal');
    },

    /* used to dynamically out-link in modals */
    goToPubMed(pmid) {
      let url = 'http://www.ncbi.nlm.nih.gov/pubmed/' + pmid;
      window.open(url);
    },

    /* generalized action for updating query
     * param based on filter
     */
    filterSelection(target, vals) {
      let setTo = vals ? vals.get('id') : null;
      // changing a filter returns to first page
      if ( get(this, 'offset') > 0 ) {
        set(this, 'offset', 0);
      }
      set(this, target, setTo);
    },

    /* pagination function used by table
     * reset by filterSelection()
     */
    paginator(n) {
      set(this, 'offset', Number(n));
      $('html, body').animate({ scrollTop: 0 });
    }
  }
});
