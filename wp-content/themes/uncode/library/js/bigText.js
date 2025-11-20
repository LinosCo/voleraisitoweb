(function($) {
	"use strict";

	UNCODE.bigText = function(el) {
	var bigTextLaunch = function(){
		if (el == undefined) {
			el = $('body');
		}
		$.each($('.bigtext', el), function(index, val) {
			$(val).bigtext({
				minfontsize: 24
			});
			if (!$(val).parent().hasClass('blocks-animation') && !$(val).hasClass('animate_when_almost_visible')) $(val).css({
				opacity: 1
			});
			requestTimeout(function() {
				if ($(val).find('.animate_when_almost_visible').length != 0) {
					$(val).css({opacity: 1});
				}
			}, 400);
		});
	};

	if ( UNCODE.wwidth > UNCODE.mediaQuery ) {
		bigTextLaunch();
	}
	$(window).on( 'load', bigTextLaunch );
};


})(jQuery);
