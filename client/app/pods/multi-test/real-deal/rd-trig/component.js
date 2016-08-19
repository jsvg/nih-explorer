/* eslint max-len: 0 */
import Ember from 'ember';
import Component from 'ember-component';
import get, { getProperties } from 'ember-metal/get';
import set from 'ember-metal/set';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import { scheduleOnce } from 'ember-runloop';
import { assert } from 'ember-metal/utils';
import { isBlank } from 'ember-utils';
import { htmlSafe } from 'ember-string';

const { testing } = Ember;

const ua = self.window && self.window.navigator ? self.window.navigator.userAgent : '';
const isIE = ua.indexOf('MSIE ') > -1 || ua.indexOf('Trident/') > -1;
const isTouchDevice = testing || Boolean(self.window) && 'ontouchstart' in self.window;

export default Component.extend({
  tagName: '',
  textMeasurer: service(),
  _lastIsOpen: false,

  // Lifecycle hooks
  didInsertElement() {
    this._super(...arguments);
    let select = get(this, 'select');
    this.input = document.getElementById(`ember-power-select-trigger-multiple-input-${select.uniqueId}`);
    let inputStyle = this.input ? window.getComputedStyle(this.input) : null;
    this.inputFont = inputStyle ? `${ inputStyle.fontStyle } ${  inputStyle.fontVariant} ${ inputStyle.fontWeight } ${ inputStyle.fontSize}/${ inputStyle.lineHeight } ${ inputStyle.fontFamily }` : null;
    let optionsList = document.getElementById(`ember-power-select-multiple-options-${select.uniqueId}`);
    if (!optionsList) { return; }
    let chooseOption = (e) => {
      let selectedIndex = e.target.getAttribute('data-selected-index');
      if (selectedIndex) {
        e.stopPropagation();
        e.preventDefault();

        let select = get(this, 'select');
        let object = this.selectedObject(select.selected, selectedIndex);
        select.actions.choose(object);
      }
    };
    if (isTouchDevice) {
      optionsList.addEventListener('touchstart', chooseOption);
    }
    optionsList.addEventListener('mousedown', chooseOption);
  },

  didReceiveAttrs() {
    let oldSelect = get(this, 'oldSelect') || {},
      select = set(this, 'oldSelect', get(this, 'select')),
      oldRes = oldSelect.results || [],
      newRes = select.results || [];

    if (oldSelect.isOpen && !select.isOpen) {
      scheduleOnce('actions', null, select.actions.search, '');
    }

    let resultsAreSame = oldRes.length === newRes.length && oldRes.every((element, index) => {
      return element === newRes[index];
    });

    if (!isBlank(newRes) && !isBlank(oldRes) && !resultsAreSame) {
      set(this, 'showActionButtons', true);
    }
  },

  // CPs
  triggerMultipleInputStyle: computed('select.searchText.length', 'select.selected.length', function() {
    let select = get(this, 'select');
    select.actions.reposition();
    if (!select.selected || select.selected.length === 0) {
      return htmlSafe('width: 100%;');
    }
    let textWidth = 0;
    if (this.inputFont) {
      textWidth = get(this, 'textMeasurer').width(select.searchText, this.inputFont);
    }
    return htmlSafe(`width: ${textWidth + 25}px`);
  }),

  maybePlaceholder: computed('placeholder', 'select.selected.length', function() {
    if (isIE) { return null; }
    let select = get(this, 'select');
    return !select.selected || get(select.selected, 'length') === 0 ? get(this, 'placeholder') || '' : '';
  }),

  // Actions
  actions: {
    onInput(e) {
      let action = get(this, 'onInput');
      if (action &&  action(e) === false) { return; }
      get(this, 'select').actions.open(e);
    },

    onKeydown(e) {
      let { onKeydown, select } = getProperties(this, 'onKeydown', 'select');
      if (onKeydown && onKeydown(e) === false) {
        e.stopPropagation();
        return false;
      }
      if (e.keyCode === 8) {
        e.stopPropagation();
        if (isBlank(e.target.value)) {
          let lastSelection = select.selected[select.selected.length - 1];
          if (lastSelection) {
            select.actions.select(get(this, 'buildSelection')(lastSelection, select), e);
            if (typeof lastSelection === 'string') {
              select.actions.search(lastSelection);
            } else {
              let searchField = get(this, 'searchField');
              assert('`{{power-select-multiple}}` requires a `searchField` when the options are not strings to remove options using backspace', searchField);
              select.actions.search(get(lastSelection, searchField));
            }
            select.actions.open(e);
          }
        }
      } else if (e.keyCode >= 48 && e.keyCode <= 90 || e.keyCode === 32) { // Keys 0-9, a-z or SPACE
        e.stopPropagation();
      }
    },

    acceptOptions() {
      //get(this, 'select').actions.select(get(this, 'select').results);
      get(this, '')
      set(this, 'showActionButtons', false);
      get(this, 'select').actions.close();
    },

    clearOptions() {
      get(this, 'select').actions.select([]);
      set(this, 'showActionButtons', false);
      get(this, 'select').actions.close();
    }
  },

  // Methods
  selectedObject(list, index) {
    if (list.objectAt) {
      return list.objectAt(index);
    }
    return get(list, index);
  }
});
