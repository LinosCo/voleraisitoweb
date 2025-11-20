(function($) {
	"use strict";

	UNCODE.rotateIt = function() {

	if ( $('body').hasClass('compose-mode') ) {
		return;
	}

	var frameRotate = false;
	var loadRotateIt = function(){

		var $toRotate = $('.uncode-rotate');

		$toRotate.each(function(){
			var $rotate = $(this),
				deg = 0,
				dir = true,
				coeff = 1,
				lastOffset = 0,
				lastDate = Date.now();

			var checkScroll = function($rotate){
				// if ( ! $rotate.length ) {
				// 	return;
				// }

				var now = Date.now(),
					delayInMs = now - lastDate,
					offset = window.pageYOffset || window.document.documentElement.scrollTop,
					newOffset = offset - lastOffset,
					speed = (newOffset / delayInMs) * 5,
					body = document.body,
					html = document.documentElement,
					docH = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

				lastDate = now;
				lastOffset = offset;

				if ( Math.abs(deg) > 359 || isNaN(deg) ) {
					deg = 0;
				}

				if ( $rotate.hasClass('uncode-rotate-scroll') || $rotate.hasClass('uncode-rotate-speed') ) {
					deg = parseFloat(deg) + parseFloat(speed);
				}

				if ( $rotate.hasClass('uncode-rotate-hover') ) {
					$rotate.hover(function(){
						coeff = 1.75;
					}, function(){
						coeff = 1;
					});
				}

				// if ( speed > 0 ) {
				// 	dir = true
				// } else if ( speed < 0 ) {
				// 	dir = false
				// }

				if ( ! $rotate.hasClass('uncode-rotate-scroll') ) {
					deg = deg+coeff;
					// if ( dir ) {
					// 	deg = deg+coeff;
					// } else {
					// 	deg = deg-coeff;
					// }
				}

				if ( $rotate.closest('.un-text-marquee').length && UNCODE.wwidth <= UNCODE.mediaQuery ) {
					return false;
				}
				
				if ( $rotate.closest('.un-text-marquee').length && ! $rotate.closest('.un-marquee-scroll, .un-marquee-opposite').length ) {
					var undeg = deg*-1;
					$rotate[0].style.transform = 'rotate(' + undeg + 'deg)';
				} else {
					$rotate[0].style.transform = 'rotate(' + deg + 'deg)';
				}

				requestAnimationFrame(function() {
					if ( frameRotate === true ) {
						frameRotate = false;
						return;
					}
					checkScroll($rotate);
				});
			};

			checkScroll($rotate);

		});

	};

	$(window).on('load', loadRotateIt);

	var checkRotate;
	var resizeRotate = function(){
		var $inlineRotates = $('.inline-rotate');
		$inlineRotates.each(function(){
			$(this).addClass('inline-rotate-standby');
		});
		clearTimeout(checkRotate);
		checkRotate = setTimeout(function(){
			$('.inline-rotate').each(function(){
				$(this).removeClass('inline-rotate-standby');
				frameRotate = true;
			});
			loadRotateIt();
		}, 500);
	};

	$(window).off('resize.inline-rotate', resizeRotate)
	.on('resize.inline-rotate', resizeRotate);

};


})(jQuery);
