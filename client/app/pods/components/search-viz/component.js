import Ember from 'ember';
const { Component, inject, get, set } = Ember;
export default Component.extend({
  aggregator: inject.service(),

  didReceiveAttrs() {
    const api = get(this, 'aggregator'),
          params = get(this, 'params');

    api.aggregate(params).then(val => {
      if ( !this.isDestroyed ) {
        const vals = val.getEach('attributes.value'),
              ids = val.getEach('id');

        vals.unshift('ICs');
        ids.unshift('x');
        const c3Data = {
          data: {
            x: 'x',
            columns: [vals, ids],
            type: 'bar'
          },
          axis: {
            rotated: true,
            x: {
              type: 'category'
            }
          },
          size: {
            height: 600
          }
        };
        console.log(c3Data);
        set(this, 'c3Data', c3Data);
      }
    });
  }
});


/*
// C3 demo data

var chart = c3.generate({
    data: {
        x: 'x',
        columns: [
            ['x', 'HL', 'C','BA','CCD','D'],
            ['ICs', 30, 200, 100, 400, 150]
        ],
        type: 'bar'
    },
    axis: {
        rotated: true,
        x: {
            type: 'category'
        }
    }
});

*/