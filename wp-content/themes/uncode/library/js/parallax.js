(function($) {
	"use strict";

	UNCODE.parallax = function() {
	if (!UNCODE.isFullPage && !UNCODE.isFullPageSnap && (UNCODE.wwidth > UNCODE.mediaQuery || SiteParameters.mobile_parallax_animation === '1')) {
		if ($('.parallax-el').length > 0) {
			var parallax_elements = new Rellax('.parallax-el');
			$( document.body ).trigger('uncode_parallax_done', parallax_elements);
			window.addEventListener('boxResized', function(e) {
				parallax_elements.refresh();
			}, false);
			$(window).on('uncode_wc_variation_gallery_loaded', function (event) {
				requestTimeout(function() {
					parallax_elements.refresh();
				}, 100);
			});

			if ( typeof UNCODE.hDoc === 'undefined' ) {
				UNCODE.hDoc = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
					document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
			}
		
			function paralraf(time) {
				requestAnimationFrame(paralraf)
		
				var newHdoc = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
					document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
				
				if ( UNCODE.hDoc !== newHdoc ) {
					UNCODE.hDoc = newHdoc;
					parallax_elements.refresh();
				}
			}
		
			requestAnimationFrame(paralraf)
		
		}
	}
};


})(jQuery);
