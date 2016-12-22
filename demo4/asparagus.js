/**
 * @license Asparagus v2
 * (c) 2016 Form5 http://form5.is + Jacob "kurtextrem" Groß
 * License: MIT
 *
 * Please include a polyfill for requestAnimationFrame if you support older browsers.
 */
(function (window) {
	'use strict'

	function Plugin(settings, speedDivider) {
		var el = typeof settings === 'string' ? settings : 'hero-bg',
				speed = speedDivider ? +speedDivider : 2.1

 		if (~el.indexOf('.') || ~el.indexOf('#')) return console.error('Asparagus needs an ID or single element as bgElem.')

 		var options = {
			bgElem: (settings && settings.bgElem) || document.getElementById(el), // if first arg is a string, we take it as elem
			speedDivider: (settings && settings.speedDivider) || speed,

			_elemY: 0
		}

		/** Prevents creation of a new bound function every tick. */
		function _updatePosition() {
			updatePosition(options)
		}

		/** Add this instance to the listeners */
		listeners.push(function _tick() {
			tick(options, _updatePosition)
		})
	}

	/**
	 * Limit the calculation of the background position to 60fps as well as blocking it from running multiple times at once.
	 *
	 * @param
	 * @param
	 */
	function tick(options, cb) {
		if (!options._elemY) options._elemY = options.bgElem.clientTop + options.bgElem.clientHeight // causes reflow only once

		tickId = window.requestAnimationFrame(cb)
	}

	/**
	 * Updates the background position.
	 */
	function updatePosition(options) {
		var translateValue = lastScrollY / options.speedDivider;

		// We don't want parallax to happen if scrollpos is below 0
		if (translateValue < 0)
			translateValue = 0;

		if (lastScrollY <= options._elemY)
			translateY(options.bgElem, translateValue)

		// Stop ticking
		tickId = 0
	}

	// Translates an element on the Y axis using translate3d to ensure
	// that the rendering is done by the GPU
	function translateY(elem, value) {
		var translate = 'translate3d(0,' + value + 'px, 0)';
		elem.style.transform = translate;
		elem.style['-webkit-transform'] = translate;
		elem.style['-moz-transform'] = translate;
		elem.style['-ms-transform'] = translate;
		elem.style['-o-transform'] = translate;
	};

	/** Holds the listeners. */
	var listeners = []
	/** Last window.scrollY */
	var lastScrollY = 0
	/** rAF tick id */
	var tickId = 0

	/**
	 * Calls all registered listeners.
	 */
	function doScroll() {
		if (tickId) return

		lastScrollY = window.pageYOffset // causes reflow
		for (var i = 0; i < listeners.length; i++) {
			listeners[i]()
		}
	}

	/**
	 * Usage: new Parallax(elem, speedDivider) || new Parallax({ bgElem: 'id', speedDivider: 2.1 })
	 */
	window.Asparagus = window.Parallax = Plugin

	// Initialize on domready
	(function () {
		var loaded = 0
		function bootstrap () {
			if (loaded) return
			loaded = 1

			window.addEventListener('scroll', doScroll, false);
		};

		if (!window.requestAnimationFrame) return console.error('Please include a polyfill for requestAnimationFrame.')

		if (window.document.readyState === 'complete') {
			window.requestIdleCallback(bootstrap) || setTimeout(bootstrap, 0)
		} else {
			window.addEventListener('load', bootstrap, false)
		}
	}());
}(window));
