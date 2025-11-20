(function($) {
	"use strict";

	UNCODE.particles = function() {
	$(".vc-particles-background").each(function() {
		var $particle = $(this);
		var $parent = $particle.closest('[data-parent]');

		$parent.prepend($particle);
		// $(window).trigger('resize');
	})
};



})(jQuery);
