(function($) {
	"use strict";

	var marqueeAttempts = 0,
	marqueeTO,
	marqueeCheckResize,
	initMarquee;

UNCODE.textMarquee = function( $titles ) {

	var isInitMarque = false;

	var initTextMarquee = function( $titles ){

		if ( typeof $titles == 'undefined' ) {
			$titles = $('.un-text-marquee');
		}

		if ( ! $titles.length ) {
			return;
		}

		isInitMarque = true;

		var stableHeight = UNCODE.wheight;

		$titles.each(function(){
			var $title = $(this),
				$span = $('> span, > i > span', $title),
				txt,
				first = true,
				dataSpeed = parseFloat( $title.closest('.heading-text').attr('data-marquee-speed') ),
				dataSpace = parseFloat( $title.closest('.heading-text').attr('data-marquee-space') ),
				dataTrigger = $title.closest('.heading-text').attr('data-marquee-trigger'),
				hasSticky = false,
				dataNavBar = $title.closest('.heading-text').attr('data-marquee-navbar'),
				dataNavBarMobile = $title.closest('.heading-text').attr('data-marquee-navbar-mobile'),
				newW = UNCODE.wwidth,
				marqueeTL, inview;

			if ( $title.closest('.sticky-trigger').length || $title.closest('.sticky-element').length || $title.closest('.pin-spacer').length ) {
				hasSticky = true;
				dataTrigger = 'row';
			}

			if ( UNCODE.wwidth <= UNCODE.mediaQuery ) {
				dataNavBar = dataNavBarMobile;
			}

			dataSpeed = isNaN(dataSpeed) ? 0 : dataSpeed;
			dataSpace = isNaN(dataSpace) ? 'default' : dataSpace;
			var dataX = dataSpeed;

			dataSpeed += 5;

			$('.marquee-clone-wrap', $title).remove();

			txt = $span.html();

			if ( ! $('.marquee-original-core', $span).length ) {
				txt = $span.html();
				$span = $('> span, > i > span', $title).wrapInner('<span class="marquee-original-core" />').addClass('marquee-original');
			} else {
				txt = $('.marquee-original-core', $span).html();
			}

			var spanW,
				$prepended = $('<span class="marquee-clone-wrap wrap-prepended" />'),
				$appended = $('<span class="marquee-clone-wrap wrap-appended" />'),
				speed = 10 - dataSpeed;

			$span.prepend($prepended);
			$span.append($appended);

			var continuousTextMarquee = function () {
				var bound = $title
						.css({
							transform: "none",
							opacity: 0,
						})
						.offset(),
					ease = "none";

				var xStrt =
						first || $title.hasClass("un-marquee-infinite")
							? 0
							: UNCODE.wwidth - bound.left,
					xEnd = $title.hasClass("un-marquee-infinite")
						? spanW
						: spanW + bound.left,
					xSpeed =
						((xEnd + xStrt) / (dataSpeed * dataSpeed * dataSpeed) / 5) *
						dataSpeed,
					direction = $title.hasClass("un-marquee-opposite") ? 1 : -1,
					speedSlow = (xEnd + xStrt) / 45,
					transFormVal,
					translX;

				marqueeTL = new TimelineMax({ paused: true, reversed: true });
				marqueeTL.play();

				var inViewElement =
						dataTrigger === "row" ? ( hasSticky ? $title.closest('.sticky-trigger, .sticky-element').parent()[0] : $title.closest(".vc_row")[0] ) : $title[0],
					wayOff =
						dataTrigger === "row" && dataNavBar === "yes"
							? UNCODE.menuHeight
							: 0;

				inview = new Waypoint.Inview({
					element: inViewElement,
					offset: wayOff,
					enter: function (direction) {
						marqueeTL.play();
					},
					exited: function (direction) {
						if (!$title.closest(".pin-spacer").length) {
							marqueeTL.pause();
						}
					},
				});

				if ($title.hasClass("un-marquee-hover")) {
					var $column = $title.closest(".wpb_column"),
						$col_link = $(".col-link", $column),
						$hover_sel = $title;

					if ($col_link.length) {
						$hover_sel = $title.add($column);
					}
					$hover_sel
						.on("mouseover", function () {
							ease = "power2.out";
							transFormVal = $title.css("transform").split(/[()]/)[1];
							translX = transFormVal.split(",")[4];
							speedSlow = (xEnd + (xStrt - translX)) / 45;
							marqueeTL.duration(speedSlow);
						})
						.on("mouseout", function () {
							ease = "power2.in";
							transFormVal = $title.css("transform").split(/[()]/)[1];
							translX = transFormVal.split(",")[4];
							speedSlow =
								((xEnd + (xStrt - translX)) /
									(dataSpeed * dataSpeed * dataSpeed) /
									5) *
								dataSpeed;
							marqueeTL.duration(speedSlow);
						});
				}
		
				gsap.killTweensOf($title);
				marqueeTL.fromTo( $title, {
					opacity: 1,
					x: xStrt * direction * -1
				},
				{
					duration: xSpeed,
					x: xEnd * direction,
					onComplete: function(){
						first = false;
						continuousTextMarquee();
					},
					onUpdate: function(){
						if ( ! $title[0].isConnected ) {
							marqueeTL.kill();
							initTextMarquee();
						}
					},
					ease: ease
				});
		
			};
			
			var runTextMarquee = function(){
				var time = Date.now();

				var textMarqueeScroll = function(){
					var $row = $title.closest('.vc_row');
					if ( hasSticky ) {
						$row = $title.closest('.sticky-trigger, .sticky-element').parent();
					}					
					var $bound = (dataTrigger === 'row' || dataTrigger === 'row-middle') ? $row : $title;

					if ( !$bound.length ) {
						return;
					}

					var bound = $bound[0].getBoundingClientRect(),
						wait = 100,
						direction = $title.hasClass('un-marquee-scroll-opposite') ? -1 : 1,
						dataMove = dataX >= 0 ? 1 + dataX : -1 * ( 5 / (dataX - 0.5) * 0.25);

					if ( bound.top === 0 && bound.bottom === 0 && bound.left === 0 && bound.right === 0 &&
						bound.height === 0 && bound.width === 0 && bound.x === 0 && bound.y === 0 &&
						marqueeAttempts < 2 ) {

						clearRequestTimeout(marqueeTO);

						marqueeTO = requestTimeout(function(){
							marqueeAttempts++;
							initTextMarquee();
						}, 100);
					}


					var bound_top = bound.top,
						gsap_calc = ( ( stableHeight * 0.35 - bound_top ) * dataMove ) * 0.5 * direction;

					if ( dataTrigger === 'row' || dataTrigger === 'row-middle' ) {
						if ( dataTrigger === 'row-middle' ) {
							bound_top = (bound.top + bound.height*0.5) - (stableHeight * 0.5)
						}
						if ( dataNavBar === 'yes' ) {
							bound_top = bound_top - UNCODE.menuHeight;
						}
						gsap_calc = ( bound_top * dataMove ) * 0.5 * direction;
					}

					gsap.killTweensOf($title);
					gsap.to( $title, {
						duration: 0.24,
						x: gsap_calc,
					});
				};

				textMarqueeScroll();
				$(window).on( 'load scroll', function(e) {
					textMarqueeScroll();
				});

			};

			var cloneSpan = function($_title, cntnt){

				if ( $_title.hasClass('un-marquee-infinite') ) {
					$('> span.marquee-clone-wrap', $_title).text('');
				}

				gsap.to( $_title, {
					duration: 0,
					x: 0
				});
				spanW = $span.outerWidth();

				if ( !spanW ) {
					return;
				}

				var part = Math.ceil( UNCODE.wwidth / spanW ) * 2,
					spaceSpan = dataSpace !== 'default' ? '<span class="marquee-space-' + dataSpace + '">\u00A0</span>' : "\u00A0";

				if ( $_title.hasClass('un-marquee-infinite') ) {

					for ( var i = 0; i < part; i++ ) {
						$prepended.append(cntnt + spaceSpan);
						$appended.append(cntnt + spaceSpan);
					}
				}

				if ( $('body').hasClass('compose-mode') ) {
					$('.uncode_fe_safe').remove();
					return;
				}

				if ( $title.closest('.marquee-freezed').length ) {
					return;
				}

				if ( $_title.hasClass('un-marquee') || $_title.hasClass('un-marquee-opposite') ) {
					continuousTextMarquee();
				}

				if ( $_title.hasClass('un-marquee-scroll') || $_title.hasClass('un-marquee-scroll-opposite') ) {
					runTextMarquee();
				}

			};

			var marqueeResize = function(e){
				clearRequestTimeout(marqueeCheckResize);
				marqueeCheckResize = requestTimeout(function(){
					if ( newW !== UNCODE.wwidth ) {
						gsap.killTweensOf($title);
						if ( typeof inview !== 'undefined' && inview !== null ) {
							inview.destroy();
						}
						if ( typeof marqueeTL !== 'undefined' && marqueeTL !== null ) {
							marqueeTL.kill();
						}
						first = true;
						initTextMarquee();
						newW = UNCODE.wwidth;
					}
				}, 1000);
			};

			$(window).off('resize', marqueeResize)
			.on( 'resize', marqueeResize);
			$(window).off('uncode.re-layout', marqueeResize)
			.on( 'uncode.re-layout', marqueeResize);

			cloneSpan($title, txt);

			if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
				window.parent.vc.events.on( 'shortcodeView:updated', function( e ){
					var $_titles = $('.un-text-marquee',e.view.$el);
					clearRequestTimeout(marqueeCheckResize);
					marqueeCheckResize = requestTimeout(function(){
						initTextMarquee($_titles);
					}, 1000);
				});
			}
		});

		$(window).on( 'load wwResize', function(e) {
			stableHeight = UNCODE.wheight;
		});

	};

	document.addEventListener("DOMContentLoaded", function() {
		if ( isInitMarque !== true ) {
			initTextMarquee();
		}
	});

	$(window).on('focus load resize',function(){
		clearTimeout(initMarquee);
		initMarquee = setTimeout(function(){
			if ( isInitMarque !== true ) {
				initTextMarquee();
			}
		}, 500);
	});
	
	$(document).on('pumAfterOpen pumAfterClose', function(args){
		initTextMarquee();
	});

};
	

})(jQuery);
