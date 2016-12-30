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
			margin:  (settings && settings.margin) || 30,

			_elemBounds: {
				top: null,
				bottom: 0,
				right: 0,
				left: 0,
			},
		}
		
		this.updateBounds() // causes reflow, but only once

		/** Add this instance to the listeners */
		listeners.push(function _tick() {
			updatePosition(options)
		})
	}
	
	/**
	 * If the element has moved, call this function to update the boundaries.
	 */
	Plugin.prototype.updateBounds = function updateBounds() {
		var parent = this.options.bgElem.parentNode
		this.options._elemBounds.top = parent.offsetTop
		this.options._elemBounds.bottom = this.options._elemBounds.top + parent.offsetHeight
		this.options._elemBounds.left = parent.offsetLeft
		this.options._elemBounds.right = this.options._elemBounds.left + parent.offsetWidth

		if (this.options._elemBounds.top < this.options.margin)
			this.options.margin = 0
	}

	/**
	 * Updates the background position.
	 * 
	 * @param
	 */
	function updatePosition(options) {
		var bounds = options._elemBounds,
			translateValue = (lastScrollY - bounds.top + options.margin) / options.speedDivider

		// Scenarios where we don't want parallax:
		// elem not in viewport, because:
		// scrollpos below 0
		// it's below
		// it's above
		// it's left
		// it's right
		if ((lastScrollY + options.margin) < bounds.top || lastScrollY > bounds.bottom || lastScrollX < bounds.left || lastScrollX > bounds.right || translateValue < 0)
			return // maybe remove will-change here?

		translateY(options.bgElem, translateValue) // @todo: If it is a horizontal scroll we do nothing currently
	}
	
	/**
	 * Translates an element on the Y axis using translate3d to ensure GPU rendering.
	 */
	function translateY(elem, value) {
		var translate = 'translate3d(0,' + value + 'px,0)'
		elem.style.transform = translate
		elem.style['-webkit-transform'] = translate
		elem.style['-moz-transform'] = translate
		elem.style['-ms-transform'] = translate
		elem.style['-o-transform'] = translate
	}

	/** Holds last scroll position. (window.scrollY, scrollX) */
	var lastScrollY = 0, lastScrollX = 0
	/** rAF tick id */
	var tickId = 0

	/**
	 * The scroll event listener calculates the last scroll positions and requests an AF.
	 * Only runs every 60 fps.
	 */
	function doScroll() {
		if (tickId) return

		lastScrollY = window.pageYOffset // causes reflow
		lastScrollX = window.pageXOffset
		tickId = window.requestAnimationFrame(callListeners)
	}
	
	/** Holds the listeners. */
	var listeners = []
	
	/**
	 * Calls all listeners.
	 */
	function callListeners() {
		for (var i = 0; i < listeners.length; i++) {
			listeners[i]()
		}
		tickId = 0
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
	}());

	/**
	 * Usage: new Parallax(elem, speedDivider) || new Parallax({ bgElem: 'id', speedDivider: 2.1 })
	 */
	window.Asparagus = window.Parallax = Plugin
}(window));
