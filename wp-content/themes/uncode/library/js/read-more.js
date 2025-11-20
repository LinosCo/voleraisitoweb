(function($) {
	"use strict";

	UNCODE.readMoreCol = function( $el ){
	if ( typeof $el === 'undefined' || $el === null ) {
		$el = $('body');
	}
	var $readMoreCols = $('.uncont.overflow-hidden-mask[data-ov-height]', $el);
	$readMoreCols.each(function(){
		var $uncont = $(this),
			$row = $uncont.closest('.row-container'),
			max_h = $uncont.attr('data-ov-height'),
			max_h_mobile = $uncont.attr('data-ov-height-mobile'),
			actual_max_h = $uncont.outerHeight(),
			inner_h,
			$read_more = $('+ .btn-more-wrap', $uncont),
			read_more_resize = $read_more.hasClass('trigger-resize'),
			marginClosedBtn = $uncont.attr('data-margin-closed'),
			marginClosed = 0,
			marginOpenBtn = $uncont.attr('data-margin-open'),
			marginOpen = 0,
			anim_t = 250,
			resized = false;

		max_h_mobile = typeof max_h_mobile === 'undefined' || max_h_mobile === null ? '' : max_h_mobile;

		switch (marginClosedBtn) {
			case 'sm':
				marginClosed = 18
				break;
				
			case 'std':
				marginClosed = 36
				break;
				
			case 'lg':
				marginClosed = 72
				break;
				
			case '':
			default:
				marginClosed = 0
				break;
				
		}

		switch (marginOpenBtn) {
			case 'sm':
				marginOpen = 18
				break;
				
			case 'std':
				marginOpen = 36
				break;
				
			case 'lg':
				marginOpen = 72
				break;
				
			case 'no':
				marginOpen = 0
				break;
				
		}

		var checkToggleMobile = function(){
			if ( UNCODE.wwidth <= UNCODE.mediaQuery && max_h_mobile !== '' ) {
				resized = true;
				if ( $read_more.hasClass('state-closed') ) {
					$uncont[0].style.height = '';
					$uncont[0].style.maxHeight = max_h_mobile;
				}
			} if ( resized === true && UNCODE.wwidth > UNCODE.mediaQuery ) {
				if ( $read_more.hasClass('state-closed') ) {
					$uncont[0].style.height = '';
					$uncont[0].style.maxHeight = max_h;
				}
				resized = false;
			}
		}
		checkToggleMobile();
		$(window).on('resize', function() {
			checkToggleMobile();
		});

		$('a', $read_more).on('click', function(e){
			e.preventDefault();

			var $a = $(this);

			if ( $read_more.hasClass('state-closed') ) {

				$read_more
					.removeClass('state-closed')
					.addClass('state-open');

				$uncont.css({
					'max-height': 'none',
					'height': 'auto',
				});
	
				inner_h = parseFloat( $uncont.outerHeight() );

				$uncont.css({
					'height': ( UNCODE.wwidth <= UNCODE.mediaQuery && max_h_mobile !== '' ) ? max_h_mobile : max_h
				});
		
				anim_t = inner_h - actual_max_h;
				if ( anim_t < 250 ) {
					anim_t = 250;
				} else if ( anim_t > 1000 ) {
					anim_t = 1000;
				}

				$uncont.css({
					'transition-duration' : anim_t + 'ms'
				}).addClass('overflow-mask-animation').animate({
					'height': inner_h
				}, anim_t, 'easeInOutCubic', function(){
					$uncont.css({
						'height' : 'auto'
					}).removeClass('overflow-mask');
					if ( read_more_resize === true ) {
						window.dispatchEvent(new Event('resize'));
						if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
							ScrollTrigger.refresh(true);
						}
					}
				});

				if ( marginOpen != '' ) {
					$read_more.animate({
						'margin-top' : marginOpen
					}, anim_t, 'easeInOutCubic');
				}

			} else {
				$read_more
					.removeClass('state-open')
					.addClass('state-closed');

				$uncont.addClass('overflow-mask').removeClass('overflow-mask-animation').animate({
					'height': ( UNCODE.wwidth <= UNCODE.mediaQuery && max_h_mobile !== '' ) ? max_h_mobile : max_h
				}, anim_t, 'easeInOutCubic', function(){
					if ( read_more_resize === true ) {
						window.dispatchEvent(new Event('resize'));
						if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
							ScrollTrigger.refresh(true);
						}
					}
				});

				if ( marginClosed !== '' ) {
					$read_more.animate({
						'margin-top' : marginClosed
					}, anim_t, 'easeInOutCubic');
				}

				if ( $a.hasClass('toggle-scroll') ) {
                    var $masthead = $('#masthead > div:first-child'),
                        headH = $masthead.outerHeight(),
						rectTop = $row[0].getBoundingClientRect().top,
						checkNavBar = $a.hasClass('toggle-navbar'),
						checkNavBarMobile = $a.hasClass('toggle-navbar-mobile'),
                        offCont = ( $row.offset().top );

					if ( UNCODE.wwidth <= UNCODE.mediaQuery ) {
						checkNavBar = checkNavBarMobile;
					}

					if ( checkNavBar ) {
						offCont = offCont - headH;
					}
			
					if ( rectTop < headH ) {
						$('html, body').on("scroll wheel DOMMouseScroll mousewheel touchmove", function(){
							$(this).stop();
						}).animate({
							scrollTop: offCont
						}, anim_t, 'easeInOutCubic');
					}
				}

			}
		});
	});
}

})(jQuery);
