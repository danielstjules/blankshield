;(function(root) {
  'use strict';

  var handler = function(e) {
    var target, href, usedModifier, child;

    // Use global event object for IE8 and below to get target
    e = e || window.event;
    target = e.target || e.srcElement;

    // Ignore anchors without an href
    href = target.getAttribute('href');
    if (!href) return;

    // Ignore anchors without a blank target or modifier key
    usedModifier = (e.ctrlKey || e.shiftKey || e.metaKey);
    if (!usedModifier && target.getAttribute('target') !== '_blank') {
      return;
    }

    child = window.open(href);
    child.opener = null;

    // IE8 and below don't support preventDefault
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  };

  var blankshield = function(target) {
    if (typeof target.length === 'undefined') {
      addEvent(target, 'click', handler);
    } else if (typeof target !== 'string' && !(target instanceof String)) {
      for (var i = 0; i < target.length; i++) {
        addEvent(target[i], 'click', handler);
      }
    }
  };

  function addEvent(target, type, listener) {
    // Modern browsers
    if (target.addEventListener) {
      return target.addEventListener(type, listener, false);
    }

    // Older browsers
    var onType = 'on' + type;
    if (target.attachEvent) {
      target.attachEvent(onType, listener);
    } else if (target[onType]) {
      prevListener = target[onType];
      target[onType] = function() {
        listener();
        prevListener();
      };
    } else {
      target[onType] = listener;
    }
  }

  /**
   * Export for various environments.
   */

  // Export CommonJS
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      module.exports = blankshield;
    } else {
      exports.blankshield = blankshield;
    }
  }

  // Register with AMD
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define('blankshield', [], function() {
      return blankshield;
    });
  }

  // export default blankshield function
  root.blankshield = blankshield;
}(this));
