(function($) {
	"use strict";

	UNCODE.is_scrolling = false;

UNCODE.disableHoverScroll = function() {

	if (!UNCODE.isMobile && !UNCODE.isFullPage && !SiteParameters.is_frontend_editor && (!SiteParameters.smoothScroll || SiteParameters.smoothScrollDisableHover )) {
		var body = document.body,
		timer;

		window.addEventListener('scroll', function() {
			var delay = ( body.classList.contains('bg-changer-init') ) ? SiteParameters.bg_changer_time : 300;
			clearRequestTimeout(timer);
			if ( body.classList && !body.classList.contains('disable-hover') ) {
				body.classList.add('disable-hover');
				window.dispatchEvent(new CustomEvent('disable-hover'));
			}
			UNCODE.is_scrolling = true;

			timer = requestTimeout(function() {
				if ( body.classList ) {
					body.classList.remove('disable-hover');
					window.dispatchEvent(new CustomEvent('enable-hover'));
				}
				UNCODE.is_scrolling = false;
			}, delay);
		}, false);
	}
};


})(jQuery);
