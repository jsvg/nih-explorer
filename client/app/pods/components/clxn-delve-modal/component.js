import Component from 'ember-component';
import get from 'ember-metal/get';
import computed from 'ember-computed';

export default Ember.Component.extend({
	asdf: computed('collectionData', function() {
		let clxn = get(this, 'collectionData');
		let filters = this.extractQueryParams(clxn);
		console.log(filters);
		return filters;
	}),
	asadfKeto: computed('asdf', function() {
		return Object.keys(get(this,'asdf'));
	}),
	notesPlaceholder: 'Type your notes here',

	extractQueryParams(collection) {
		const queryParams = {};
			for(var key in collection) {
			// gets all filterParams[*] from collection object
				if( /filterParams/.test(key) ) {
					let filterName = key.match(/\[(.*)\]/)[1];
					queryParams[filterName] = collection[key];
				}
			}
		return queryParams;
	},
});
