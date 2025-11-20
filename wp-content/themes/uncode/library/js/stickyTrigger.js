(function($) {
	"use strict";

	UNCODE.stickyTrigger = function( $el ) {
    if ( SiteParameters.is_frontend_editor ) {
        return false;
    }

    var stickyTrigger = function(){
        var stickyTrick = $('.sticky-trigger').each(function(){
            var $sticky = $(this),
                $inside = $('> div', $sticky),
                insideH = $inside.outerHeight(),
                $row = $sticky.closest('.vc_row'),
                $uncont = $sticky.closest('.uncont'),
                rowBottom,
                uncontBottom,
                diffBottom;

            ScrollTrigger.create({
                trigger: $sticky,
                start: function(){ return "top center-=" + insideH/2; },
                endTrigger: $row,
                end:  function(){
                    rowBottom = $row.offset().top + $row.outerHeight();
                    uncontBottom = $uncont.offset().top + $uncont.outerHeight();
                    diffBottom = rowBottom - uncontBottom;
                    return "bottom center+=" + ( insideH/2 + diffBottom );
                },
                anticipatePin: true,
                pin: true,
                pinSpacing: false,
                scrub: true,
                invalidateOnRefresh: true,
            });

        });
    },
    setResizeSticky;

    $(window).on( 'load', function(){
        stickyTrigger();
        var carousel = document.querySelector(".owl-carousel"),
            grid = document.querySelector(".isotope-container"),
            stickyAll = document.querySelectorAll(".sticky-trigger");

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
                    $(document).trigger('uncode-scrolltrigger-refresh');
                }, 500);
            }

        }
    });

    var oldW = UNCODE.wwidth;
    $(window).on( 'resize uncode.re-layout', function(e){
        clearRequestTimeout(setResizeSticky);
        if ( e.type === 'resize' && oldW === UNCODE.wwidth ) {
            return;
        } else {
            oldW = UNCODE.wwidth;
        }
        setResizeSticky = requestTimeout( function(){
            stickyTrigger();
            $(document).trigger('uncode-scrolltrigger-refresh');
        }, 1000 );
    });

    
};


})(jQuery);
