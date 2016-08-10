import get from 'ember-metal/get';
import { helper } from 'ember-helper';

export default helper(function([collection, attrName, attrValue]) {
  if ( !collection ) { return; }
  return collection.find(el => get(el, attrName) === attrValue);
});
