import Ember from 'ember';
const { Helper, get } = Ember;
export default Helper.helper(function([collection, attrName, attrValue]) {
  if ( !collection ) { return; }
  return collection.find(el => get(el, attrName) === attrValue);
});
