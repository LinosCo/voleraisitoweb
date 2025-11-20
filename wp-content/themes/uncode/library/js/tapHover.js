(function($) {
	"use strict";

	UNCODE.tapHover = function() {

	var $el = $('html.touch .tmb:not(.tmb-no-double-tap)').find('.t-entry-visual-cont > a, .drop-hover-link'), //.length //html.touch a.btn
		elClass = "hover";

	$(window).on('click', function() {
		$el.removeClass(elClass);
	});

	$el.on("click", function(e) { // cambia click con touch start 'touchstart'
		e.stopPropagation();
		var link = $(this);
		if ( ! link.hasClass(elClass)) {
			e.preventDefault();
			link.addClass("hover");
			$el.not(this).removeClass(elClass);
			return false;
		}
	});
};


})(jQuery);
