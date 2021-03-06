/**
 * dragdrop.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;( function() {

	'use strict';

	/*************************************************************/
	/******************* Some helper functions *******************/
	/*************************************************************/

	var body = document.body, docElem = window.document.documentElement,
		transEndEventNames = { 'WebkitTransition': 'webkitTransitionEnd', 'MozTransition': 'transitionend', 'OTransition': 'oTransitionEnd', 'msTransition': 'MSTransitionEnd', 'transition': 'transitionend' },
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	// https://remysharp.com/2010/07/21/throttling-function-calls
	function throttle(fn, threshhold, scope) {
		threshhold || (threshhold = 250);
		var last,
			deferTimer;
		
		return function () {
			var context = scope || this;
			var now = +new Date,
			args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}
	// from http://responsejs.com/labs/dimensions/
	function getViewportW() {
		var client = docElem['clientWidth'], inner = window['innerWidth'];
		return client < inner ? inner : client;
	}
	function getViewportH() {
		var client = docElem['clientHeight'], inner = window['innerHeight'];
		return client < inner ? inner : client;
	}
	function scrollX() { return window.pageXOffset || docElem.scrollLeft; }
	function scrollY() { return window.pageYOffset || docElem.scrollTop; }
	// gets the offset of an element relative to the document
	function getOffset( el ) {
		var offset = el.getBoundingClientRect();
		return { top : offset.top + scrollY(), left : offset.left + scrollX() }
	}
	function setTransformStyle( el, tval ) { el.style.transform = tval; }
	function onEndTransition( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( support.transitions ) {
				this.removeEventListener( transEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};

		if( support.transitions ) {
			el.addEventListener( transEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	}
	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	/*************************************************************/
	/************************ Drag & Drop ************************/
	/*************************************************************/

	var is3d = !!getStyleProperty( 'perspective' )

	/***************/
	/** Droppable **/
	/***************/

	function Droppable( droppableEl, options ) {
		this.el = droppableEl;
		this.options = extend( {}, this.options );
		extend( this.options, options );
	}

	Droppable.prototype.options = {
		onDrop : function(instance, draggableEl) { return false; }
	}

	// based on http://stackoverflow.com/a/2752387 : checks if the droppable element is ready to collect the draggable: the draggable element must intersect the droppable in half of its width or height.
	Droppable.prototype.isDroppable = function( draggableEl ) {
		var offset1 = getOffset( draggableEl ), width1 = draggableEl.offsetWidth, height1 = draggableEl.offsetHeight,
			offset2 = getOffset( this.el ), width2 = this.el.offsetWidth, height2 = this.el.offsetHeight;

		return !(offset2.left > offset1.left + width1 - width1/2 || 
				offset2.left + width2 < offset1.left + width1/2 || 
				offset2.top > offset1.top + height1 - height1/2 ||
				offset2.top + height2 < offset1.top + height1/2 );
	}

	// highlight the droppable if it's ready to collect the draggable
	Droppable.prototype.highlight = function( draggableEl ) {
		if( this.isDroppable( draggableEl ) )
			classie.add( this.el, 'highlight' );
		else
			classie.remove( this.el, 'highlight' );
	}

	// accepts a draggable element...
	Droppable.prototype.collect = function( draggableEl ) {
		// remove highlight class from droppable element
		classie.remove( this.el, 'highlight' );
		this.options.onDrop( this, draggableEl );
	}

	/***************/
	/** Draggable **/
	/***************/

	function Draggable( draggableEl, droppables, options ) {
		this.el = draggableEl;
		this.options = extend( {}, this.options );
		extend( this.options, options );
		this.droppables = droppables;
		this.draggie = new Draggabilly( this.el, this.options.draggabilly );
		this.initEvents();
	}

	Draggable.prototype.options = {
		// draggabilly options
		draggabilly : {},
		// if the item should animate back to its original position
		animBack : true,
		// callbacks
		onStart : function() { return false; },
		onDrag : function() { return false; },
		onEnd : function(wasDropped) { return false; }
	}

	Draggable.prototype.initEvents = function() {
		this.draggie.on( 'dragStart', this.onDragStart.bind(this) );
		this.draggie.on( 'dragMove', throttle( this.onDragMove.bind(this), 5 ) );
		this.draggie.on( 'dragEnd', this.onDragEnd.bind(this) );
	}

	Draggable.prototype.onDragStart = function( instance, event, pointer ) {
		//callback
		this.options.onStart();

		// save left & top
		this.position = { left : instance.position.x, top : instance.position.y };

		// add class is-active to the draggable element (control the draggable z-index)
		classie.add( instance.element, 'is-active' );

		// highlight droppable elements if draggables intersect
		this.highlightDroppables();
	}

	Draggable.prototype.onDragMove = function( instance, event, pointer ) {
		//callback
		this.options.onDrag();

		// highlight droppable elements if draggables intersect
		this.highlightDroppables();
	}

	Draggable.prototype.onDragEnd = function( instance, event, pointer ) {		
		// if the draggable && droppable elements intersect then "drop" and move back the draggable
		var dropped = false;
		for( var i = 0, len = this.droppables.length; i < len; ++i ) {
			var droppableEl = this.droppables[i];
			if( droppableEl.isDroppable( instance.element ) ) {
				dropped = true;
				droppableEl.collect( instance.element );
			}
		}

		//callback
		this.options.onEnd( this, dropped );

		var withAnimation = true;
		
		if( dropped ) {
			// add class is-dropped to draggable ( controls how the draggable appears again at its original position)
			classie.add( instance.element, 'is-dropped' );
			// after a timeout remove that class to trigger the transition
			setTimeout( function() {
				classie.add( instance.element, 'is-complete' );
				
				onEndTransition( instance.element, function() {
					classie.remove( instance.element, 'is-complete' );
					classie.remove( instance.element, 'is-dropped' );
				} );
			}, 25 );
		}

		// move back with animation - track if the element moved away from its initial position or if it was dropped in a droppable element
		if( this.position.left === instance.position.x && this.position.top === instance.position.y || dropped ) {
			// in this case we will not set a transition for the item to move back
			withAnimation = false;
		}

		// move back the draggable element (with or without a transition)
		// this.moveBack( withAnimation );
	}

	Draggable.prototype.highlightDroppables = function( el ) {
		for( var i = 0, len = this.droppables.length; i < len; ++i ) {
			this.droppables[i].highlight( this.el );
		}
	}

	// move back the draggable to its original position
	Draggable.prototype.moveBack = function( withAnimation ) {
		var anim = this.options.animBack && withAnimation;

		// add animate class (where the transition is defined)
		if( anim ) { 
			classie.add( this.el, 'animate' ); 
		}
		// reset translation value
		setTransformStyle( this.el, is3d ? 'translate3d(0,0,0)' : 'translate(0,0)' );
		// apply original left/top
		this.el.style.left = this.position.left + 'px';
		this.el.style.top = this.position.top + 'px';

		// remove class animate (transition) and is-active to the draggable element (z-index)
		var callbackFn = function() {
			if( anim ) { 
				classie.remove( this.el, 'animate' ); 
			}
			classie.remove( this.el, 'is-active' );
		}.bind( this );

		if( anim ) {
			onEndTransition( this.el, callbackFn );
		}
		else {
			callbackFn();
		}
	}

	window.Droppable = Droppable;
	window.Draggable = Draggable;
})();