// @license
// Copyright (C) 2016, Tim van der Lippe
// All rights reserved.

// This software may be modified and distributed under the terms
// of the BSD license.  See the LICENSE file for details.

import { dom } from '../polymer/lib/legacy/polymer.dom.js';
import { IronSelectableBehavior } from '../iron-selector/iron-selectable.js';

const IronLazyPagesBehaviorImpl = {

  properties: {
    // as the selected page is the only one visible, activateEvent
    // is both non-sensical and problematic; e.g. in cases where a user
    // handler attempts to change the page and the activateEvent
    // handler immediately changes it back
    // Disabled for this element.
    activateEvent: {
      type: String,
      value: null
    },

    /**
     * Indicates if the page is currently lazy-loading.
     */
    loading: {
      type: Boolean,
      value: false,
      notify: true,
      readOnly: true
    },

    /**
     * If set to true, the previous item will be removed immediately upon
     * switching. By default the item is hidden when the importHref resolves.
     */
    hideImmediately: {
      type: Boolean,
      value: false
    },

    /**
     * The set of excluded elements where the key is the `localName`
     * of the element that will be ignored from the item list.
     *
     * @default {template: 1}
     */
    _excludedLocalNames: {
      type: Object,
      value: function() {
        return {
          // 'template': 1,
          'dom-bind': 1,
          // Explicitly opt-in for `dom-if`
          // 'dom-if': 1,
          'dom-repeat': 1,
        };
      }
    }
  },

  listeners: {
    'iron-deselect': '_itemDeselected',
    'iron-select': '_itemSelected',
  },

  attached: function() {

    this.addEventListener('dom-change', (event) => {
      // Do not listen to possible sub-selectors if these fired and iron-deselect
      if (event.target.parentNode !== this) {
        return;
      }
      const target = event.target;
      if (target['if']) {
        let sibling = target;
        while ((sibling = sibling.previousElementSibling) != this.__previousSibling) {
          sibling.classList.add('iron-lazy-selected');
        }
      }
    });
  },

  _itemDeselected: function(event) {
    // Do not listen to possible sub-selectors if these fired and iron-deselect
    if (dom(event).rootTarget !== this) {
      return;
    }
    if (this.hideImmediately) {
      event.detail.item['if'] = false;
      event.detail.item.classList.remove('iron-lazy-selected');
    } else {
      this._lastSelected = event.detail.item;
    }
  },

  _itemSelected: function(event) {
    // Do not listen to possible sub-selectors if these fired and iron-select
    if (dom(event).rootTarget !== this) {
      return;
    }

    const page = event.detail.item;

    if (this.selectedItem === page) {
      this._show(page);
    }
  },

  _show: function(page) {
    if (this._lastSelected) {
      this._lastSelected['if'] = false;
      this._lastSelected.classList.remove('iron-lazy-selected');
    }

    page.classList.add('iron-lazy-selected');
    page['if'] = true;
    this.__previousSibling = page.previousElementSibling;
  }
};

/** @polymerBehavior */
export const IronLazyPagesBehavior = [
  IronSelectableBehavior,
  IronLazyPagesBehaviorImpl
];
