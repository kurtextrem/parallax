/**
 * @license Asparagus v2
 * (c) 2016 Form5 http://form5.is + Jacob "kurtextrem" Groß
 * License: MIT
 */
(function(window) {
  'use strict'

  var lastScrollY = 0,
      elemY = 0,
      tickId = 0,
      bgElm = document.getElementById('hero-bg'),
      speedDivider = 2.25;

  // Update background position
  var updatePosition = function() {
    lastScrollY = window.pageYOffset; // causes reflow
    if (!elemY) elemY = bgElm.clientTop + bgElm.clientHeight; // causes reflow only once

    var translateValue = lastScrollY / speedDivider;

    // We don't want parallax to happen if scrollpos is below 0
    if (translateValue < 0)
      translateValue = 0;

    if (lastScrollY <= elemY)
      translateY(bgElm, translateValue);

    // Stop ticking
    tickId = 0;
  };

  // Translates an element on the Y axis using translate3d to ensure
  // that the rendering is done by the GPU
  var translateY = function(elm, value) {
    var translate = 'translate3d(0px,' + value + 'px, 0px)';
    elm.style['-webkit-transform'] = translate;
    elm.style['-moz-transform'] = translate;
    elm.style['-ms-transform'] = translate;
    elm.style['-o-transform'] = translate;
    elm.style.transform = translate;
  };

  // This will limit the calculation of the background position to
  // 60fps as well as blocking it from running multiple times at once
  var requestTick = function() {
    if (tickId)
      window.cancelAnimationFrame(tickId);
    else
      tickId = window.requestAnimationFrame(updatePosition);
  };

  // Update scroll value and request tick
  var doScroll = function() {
    requestTick();
  };

  // Initialize on domready
  (function() {
    var loaded = 0;
    var bootstrap = function() {
      if (loaded) return;
      loaded = 1;

      if (!window.requestAnimationFrame && !window.cancelAnimationFrame) rafPolyfill();
      window.addEventListener('scroll', doScroll, false);
    };

    if (document.readyState === 'complete') {
      setTimeout(bootstrap);
    } else {
      document.addEventListener('DOMContentLoaded', bootstrap, false);
      window.addEventListener('load', bootstrap, false);
    }
  })();

  // RequestAnimationFrame polyfill for older browsers
  var rafPolyfill = function() {
    var lastTime, vendors, x;
    lastTime = 0;
    vendors = ["webkit", "moz"];
    x = 0;
    while (x < vendors.length && !window.requestAnimationFrame) {
      window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
      window.cancelAnimationFrame = window[vendors[x] + "CancelAnimationFrame"] || window[vendors[x] + "CancelRequestAnimationFrame"];
      ++x;
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime, id, timeToCall;
        currTime = new Date().getTime();
        timeToCall = Math.max(0, 16 - (currTime - lastTime));
        id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  };

}(window));