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
				speed = speedDivider ? +speedDivider : 1.5

		if (~el.indexOf('.')) return console.error('Asparagus needs an ID or single element as bgElem.')

 		var options = {
			bgElem: (settings && settings.bgElem) || document.getElementById(el.replace('#', '')), // if first arg is a string, we take it as elem
			speedDivider: (settings && settings.speedDivider) || speed,

			_elemBounds: {
				top: null,
				bottom: 0,
				right: 0,
				left: 0
			},
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
		if (options._elemBounds.top === null) { // the following causes reflow, but only once
			var parent = options.bgElem.parentNode
			options._elemBounds.top = parent.offsetTop
			options._elemBounds.bottom = options._elemBounds.top + parent.offsetHeight
			options._elemBounds.left = parent.offsetLeft
			options._elemBounds.right = options._elemBounds.left + parent.offsetWidth
		}

		tickId = window.requestAnimationFrame(cb)
	}

	/**
	 * Updates the background position.
	 */
	function updatePosition(options) {
		var bounds = options._elemBounds,
			translateValue = (lastScrollY - bounds.top) / options.speedDivider

		// Scenarios where we don't want parallax:
		// elem not in viewport, because:
		// scrollpos below 0
		// it's below
		// it's above
		// it's left
		// it's righ
		if (lastScrollY < bounds.top || lastScrollY > bounds.bottom || lastScrollX < bounds.left || lastScrollX > bounds.right || translateValue < 0)
			return tickId = 0

		translateY(options.bgElem, translateValue)

		// Stop ticking
		tickId = 0
	}

	// Translates an element on the Y axis using translate3d to ensure
	// that the rendering is done by the GPU
	function translateY(elem, value) {
		var translate = 'translate3d(0,' + value + 'px,0)'
		elem.style.transform = translate
		elem.style['-webkit-transform'] = translate
		elem.style['-moz-transform'] = translate
		elem.style['-ms-transform'] = translate
		elem.style['-o-transform'] = translate
	}

	/** Holds the listeners. */
	var listeners = []
	/** Last window.scrollY/X */
	var lastScrollY = 0, lastScrollX = 0
	/** rAF tick id */
	var tickId = 0

	/**
	 * Calls all registered listeners.
	 */
	function doScroll() {
		if (tickId) return

		lastScrollY = window.pageYOffset // causes reflow
		lastScrollX = window.pageXOffset
		for (var i = 0; i < listeners.length; i++) {
			listeners[i]()
		}
	}

	// Initialize on domready
	(function () {
		var loaded = 0
		function bootstrap () {
			if (loaded) return
			loaded = 1

			window.addEventListener('scroll', doScroll, false)
		}

		if (!window.requestAnimationFrame) return console.error('Please include a polyfill for requestAnimationFrame.')

		if (window.document.readyState === 'complete') {
			(window.requestIdleCallback && window.requestIdleCallback(bootstrap)) || window.requestAnimationFrame(bootstrap) || setTimeout(bootstrap, 0)
		} else {
			window.addEventListener('load', bootstrap, false)
		}
	}())

	/**
	 * Usage: new Parallax(elem, speedDivider) || new Parallax({ bgElem: 'id', speedDivider: 2.1 })
	 */
	window.Asparagus = window.Parallax = Plugin
}(window));
