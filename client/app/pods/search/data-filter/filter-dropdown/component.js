// data-filter.filter-dropdown
import $ from 'jquery';
import Component from 'ember-component';
import computed from 'ember-computed';
import { scheduleOnce } from 'ember-runloop';
import get from 'ember-metal/get';
import set from 'ember-metal/set';
import A from 'ember-array/utils';

export default Component.extend({
  tagName: 'ul',
  attributeBindings: ['role', 'aria-controls'],
  role: 'listbox',
  isTouchDevice: computed(function() {
    return Boolean(this.window) && 'ontouchstart' in this.window;
  }),

  // Lifecycle hooks
  didInsertElement() {
    this._super(...arguments);

    let select = get(this, 'select');

    let findOptionAndPerform = (action, e) => {
      let optionItem = $(e.target).closest('[data-option-index]');

      if (!optionItem) { return; }
      if (!optionItem.data()) { return; }
      if (optionItem.data().optionIndex === 'loadMore') { return; }
      if (!optionItem || !(0 in optionItem)) { return; }
      if (optionItem.closest('[aria-disabled=true]').length) { return; }

      let optionIndex = optionItem[0].getAttribute('data-option-index');
      action(this._optionFromIndex(optionIndex), e);
    };

    // click option
    this.element.addEventListener('mouseup', (e) => {
      return findOptionAndPerform(select.actions.choose, e);
    });

    // hover option
    this.element.addEventListener('mouseover', (e) => {
      return findOptionAndPerform(select.actions.highlight, e);
    });

    // scroll
    this.element.addEventListener('scroll', (e) => {
      return e;
    });

    if (get(this, 'isTouchDevice')) {
      this._addTouchEvents();
    }

    scheduleOnce('afterRender', null, select.actions.scrollTo, select.highlighted);
  },

  allOptionsLoaded: false,
  optionLimit: 10,
  optionsSet: computed('optionLimit', 'options', function() {
    let optionsLimit = get(this, 'optionLimit'),
      options = get(this, 'options');
    if (options.length < optionsLimit + 10) {
      set(this, 'allOptionsLoaded', true);
    }
    return options.slice(0, optionsLimit);
  }),

  _addTouchEvents() {
    let touchMoveHandler = () => {
      this.hasMoved = true;
      this.element.removeEventListener('touchmove', touchMoveHandler);
    };
    // Add touch event handlers to detect taps
    this.element.addEventListener('touchstart', () => {
      this.element.addEventListener('touchmove', touchMoveHandler);
    });
    this.element.addEventListener('touchend', (e) => {
      let optionItem = $(e.target).closest('[data-option-index]');

      if (!optionItem || !(0 in optionItem)) { return; }

      e.preventDefault();
      if (this.hasMoved) {
        this.hasMoved = false;
        return;
      }

      let optionIndex = optionItem[0].getAttribute('data-option-index');
      get(this, 'select.actions.choose')(this._optionFromIndex(optionIndex), e);
    });
  },

  _optionFromIndex(index) {
    let parts = index.split('.');
    let options = get(this, 'optionsSet');

    if (!options.objectAt) {
      options = A(options);
    }
    let option = options.objectAt(parseInt(parts[0], 10));
    for (let i = 1; i < parts.length; i++) {
      let groupOptions = option.options;
      if (!groupOptions.objectAt) {
        groupOptions = A(groupOptions);
      }
      option = groupOptions.objectAt(parseInt(parts[i], 10));
    }
    return option;
  },

  actions: {
    loadMore() {
      let optionsLimit = get(this, 'optionLimit'),
        options = get(this, 'options');
      if (options.length < optionsLimit + 10) {
        set(this, 'allOptionsLoaded', true);
      }
      set(this, 'optionLimit', get(this, 'optionLimit') + 10);
    }
  }
});
