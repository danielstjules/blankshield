;(function(root) {
  'use strict';

  /**
   * Lowercase copy of the userAgent.
   *
   * @var {string}
   */
  var userAgent = navigator.userAgent.toLowerCase();

  /**
   * Whether or not the browser is Safari.
   *
   * @var {boolean}
   */
  var isSafari = (userAgent.indexOf('safari') !== -1 &&
                  userAgent.indexOf('chrome') === -1);

  /**
   * An event listener that can be attached to a click event to protect against
   * reverse tabnabbing. It retrieves the target anchors href, and if the link
   * was intended to open in a new tab or window, the browser's default
   * behaviour is canceled. Instead, the destination url is opened using
   * "window.open", followed by setting its window.opener property to null.
   *
   * @param {Event} e The click event for a given anchor
   */
  var clickListener = function(e) {
    var target, href, usedModifier, child, origin;

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

    // Safari prevents modification of the opener attribute of a tab if it lies
    // on a different origin, though the tab can still access
    // window.opener.location. In that scenario, we open the link in the same
    // tab. We also avoid caching the origin to accommodate push states.
    if (isSafari && getOrigin(window.location) !== getOrigin(href)) {
      window.location = href;
    } else {
      child = window.open(href);
      child.opener = null;
    }

    // IE8 and below don't support preventDefault
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  };

  /**
   * blankshield is the function exported by the library. It accepts an anchor
   * element or array of elements, adding an event listener to each to help
   * mitigate a potential reverse tabnabbing attack. For performance, any
   * supplied object with a length attribute is assumed to be an array. As a
   * result, the function is not compatible with HTMLAnchorElements that have
   * had a length property added. I'd imagine this is quite the edge case, and
   * an acceptable trade-off.
   *
   * @param {HTMLAnchorElement|HTMLAnchorElement[]} target
   */
  var blankshield = function(target) {
    if (typeof target.length === 'undefined') {
      addEventListener(target, 'click', clickListener);
    } else if (typeof target !== 'string' && !(target instanceof String)) {
      for (var i = 0; i < target.length; i++) {
        addEventListener(target[i], 'click', clickListener);
      }
    }
  };

  /**
   * A cross-browser addEventListener function that adds a listener for the
   * supplied event type to the specified target.
   *
   * @param {object}   target
   * @param {string}   type
   * @param {function} listener
   */
  function addEventListener(target, type, listener) {
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
   * Returns the origin of an url, with cross browser support. Accommodates
   * the lack of location.origin in IE, as well as the discrepancies in the
   * inclusion of the port when using the default port for a protocol, e.g.
   * 443 over https. Defaults to the origin of window.location if passed a
   * relative path.
   *
   * @param   {string} url The url to a cross storage hub
   * @returns {string} The origin of the url
   */
  function getOrigin(url) {
    var uri, origin;

    uri = document.createElement('a');
    uri.href = url;

    if (!uri.host) {
      uri = window.location;
    }

    origin = uri.protocol + '//' + uri.host;
    origin = origin.replace(/:80$|:443$/, '');

    return origin;
  };

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
  if (typeof define == 'function' && typeof define.amd == 'object') {
    define('blankshield', [], function() {
      return blankshield;
    });
  }

  // export default blankshield function
  root.blankshield = blankshield;
}(this));
