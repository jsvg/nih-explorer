import Component from 'ember-component';
import get from 'ember-metal/get';
import computed from 'ember-computed';
import getProperties from 'ember-metal/get';
import set from 'ember-metal/set';
import service from 'ember-service/inject';

export default Ember.Component.extend({
	ajax: service(),
	notesPlaceholder: 'Type your notes here',

	clxnFiltersUsed: computed('collectionData', function() {
		let clxn = get(this, 'collectionData');
		let filters = this.extractQueryParams(clxn);
		return filters;
	}),

	asdfKeys: computed('clxnFiltersUsed', function() {
		return Object.keys(get(this,'clxnFiltersUsed'));
	}),

	renameFilterNames(filters){

	},

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

	actions:{
		saveNote(note){
			console.log(note);
			//capture input in variable DONE
			//send note to backend to be stored in collection
		}
	}
});
