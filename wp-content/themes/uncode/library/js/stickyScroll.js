(function($) {
	"use strict";

	UNCODE.stickyScroll = function( $el ) {
	if ( typeof $el === 'undefined' || $el === null ) {
		$el = $('body');
	}
	var checkVisible = function( el, dir ) {
		if (typeof jQuery === "function" && el instanceof jQuery) {
			el = el[0];
		}

		var off = 50;
		dir = typeof dir=='undefined' ? 'right' : dir;
		var rect = el.getBoundingClientRect();

		return (
			(
				( rect.top >= 0 && (rect.top + off) <= (window.innerHeight || document.documentElement.clientHeight) ) ||
				( rect.bottom >= off && (rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) ) ||
				( rect.top <= 0 && (rect.bottom) >= (window.innerHeight || document.documentElement.clientHeight) )
			) &&
			(
				( rect.left >= 0 && (rect.left + (window.innerWidth || document.documentElement.clientWidth)/2) <= (window.innerWidth || document.documentElement.clientWidth) ) ||
				( rect.left >= 0 && rect.right <= (window.innerWidth || document.documentElement.clientWidth) ) ||
				( rect.right <= window.innerWidth && (rect.right - off) >= 0 ) ||
				( rect.right <= window.innerWidth && rect.left >= 0 )
			)
		);
	};

	var setItemsRelHeight = function(reset) {
		var $_el = $el;
		if ( $el.is('.index-scroll') ) {
			var $_el = $el.closest('.uncont');
		}
		$('.index-scroll:not(.hor-scroll-vh) .index-row', $_el).each(function(i, item){
			$.each($('.tmb', item), function(index, val) {
				if ( reset === true ) {
					$(val).css( 'visibility', 'hidden' );
				} else {
					$(val).css( 'visibility', 'visible' );
				}
			});
		});
		$('.index-scroll.hor-scroll-vh .index-row', $_el).each(function(i, item){
			$.each($('.tmb', item), function(index, val) {
				if ( reset === true ) {
					$(val).css( 'visibility', 'hidden' );
					$('img:not(.avatar), picture, .t-background-cover', val).css( 'height', 'auto' );
				} else {
					var $rowParent = $(item).closest('.row-parent'),
						rowRatio = $rowParent.attr('data-height-ratio'),
						$rowInner = $(item).closest('.row-child'),
						rowRatioInner = $rowInner.attr('data-height'),
						paddingRow = parseInt($rowParent.css('padding-top')) + parseInt($rowParent.css('padding-bottom')),
						$colContainer = $(item).closest('.uncell'),
						$uncont = $(item).closest('.uncont'),
						paddingCol = parseInt($colContainer.css('padding-top')) + parseInt($colContainer.css('padding-bottom')),
						safe_heigth = $(item).data('safe-height'),
						winHeight = safe_heigth ? UNCODE.wheight : $('#vh_layout_help').outerHeight(),
						offSet = $(item).offset().top - $uncont.offset().top,
						multiplier_h,
						data_viewport_h,
						body_border = $('.body-borders .top-border').outerHeight() * 2,
						remove_menu = $(item).data('vp-menu');

					if ( rowRatio === 'full' || rowRatio === '' ) {
						rowRatio = 1;
					} else {
						rowRatio = rowRatio / 100;
					}

					if ( typeof rowRatioInner === 'undefined' || rowRatioInner === 'full' || rowRatioInner === '' || rowRatioInner == null ) {
						rowRatio = rowRatio;
					} else {
						rowRatio = rowRatio * rowRatioInner / 100;
					}

					winHeight = winHeight * rowRatio;

					if ( UNCODE.wwidth >= UNCODE.mediaQuery ) {
						multiplier_h = parseInt($(item).attr('data-vp-height'));
					} else if ( UNCODE.wwidth < UNCODE.mediaQuery && UNCODE.wwidth >= UNCODE.mediaQueryMobile ) {
						multiplier_h = parseInt($(item).attr('data-vp-height-md'));
					} else if ( UNCODE.wwidth < UNCODE.mediaQueryMobile ) {
						multiplier_h = parseInt($(item).attr('data-vp-height-sm'));
					}

					if ( typeof multiplier_h !== 'undefined' && multiplier_h !== null && multiplier_h > 0) {
						data_viewport_h = winHeight*(multiplier_h/100) - ( paddingRow + paddingCol + body_border + offSet );
						if ( remove_menu === true ) {
							data_viewport_h = data_viewport_h - UNCODE.menuHeight;
						}
						$('img:not(.avatar), picture, .t-background-cover, .fluid-object', val).css( 'height', data_viewport_h );
					} else {
						$('img:not(.avatar), picture, .t-background-cover, .fluid-object', val).css( 'height', 'auto' );
					}

				}
			});
		});
		$('.index-scroll', $_el).each(function(i, item){
			var $uncoltable = $(item).closest('.uncoltable'),
				$rowParent = $(item).closest('.row-parent'),
				paddingRow = parseInt($rowParent.css('padding-top')) + parseInt($rowParent.css('padding-bottom')),
				body_border = $('.body-borders .top-border').outerHeight() * 2,
				$index_row = $('.index-row', item),
				safe_heigth = $index_row.data('safe-height'),
				winHeight = safe_heigth ? UNCODE.wheight : $('#vh_layout_help').outerHeight();
			if ( UNCODE.wwidth < UNCODE.mediaQuery ) {
				var data_viewport_h = winHeight - ( paddingRow + body_border );
				$uncoltable.css({
					'min-height': data_viewport_h
				});
			} else {
				$uncoltable.css({
					'min-height': 'auto'
				});
			}
		});

	}
	setItemsRelHeight();

	var $index_scrolls = $('.index-scroll', $el);

	$index_scrolls.each(function(key, value){
		var $index = $(this),
			$parent_row = $index.closest('.vc_row[data-parent]'),
			$index_row = $('.index-row', $index),
			dir = $index_row.attr('data-direction');
		dir = typeof dir === 'undefined' ? 'right' : dir;

		$parent_row.addClass('unscroll-horizontal').attr('data-direction', dir);
	});

	var $horScrolls = $('.unscroll-horizontal', $el);

	if ( $horScrolls.length ) {

		$('body').addClass('scrolling-trigger');

		$horScrolls.each(function(key, value){
			var $section = $(this),
				$index_scroll = $('.index-scroll', $section),
				$index_row = $('.index-row', $index_scroll),
				dir = $section.attr('data-direction'),
				wrap = $index_row.attr('data-wrap'),
				$pinWrap,
				$pinTrigger;

			dir = typeof dir === 'undefined' ? 'right' : dir;
			$pinTrigger = $('<div class="pin-trigger" data-direction="' + dir + '" />');
			$pinWrap = $('<div class="pin-wrap" />');
			if ( SiteParameters.is_frontend_editor ) {
				var gutterClass = $('.index-wrapper', $index_scroll).attr('class').match(/\b([^\s]+)-gutter\b/g, '');
				$('.index-wrapper', $index_scroll).wrapInner($pinWrap.addClass(gutterClass[0]));
			} else {
				if ( wrap === 'column' ) {
					$index_scroll.wrapInner( $pinWrap );
				} else {
					$('> .row', $section).wrap( $pinWrap );
				}
				$section.wrapInner( $pinTrigger );
			}

		});

		var $pinWraps = $('.pin-wrap', $el);

		var horScrollSizes = function(){

			$pinWraps.each(function(key, val){
				var $pinWrap = $(this).attr('id','pin_wrap_' + key),
					$pinTrigger = $pinWrap.closest('.pin-trigger'),
					dir = $pinTrigger.length ? $pinTrigger.attr('data-direction') : $pinWrap.closest('[data-direction]').attr('data-direction'),
					$index_scroll = SiteParameters.is_frontend_editor ? $pinWrap.closest('.index-scroll') : $('.index-scroll', $pinTrigger),
					$boxContainer = $('.box-container'),
					box_m = $boxContainer.css('margin-left'),
					st_active = true;

				var setHorW,
				horWidth = function(){
					$index_scroll.each(function(){
						var $this = $(this),
							$index_row = $('.index-row', $this),
							$rowContainer = $index_row.closest('.vc_row'),
							$rowInner = $index_row.closest('.wpb_row'),
							$rowParent = $index_row.closest('.row-parent'),
							$tmbs = $('.tmb', $index_row),
							padding_tmb = parseFloat( $tmbs.first().css('padding-right') ),
							$uncont = $index_row.closest('.uncont'),
							$parent_col = $index_row.closest('.wpb_column'),
							col_w = $uncont.width(),
							data_lg = parseFloat( $index_row.attr('data-lg') ),
							data_md = $this.hasClass('row-scroll-no-md') ? 1 : parseFloat( $index_row.attr('data-md') ),
							data_sm = $this.hasClass('row-scroll-no-sm') ? 1 : parseFloat( $index_row.attr('data-sm') ),
							tmb_w;

						col_w = col_w > UNCODE.wwidth ? UNCODE.wwidth : col_w;
						tmb_w = ( col_w + padding_tmb ) / data_lg;

						if ( typeof data_sm !== 'undefined' && data_sm !== '' && UNCODE.wwidth < 570 ) {
							tmb_w = ( col_w + padding_tmb ) / data_sm;
						} else if ( typeof data_md !== 'undefined' && data_md !== '' && UNCODE.wwidth >= 570 && UNCODE.wwidth < 960 ) {
							tmb_w = ( col_w + padding_tmb ) / data_md;
						}

						if ( !isNaN(tmb_w) ) {
							$tmbs.css({
								'width': tmb_w
							});
						}

						$tmbs.css({
							'visibility': 'visible'
						});

					});
				};

				horWidth();
				clearRequestTimeout(setHorW);
				setHorW = requestTimeout( function(){
					setItemsRelHeight();
					horWidth();
				}, 100 );

				if ( SiteParameters.is_frontend_editor ) {
					return;
				}

				var $vmenu = $('body.vmenu .vmenu-container'),
					vmenuW = $vmenu.length && UNCODE.wwidth > UNCODE.mediaQuery ? $vmenu.width() : 0,
					winWidth = window.innerWidth - vmenuW,
					$tmb = $('.tmb', $index_scroll).eq(0),
					paddingRight = parseFloat( $tmb.css('padding-right') ),
					stickyScrollLength = ( $('.index-row', $index_scroll).width() - ( $index_scroll.width() + paddingRight ) ),
					remove_menu = $('.index-row', $index_scroll).data('vp-menu'),
					scroll_anim;

				if ( $('body').hasClass('rtl') ) {
					if ( dir === 'left' ) {
						scroll_anim = gsap.fromTo( $pinWrap, {
							x: stickyScrollLength
						},{
							x: 0,
							ease: "none"
						});
					} else {
						scroll_anim = gsap.fromTo( $pinWrap, {
							x: 0
						},{
							x: stickyScrollLength,
							ease: "none"
						});
					}
				} else {
					if ( dir === 'left' ) {
						scroll_anim = gsap.fromTo( $pinWrap, {
							x: -stickyScrollLength
						},{
							x: 0,
							ease: "none"
						});
					} else {
						scroll_anim = gsap.fromTo( $pinWrap, {
							x: 0
						},{
							x: -stickyScrollLength,
							ease: "none"
						});
					}
				}

				if ( typeof ScrollTrigger.getById("stickySectionScrolling" + key) !== 'undefined' ) {
					ScrollTrigger.getById("stickySectionScrolling" + key).kill(true);
				}

				var animationIncrease;

				var checkForAnimations = function(){
					animationIncrease = 0
					$('.animate_when_almost_visible:not(.start_animation)', $pinTrigger).each(function(){
						var _this = this;
						if ( ScrollTrigger.isInViewport($pinTrigger[0]) && ScrollTrigger.isInViewport(_this, 0.5, true) ) {
							var delayAttr = parseFloat( $(_this).attr('data-delay') );
							if (delayAttr == undefined || isNaN(delayAttr)) delayAttr = 0;
							requestTimeout(function() {
								$(_this).addClass('start_animation');
							}, delayAttr + animationIncrease);
							animationIncrease += 150;
						}
					});

					var batchTime = 0;

					var resetBatch = function(){
						batchTime = 0;
					}

					if (ScrollTrigger.isScrolling()) {
						resetBatch();
					}
					
					$('.tmb-mask-reveal', $pinTrigger).each(function(){
						var _this = this,
							$this = $(_this),
							$inside = $('.t-inside', $this),
							delay = parseFloat( $inside.attr('data-delay') ),
							speed = parseFloat( $inside.attr('data-speed') ),
							easing = $inside.attr('data-easing'),
							bgDelay = parseFloat( $inside.attr('data-bg-delay') );

						delay = (isNaN(delay) || delay == null || typeof delay === 'undefined') ? 0 : delay/1000;
						speed = (isNaN(speed) || speed == null || typeof speed === 'undefined') ? 0.4 : speed/1000;
						easing = (easing === '' || easing == null || typeof easing === 'undefined') ? CustomEase.create("custom", "0.76, 0, 0.24, 1") : easing;
						bgDelay = (isNaN(bgDelay) || bgDelay == null || typeof bgDelay === 'undefined') ? '' : bgDelay;

						if ( ScrollTrigger.isInViewport($pinTrigger[0]) && ScrollTrigger.isInViewport(_this, 0.1, true) && !$this.hasClass('tmb-mask-init') ) {
							$this.addClass('tmb-mask-init');
							if ( $this.hasClass('tmb-has-hex') && bgDelay !== '' ) {
								gsap.to($('.t-entry-visual-tc', $this), speed, {
									clipPath: 'inset(0% 0% 0% 0%)',
									delay: delay + batchTime,
									ease: easing,
								});
								gsap.to($('.t-entry-visual-cont', $this), speed, {
									clipPath: 'inset(0% 0% 0% 0%)',
									scale: 1,
									delay: delay + batchTime + (speed*bgDelay),
									ease: easing,
									onComplete: resetBatch,
								});
							} else {
								gsap.to($('.t-entry-visual-cont', $this), speed, {
									clipPath: 'inset(0% 0% 0% 0%)',
									scale: 1,
									delay: delay + batchTime,
									ease: easing,
									onComplete: resetBatch,
								});
							}
							batchTime += 0.1;
						}
					});
				
				};
				checkForAnimations();

				// var start = $index_scroll.length ? parseFloat($index_scroll.position().top) : 0;
				var start = 0;

				var horST = ScrollTrigger.create({
					id: "stickySectionScrolling" + key,
					scrub: true,
					trigger: $pinTrigger[0],
					pin: true,
					anticipatePin: 1,
					start: function() { return "top top+=" + parseFloat( $('.top-border').height() + ( remove_menu === true ? UNCODE.menuHeight : 0 ) ); },
					end: function() { return "+="+stickyScrollLength; },
					animation: scroll_anim,
					ease: Sine.easeOut,
					onUpdate: checkForAnimations,
					invalidateOnRefresh: true,
					onEnter: function(){
						$pinTrigger.addClass('enter-st');
					},
					onEnterBack: function(){
						$pinTrigger.addClass('enter-st');
					},
					onLeave: function(){
						$pinTrigger.removeClass('enter-st');
					},
					onLeaveBack: function(){
						$pinTrigger.removeClass('enter-st');
					}
				});

				window.dispatchEvent(new CustomEvent('dynamic_srcset_load'));
				window.dispatchEvent(new CustomEvent('boxResized'));

				var testSecondTrigger = function(){
					animationIncrease = 0
					$('.animate_when_almost_visible:not(.start_animation)', $pinTrigger).each(function(){
						var _this = this;
						if ( checkVisible(_this) ) {
							var delayAttr = parseFloat( $(_this).attr('data-delay') );
							if (delayAttr == undefined || isNaN(delayAttr)) delayAttr = 0;
							requestTimeout(function() {
								$(_this).addClass('start_animation');
							}, delayAttr + animationIncrease);
							animationIncrease += 150;
						}
					});

				};

				var verST = ScrollTrigger.create({
					id: "verticalSectionScrolling" + key,
					trigger: $pinTrigger[0],
					start: "top center",
					end: function() { return "+="+UNCODE.wheight; },
					onUpdate: testSecondTrigger,
					invalidateOnRefresh: true
				});

				var setCTA,

				dis_enable_ST = function(){
					if ( $('.row-scroll-no-md', $pinTrigger).length && UNCODE.wwidth <= UNCODE.mediaQuery ) {
						horST.kill();
						verST.kill();
						$pinTrigger.addClass('disabled');
						st_active = false;
					} else if ( $('.row-scroll-no-sm', $pinTrigger).length && UNCODE.wwidth <= UNCODE.mediaQueryMobile ) {
						horST.kill();
						verST.kill();
						$pinTrigger.addClass('disabled');
						st_active = false;
					}
				};

				$(window).on('resize load', function() {
					clearRequestTimeout(setCTA);
					setCTA = requestTimeout(function() {
						dis_enable_ST();
						checkForAnimations();
					}, 500);
				});

			});
		};

		$(window).on( 'load', function(){
			horScrollSizes();
		});
		var setResize,
			setReLayout,
			doubleResize = true;
		$(window).on( 'load', function(){
			if ( $('.body-borders .top-border').outerHeight() > 0 ) {
				var $row_inners = document.querySelectorAll('.pin-spacer .row-inner');
				Array.prototype.forEach.call($row_inners, function(el) {
					el.style.height = '';
					el.style.marginBottom = '';
				});
				setItemsRelHeight();
				horScrollSizes();
				if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
					$(document).trigger('uncode-scrolltrigger-refresh');
				}
			}
			var carousel = document.querySelector(".owl-carousel"),
				grid = document.querySelector(".isotope-container"),
				stickyAll = document.querySelectorAll(".index-scroll");

			if ( stickyAll.length ) {
				var sticky = stickyAll[(stickyAll.length-1)];
			}

			if ( typeof sticky !== "undefined" ) {

				if ( typeof carousel !== "undefined" && carousel !== null ) {
					var carousel_position = sticky.compareDocumentPosition(carousel);
				}
				if ( typeof grid !== "undefined" && grid !== null ) {
					var grid_position = sticky.compareDocumentPosition(grid);
				}

				if ( carousel_position === 2 || grid_position === 2 ) {
					setTimeout(function(){
						if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
							$(document).trigger('uncode-scrolltrigger-refresh');
						}
					}, 500);
				}

			}
			
		});
        var iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream,
            android = /Android/.test(navigator.userAgent) && !window.MSStream;
		$(window).on( 'resize orientationchange', function(e){
			if ( e.type === 'resize' && ( iPhone || (android && Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 750) ) ) {
				return;
			}
			setItemsRelHeight(true);
			var $row_inners = document.querySelectorAll('.pin-spacer .row-inner');
			Array.prototype.forEach.call($row_inners, function(el) {
				el.style.height = '';
				el.style.marginBottom = '';
			});
			clearRequestTimeout(setResize);
			setResize = requestTimeout( function(){
				setItemsRelHeight();
				horScrollSizes();
				if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
					$(document).trigger('uncode-scrolltrigger-refresh');
				}
				if ( doubleResize === true ) {
					window.dispatchEvent(new Event('resize'));
					doubleResize = false;
				} else {
					doubleResize = true;
				}
				UNCODE.setRowHeight(document.querySelectorAll('.page-wrapper .row-parent'), false, true);
			}, 100 );
		});

		var show_pins = function(){
			$('.index-scroll').css({'opacity':'1'});
		};
		ScrollTrigger.addEventListener("refresh", show_pins);
		$(window).on( 'uncode.re-layout', function(){
			//$('.index-scroll').css({'opacity':'0'});
			$('.pin-spacer').each(function(){
				var space_h = $(this).outerHeight(),
					$row = $(this).closest('.row-container');
				$row.css({
					'height': space_h,
					'overflow': 'hidden'
				});
			});
			if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
				ScrollTrigger.refresh(true);
			}
			clearRequestTimeout(setReLayout);
			setReLayout = requestTimeout( function(){
				$('.row-container').each(function(){
					$(this).css({
						'height': '',
						'overflow': ''
					});
				});
			}, 1000);
		});
	}

};


})(jQuery);
