(function($) {
	"use strict";

	window.requestAnimFrame = (function() {
	return  window.requestAnimationFrame	   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame	||
			window.oRequestAnimationFrame	  ||
			window.msRequestAnimationFrame	 ||
			function(/* function */ callback, /* DOMElement */ element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

window.requestTimeout = function(fn, delay) {
	if( !window.requestAnimationFrame	  	&&
		!window.webkitRequestAnimationFrame &&
		!(window.mozRequestAnimationFrame && window.mozCancelRequestAnimationFrame) && // Firefox 5 ships without cancel support
		!window.oRequestAnimationFrame	  &&
		!window.msRequestAnimationFrame)
			return window.setTimeout(fn, delay);

	var start = new Date().getTime(),
		handle = new Object();

	function loop(){
		var current = new Date().getTime(),
			delta = current - start;

		delta >= delay ? fn.call() : handle.value = requestAnimFrame(loop);
	};

	handle.value = requestAnimFrame(loop);
	return handle;
};

window.clearRequestTimeout = function(handle) {
	if ( typeof handle !== 'undefined' ) {
		window.cancelAnimationFrame ? window.cancelAnimationFrame(handle.value) :
		window.webkitCancelAnimationFrame ? window.webkitCancelAnimationFrame(handle.value) :
		window.webkitCancelRequestAnimationFrame ? window.webkitCancelRequestAnimationFrame(handle.value) : /* Support for legacy API */
		window.mozCancelRequestAnimationFrame ? window.mozCancelRequestAnimationFrame(handle.value) :
		window.oCancelRequestAnimationFrame	? window.oCancelRequestAnimationFrame(handle.value) :
		window.msCancelRequestAnimationFrame ? window.msCancelRequestAnimationFrame(handle.value) :
		clearTimeout(handle);
	}
};

function uncodeVisibilityChange() {
	if (document.hidden) {
		window.dispatchEvent(new CustomEvent('is-blur'));
	} else {
		window.dispatchEvent(new CustomEvent('is-focus'));
	}
  }
document.addEventListener('visibilitychange', uncodeVisibilityChange, false);

if ( SiteParameters.smoothScroll === 'on' && ! SiteParameters.is_frontend_editor ) {
	window.lenis = new Lenis({
		duration: 1
	})

	UNCODE.hDoc = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
		document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );

	function raf(time) {
		window.lenis.raf(time)
		requestAnimationFrame(raf)
		window.dispatchEvent(new CustomEvent('lenis-scroll'));

		if ( SiteParameters.uncode_smooth_scroll_safe ) {
			var newHdoc = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
				document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
			
			if ( UNCODE.hDoc !== newHdoc ) {
				UNCODE.hDoc = newHdoc;
				window.lenis.resize();
				//window.dispatchEvent(new CustomEvent('boxResized'));
			}
		}
	}

	requestAnimationFrame(raf)

	$(window).on('unmodal-open', function(){
		window.lenis.stop();
	});

	$(document).on('unmodal-close', function(){
		window.lenis.start();
	});

}

var checkScrollTriggerRefresh;
$(function(){
	$(document).on('uncode-scrolltrigger-refresh', function(){
		clearRequestTimeout(checkScrollTriggerRefresh);
		checkScrollTriggerRefresh = requestTimeout(function(){
			ScrollTrigger.refresh();
		}, 500);
	});
});

UNCODE.checkImgLoad = function( src, cb, err, el ) {
	var img = new Image();
	img.onload = function () {
		var result = (img.width > 0) && (img.height > 0);
		cb(el);
	};
	img.onerror = function () {
		err();
	};
	img.src = src
};

UNCODE.betterResize = function() {
	var setResize,
		doubleResize = true,
		oldW = UNCODE.wwidth,
		oldH = UNCODE.wheight,
		setCTA;
	$(window).on( 'resize orientationchange', function(){
		if ( oldW === UNCODE.wwidth ) {
			return;
		} else {
			oldW = UNCODE.wwidth;
			$(window).trigger('wwResize');
		}

		if ( oldH === UNCODE.wheight ) {
			return;
		} else {
			oldH = UNCODE.wheight;
			$(window).trigger('whResize');
		}
	});

	$(window).on( 'resize orientationchange', function(){
		clearRequestTimeout(setCTA);
		setCTA = requestTimeout( function(){ $(window).trigger('resize-int'); }, 100 );
	});
};

UNCODE.shuffle = function(array) {
	var currentIndex = array.length,
		randomIndex;
  
	while (currentIndex > 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}
  
	return array;
};

Number.isInteger = Number.isInteger || function(value) {
    return typeof value === "number" &&
           isFinite(value) &&
           Math.floor(value) === value;
};

UNCODE.utils = function() {
	$(document).on('mouseover', 'a', function () {
		if (!$(this).hasClass('star')) {
			$(this).attr('data-title', $(this).attr('title'));
			$(this).removeAttr('title');
		}
	});
	$(document).on('mouseout', 'a', function () {
		if (!$(this).hasClass('star')) {
			$(this).attr('title', $(this).attr('data-title'));
			$(this).removeAttr('data-title');
		}
	});

	this.get_scroll_offset = function(e) {

		var scroll_offset = 0,
			target,
			trigger;

		if ( Number.isInteger(e) !== true && typeof e !== 'undefined' && typeof e.target !== 'undefined' && typeof e.currentTarget !== 'undefined' ) {
			target = e.target;
			trigger = e.currentTarget;
		}

		if ($('.menu-hide').length || $('.menu-hide-vertical').length) {
			if (UNCODE.bodyTop > UNCODE.wheight / 2) {
				UNCODE.hideMenu(100);
			}
		}

		if ( ! $('body').hasClass('vmenu') || UNCODE.wwidth < UNCODE.mediaQuery ) {
			// if  ( !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) && !( $('.menu-mobile-transparent').length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) ) {
			if  ( !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) ) {
				if ( ( $('.menu-sticky').length && !$('.menu-hide').length && !UNCODE.isMobile ) || ( $('.menu-sticky-mobile').length && UNCODE.isMobile ) ) {
					if ( !$('.menu-hided').length ) {
						if ( $('body').hasClass('hmenu-center') ) {
							scroll_offset += ~~$('.menu-sticky .menu-container').outerHeight();
						} else {
							scroll_offset += ~~$('.logo-container:visible').outerHeight();
						}
					}
				} else if ( $('.menu-sticky .menu-container:not(.menu-hide)').length && ! $('.menu-shrink').length ) {
					var shrink = typeof $('.navbar-brand').data('padding-shrink') !== 'undefined' ?  $('.navbar-brand').data('padding-shrink')*2 : 36;
					scroll_offset += (~~$('.menu-sticky .menu-container').outerHeight()) - ( $('.navbar-brand').data('minheight') + shrink );
				} else {
					if ( ($('.menu-sticky').length && !$('.menu-hide').length) || ($('.menu-sticky-vertical').length && !$('.menu-hide-vertical').length) ) {
						scroll_offset += UNCODE.menuMobileHeight;
					} else {
						if ( typeof target !== 'undefined' && target.closest('.main-menu-container') != null && UNCODE.wwidth < UNCODE.mediaQuery && ! $('body').hasClass('vmenu') && ! $('body').hasClass('menu-mobile-transparent') && ! $('.menu-sticky').length ) {
							//scroll_offset += $('.main-menu-container > div:first-child()').height() - 2;
						} else {
							if ( $(trigger)[0] !== $(document)[0] && $(trigger).length && typeof $(trigger).offset() !== 'undefined' && window.scrollY > ($(trigger).offset().top + UNCODE.menuMobileHeight) ) {
								scroll_offset += UNCODE.menuMobileHeight;
							}
						}
					}
				}
			}

		}

		scroll_offset += UNCODE.bodyBorder;

		return scroll_offset;
	}

	if ( !UNCODE.isFullPage ) {
		$(document).on('click', 'a[href*="#"]:not(.woocommerce-review-link):not(.one-dot-link)', function(e) {

			var hash = (e.currentTarget).hash,
			is_scrolltop = $(e.currentTarget).hasClass('scroll-top') ? true : false,
			anchor = '';
			if ($(e.currentTarget).data('toggle') == 'tab' || $(e.currentTarget).data('toggle') == 'collapse') return;
			if ($(e.currentTarget).hasClass('woocommerce-review-link') && $('.wootabs .tab-content').length) {
				e.preventDefault();
				if (!$('#tab-reviews').is(':visible')) {
					$('a[href="#tab-reviews"]').trigger('click');
				}
				var calc_scroll = $('.wootabs .tab-content').offset().top;
				calc_scroll -= UNCODE.get_scroll_offset(e);

				if  ( !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) && !( $('.menu-mobile-transparent').length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) ) {
					var shrink = typeof $('.navbar-brand').data('padding-shrink') !== 'undefined' ?  $('.navbar-brand').data('padding-shrink')*2 : 36;

					if ( $('.menu-sticky .menu-container:not(.menu-hide)').length && $('.menu-shrink').length ) {
						scrollTo += UNCODE.menuHeight - ( $('.navbar-brand').data('minheight') + shrink );
					}
				}

				var bodyTop = document.documentElement['scrollTop'] || document.body['scrollTop'],
					delta = bodyTop - calc_scroll,
					scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(delta) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed;
				if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

				requestTimeout(function(){
					if (scrollSpeed == 0) {
						$('html, body').scrollTop(calc_scroll);
						UNCODE.scrolling = false;
					} else {
   						$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
							$(this).stop();
						}).animate({
								scrollTop: calc_scroll
							}, scrollSpeed, 'easeInOutCubic', function() {
								$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
								UNCODE.scrolling = false;
							}
						);
					}
				}, 200);
				return;
			}
			if (hash != undefined) {
				var specialFormat = /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
				var anchor = this.hash.slice(1);
				if ( !specialFormat.test(hash) && location.pathname.replace(/^\//g,'') == this.pathname.replace(/^\//g,'') && location.hostname == this.hostname) {
			  		if ( !specialFormat.test(hash) ) {
			  			if ( $(hash).length )
			  				anchor = $(hash);
			  		}
				}
			}

			if (is_scrolltop || anchor != '') {
				if (is_scrolltop) {
					e.preventDefault();
					var bodyTop = document.documentElement['scrollTop'] || document.body['scrollTop'],
					scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(bodyTop) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed;
					if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

					if (scrollSpeed == 0) {
						$('html, body').scrollTop(0);
						UNCODE.scrolling = false;
					} else {
   						$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
							$(this).stop();
						}).animate({
							scrollTop: 0
						}, scrollSpeed, 'easeInOutCubic', function() {
							$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
							UNCODE.scrolling = false;
						});
					}
				} else {
					var scrollSection = (typeof anchor === 'string') ? $('[data-name="' + anchor + '"]') : anchor;
					$.each($('.menu-container .menu-item > a, .widget_nav_menu .menu-smart .menu-item > a'), function(index, val) {
						var get_href = $(val).attr('href');
						if (get_href != undefined) {
							if (get_href.substring(get_href.indexOf('#')+1) == anchor) $(val).parent().addClass('active');
							else $(val).parent().removeClass('active');
						}
					});
					if (scrollSection.length) {
						if ( $('body').hasClass('uncode-scroll-no-history') ) {
							e.preventDefault();
						}

						if (UNCODE.menuOpened) {
							if (UNCODE.wwidth < UNCODE.mediaQuery) {
								window.dispatchEvent(UNCODE.menuMobileTriggerEvent);
							} else {
								$('.mmb-container-overlay .overlay-close').trigger('click');
								$('.mmb-container .trigger-overlay.close')[0].dispatchEvent(new Event("click"));;
							}
						}

						var calc_scroll = scrollSection.offset().top,
							getOffset = UNCODE.get_scroll_offset(e),
							$logo = $('.logo-container:visible'),
							logoH,
							$menu = $('#masthead .menu-container'),
							menuH;

						calc_scroll -= isNaN(getOffset) ? 0 : getOffset;

						var bodyTop = document.documentElement['scrollTop'] || document.body['scrollTop'],
							delta = bodyTop - calc_scroll,
							scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(delta) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed;
						if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

						if  ( !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) && !( $('.menu-mobile-transparent').length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) ) {
							if ( $('.menu-sticky .menu-container:not(.menu-hide)').length && ! $('.menu-shrink').length && ! $('body').hasClass('vmenu') && UNCODE.wwidth > UNCODE.mediaQuery ) {
								logoH = $logo.outerHeight(),
								menuH = $menu.outerHeight();
								if ( calc_scroll < ( logoH + menuH ) ) {
									calc_scroll = 0;
								}
							}
						}

						if ( UNCODE.menuStickyMobileOverlay === false && UNCODE.isMobile ) {
							calc_scroll = calc_scroll - parseFloat( $('.overlay.overlay-menu').outerHeight() );
						}

						if (scrollSpeed == 0) {
							$('html, body').scrollTop(calc_scroll);
							UNCODE.scrolling = false;
						} else {
	   						$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
								$(this).stop();
							}).animate({
								scrollTop: (delta > 0) ? calc_scroll - 0.1 : calc_scroll
							}, scrollSpeed, 'easeInOutCubic', function() {
								$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
								UNCODE.scrolling = false;
								if  ( ( getOffset != UNCODE.get_scroll_offset(e) && !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) && !( $('.menu-mobile-transparent').length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) )
								||
								$('.menu-hided').length ) {
									calc_scroll = scrollSection.offset().top;
									getOffset = UNCODE.get_scroll_offset(e);
									calc_scroll -= getOffset;
									$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
										$(this).stop();
									}).animate({
										scrollTop: (delta > 0) ? calc_scroll - 0.1 : calc_scroll
										}, scrollSpeed, 'easeInOutCubic', function() {
											$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
											UNCODE.scrolling = false;
										}
									);
								}
							});
						}
					}
				}
			}
		});
		$('.header-scrolldown').on('click', function(event) {

			event.preventDefault();

			var pageHeader = $(event.target).closest('#page-header'),
				pageHeaderTop = pageHeader.offset().top,
				pageHeaderHeight = pageHeader.outerHeight(),
				scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(pageHeaderTop + pageHeaderHeight) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed;
			if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

			var calc_scroll = pageHeaderTop + pageHeaderHeight,
			getOffset = UNCODE.get_scroll_offset(event);
			calc_scroll -= getOffset;

			if  ( !( $('.menu-desktop-transparent').length && UNCODE.wwidth > UNCODE.mediaQuery ) && !( $('.menu-mobile-transparent').length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) ) {
				var shrink = typeof $('.navbar-brand').data('padding-shrink') !== 'undefined' ?  $('.navbar-brand').data('padding-shrink')*2 : 36;

				if ( $('.menu-sticky .menu-container:not(.menu-hide)').length && $('.menu-shrink').length ) {
					scrollTo += UNCODE.menuHeight - ( $('.navbar-brand').data('minheight') + shrink );
				}
			}

			if (scrollSpeed == 0) {
				$('html, body').scrollTop(calc_scroll);
				UNCODE.scrolling = false;
			} else {
					$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
						$(this).stop();
					}).animate({
						scrollTop: calc_scroll
					}, scrollSpeed, 'easeInOutCubic', function() {
						$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
						UNCODE.scrolling = false;
						if (getOffset != UNCODE.get_scroll_offset(event) || $('.menu-hided').length) {
							calc_scroll = pageHeaderTop + pageHeaderHeight;
							getOffset = UNCODE.get_scroll_offset(event);
							calc_scroll -= getOffset;
								$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
									$(this).stop();
								}).animate({
									scrollTop: calc_scroll
								}, scrollSpeed, 'easeInOutCubic', function() {
									$(this).off("scroll wheel DOMMouseScroll mousewheel touchmove");
									UNCODE.scrolling = false;
								}
							);
						}
					}
				);
			}
		});
	}

	// Colomun hover effect
	// =================
	$(document).on('mouseenter', '.col-link', function(e) {
		var uncol = $(e.target).prev('.uncol'),
		el = uncol.find('.column-background');
		if (el) {
			$('.btn-container .btn', uncol).addClass('active');
			var elOverlay = $(el[0]).find('.block-bg-overlay');
			if (elOverlay.length) {
				var getOpacity = $(elOverlay).css('opacity');
				if (getOpacity != 1) {
					getOpacity = Math.round(getOpacity * 100) / 100;
					var newOpacity = getOpacity + .1;
					$(elOverlay).data('data-opacity', getOpacity);
					$(elOverlay).css('opacity', newOpacity);
				}
			}
		}
	}).on('mouseleave', '.col-link', function(e) {
		var uncol = $(e.target).prev('.uncol'),
		el = uncol.find('.column-background');
		$('.btn-container .btn', uncol).removeClass('active');
		if (el) {
			var elOverlay = $(el[0]).find('.block-bg-overlay');
			if (elOverlay.length) {
				var getOpacity = $(elOverlay).data('data-opacity');
				$(elOverlay).css('opacity', getOpacity);
			}
		}
	});

	// Admin bar
	// ============
	var fixAdminBar = function() {
		if ($('html').hasClass('admin-mode') && !SiteParameters.is_frontend_editor ) {
			var getAdminBar = $('#wpadminbar');
			if (getAdminBar.length) {
				if (getAdminBar.css('position') !== 'hidden') {
					var getAdminBarHeight = getAdminBar.height();
					if (getAdminBar.css('position') === 'fixed') {
						$('html').css({'margin-top':getAdminBarHeight + 'px','padding-top': UNCODE.bodyBorder+'px'});
						$('.body-borders .top-border').css({'margin-top':getAdminBarHeight+'px'});
					} else {
						$('html').css({'padding-top':UNCODE.bodyBorder + 'px','margin-top':'0px'});
						$('.body-borders .top-border').css({'margin-top':'0px'});
					}
				}
			}
		}
	};
	window.addEventListener('load', fixAdminBar);
	window.addEventListener('resize', fixAdminBar);
	// Print
	// ===========
	var beforePrint = function() {
		window.dispatchEvent(new CustomEvent('resize'));
		window.dispatchEvent(UNCODE.boxEvent);
	};

	if (window.matchMedia) {
		var mediaQueryList = window.matchMedia('print');
		mediaQueryList.addListener(function(mql) {
			if (mql.matches) {
				beforePrint();
			}
		});
	}

	window.onbeforeprint = beforePrint;

	// Safari srcset
	var safariSrcSet = function(){
		if ( !SiteParameters.is_frontend_editor ) {
			$('html.safari img[sizes]').each(function(){
				var $img = $(this),
					sizeImg = parseInt($img.attr('sizes'));
				if ( typeof(sizeImg) === 'number' ) {
					$img.attr('sizes', (sizeImg) + 'px');
				}
			});
		}
	};
	window.addEventListener('load', safariSrcSet);
}

UNCODE.lettering = function() {

	var setCTA;
	var highlightStill = function(){

		var $heading_texts = $('.heading-text:not(.animate_inner_when_almost_visible)');

		$.each($heading_texts, function(key, el) {
			var $heading = $(el);

			if ( ! $('.heading-text-highlight-inner[data-animated="yes"]', $heading).length ) {
				return;
			}

			if (UNCODE.isUnmodalOpen && !el.closest('#unmodal-content')) {
				return;
			}

			var waypoint = new Waypoint({
				context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
				element: el,
				handler: function() {
					var $anims = $('.heading-text-highlight-inner[data-animated="yes"]', this.element),
						anims_l = $anims.length;
					$anims.each(function(_key_, _el_){
						var $anim = $(_el_);

						if ( ! $anim.hasClass('heading-text-highlight-animated') ) {
							$anim.addClass('heading-text-highlight-animated');

							if ( $heading.data('animate') === true ) {
								$anim.css({
									'-webkit-transition-duration': '0ms',
									'-moz-transition-duration': '0ms',
									'-o-transition-duration': '0ms',
									'transition-duration': '0ms',
								});
							} else {
								$anim.css({
									'-webkit-transition-delay': ((_key_ + 2) * 200) + 'ms',
									'-moz-transition-delay': ((_key_ + 2) * 200) + 'ms',
									'-o-transition-delay': ((_key_ + 2) * 200) + 'ms',
									'transition-delay': ((_key_ + 2) * 200) + 'ms',
								});
							}
						}

					});
					$anims.last().one('webkitTransitionEnd oTransitionEnd mozTransitionEnd msTransitionEnd transitionEnd', function(e) {
						$heading.data('animate', true);
					});
					$anims.removeAttr('data-animated');
				},
				offset: '100%'
			});

		});

		Waypoint.refreshAll();
		$( document.body ).trigger('uncode_waypoints');
		if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
			$(document).trigger('uncode-scrolltrigger-refresh');
		}

	}

	requestTimeout(function(){
		highlightStill();
		$(window).on( 'wwResize', function(){
			clearRequestTimeout(setCTA);
			setCTA = requestTimeout( highlightStill, 100 );
		});
	}, 400);

};

UNCODE.isUnmodalOpen = false;

var manageVideoSize = function(){

	var setVideoFit;
	$('.wp-block-embed').each(function(){

		var $this = $(this);

		if ( $('iframe', $this).length ) {

			var $iframe = $('> iframe, > a > iframe', $this),
				w = parseFloat($iframe.attr('width')),
				h = parseFloat($iframe.attr('height')),
				url = $iframe.attr('src'),
				ratio, frW;

			if ( typeof url != 'undefined' && url.indexOf('soundcloud') == -1 && h !== 0  ) {

				ratio = h / w;
				var setResizeiFto,
					resizeiFrame = function(){
					frW = $iframe.width();
					$iframe.css({
						height: frW * ratio
					});
				};
				resizeiFrame();
				$(window).on( 'wwResize load', function(){
					clearRequestTimeout(setResizeiFto);
					setResizeiFto = requestTimeout( function() {
						resizeiFrame();
					}, 10 );
				});

			}

		}

	});

};

manageVideoSize();

UNCODE.vivus = function(icon, time, delay, file) {
	if (typeof Vivus !== 'undefined') {
		var icon_options = {
			type: 'delayed',
			pathTimingFunction: Vivus.EASE_OUT,
			animTimingFunction: Vivus.LINEAR,
			duration: time,
		}

		if (delay) {
			icon_options.delayStart = delay;
		}

		if (file) {
			icon_options.file = file;
		}

		new Vivus(icon, icon_options);
	}
};

UNCODE.lastURL = '';

UNCODE.getURLParams = function(current_location, is_string) {
	var params = {};
	if (is_string) {
		var url = current_location.split('?')[1];
	} else {
		var url = current_location.search;
		url = url.substring(1);
	}
	if (url) {
		var parts = url.split('&');
		for (var i = 0; i < parts.length; i++) {
			var nv = parts[i].split('=');
			if (!nv[0]) {
				continue;
			}
			params[nv[0]] = nv[1] || true;
		}
	}
	return params;
}

UNCODE.hasEqualURLParams = function(obj1, obj2) {
	for (var i in obj1) {
		if (obj1.hasOwnProperty(i)) {
			if (!obj2.hasOwnProperty(i)) {
				return false;
			}
			if (obj1[i] != obj2[i]) {
				return false;
			}
		}
	}
	for (var i in obj2) {
		if (obj2.hasOwnProperty(i)) {
			if (!obj1.hasOwnProperty(i)) {
				return false;
			}
			if (obj1[i] != obj2[i]) {
				return false;
			}
		}
	}
    return true;
}

UNCODE.magnetic = function(){
	
	$(document).on('mousemove', '.un-magnetic-zone', function(e){

		var $zone = $(this),
			zoneOff = $zone.offset(),
			$mgntcEl = $('.un-magnetic-el', this),
			elBound = this.getBoundingClientRect(),
			maxSize = Math.max($zone.outerWidth(), $zone.outerHeight());

		var Xvalue = e.pageX - (zoneOff.left + maxSize / 2),
	  		Yvalue = e.pageY - (zoneOff.top + maxSize / 2);
	  
		$mgntcEl.each(function(key, val){
			var magneticValue = $(val).attr('data-mgntc') || 0.5;
		
			val.animate({
				transform: 'translate(' + (Xvalue * magneticValue) + '%, ' + (Yvalue * magneticValue) + '%)',
			},{
				duration: 500,
				fill: 'forwards',
			})
	  	});
	})
	
	$(document).on('mouseleave', '.un-magnetic-zone', function(e){
		var $mgntcEl = $('.un-magnetic-el', this);

		$mgntcEl.each(function(key, val){
			val.animate({
		  		transform: 'translate(0)',
			},{
		  		duration: 500,
		  		fill: 'forwards',
			})
	  	});
	})
};


})(jQuery);
