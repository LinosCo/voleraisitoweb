(function($) {
	"use strict";

	UNCODE.rowParallax = function(){

	if ( SiteParameters.is_frontend_editor || SiteParameters.smoothScroll !== 'on' ) {
		return;
	}

	var $rows = $('.parallax-move'),
		stableHeight = UNCODE.wheight;
	$rows.each(function(){
		var $row = $(this),
			_row = $row[0],
			dataMove = $row.attr('data-parallax-move'),
			dataSafe = $row.attr('data-parallax-safe'),
            rowInViewport = false,
			trans;

		if ( $row.find('.parallax-move').length ) {
			return;
		}

		dataSafe = typeof dataSafe === 'undefined' ? '' : dataSafe;
		dataMove = typeof dataMove === 'undefined' || dataMove === '' ? 3 : dataMove;           
        dataMove = dataMove / 10;

        if ( 'IntersectionObserver' in window ) {
			var observer = new IntersectionObserver(function(entries) {
	
				entries.forEach(function(entry){
					if ( entry.isIntersecting ) {
						rowInViewport = true;
					} else {
						rowInViewport = false;
					}
				});
	
			}, { 
				root: document,
			});
	
			observer.observe(_row);
		} else {
            rowInViewport = true;
		}

		var loopRAF = function() {
			if( rowInViewport ) {
				var bound = _row.getBoundingClientRect(),
					bound_top = bound.top,
					bound_height = bound.height,
					move = true,
					scrolled = window.pageYOffset || window.document.documentElement.scrollTop,
					docH = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
						document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight ),
					fromBottom = docH - (scrolled + bound_top + bound_height);

                if ( bound_height > stableHeight && dataSafe === 'yes' ) {
                    $row.find('>div').css({
                        'transform':'none'
                    });
                    move = false;
				}

				if ( UNCODE.wwidth < SiteParameters.smoothScrollQuery ) {
					$row.find('>div').css({
						'transform':'none'
					});
					move = false;
				}

				if ( move ) {

					if ( fromBottom < stableHeight ) {
						//maybe Footer
						trans = (stableHeight - (bound_top + bound_height + fromBottom))*(dataMove);
                    } else if ( scrolled + bound_top < stableHeight ) {
						//maybe Header
						trans = scrolled*(dataMove);
					} else {
						trans = (((stableHeight/2) - (bound_top + (bound_height/2)))*dataMove);
					}

                    $row.find('>div').css({
                        'transform':'translateY(' + (trans) + 'px) translateZ(0)',
                    });
                }
			}
	
			requestAnimationFrame(loopRAF);
		};
		
		requestAnimationFrame(loopRAF);

	});

	$(window).on( 'load resize', function(e) {
		if ( ! UNCODE.isMobile ) {
			stableHeight = UNCODE.wheight;
		}
	});

	$(window).on( 'load wwResize', function(e) {
		if ( UNCODE.isMobile ) {
			stableHeight = UNCODE.wheight;
		}
	});

}


})(jQuery);
