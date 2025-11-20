(function($) {
	"use strict";

	UNCODE.countdowns = function() {
	var $countdowns = $('[data-uncode-countdown]:not(.counter-init)');
	$countdowns.each(function() {
		var $this = $(this).addClass('counter-init'),
			finalDate = $(this).data('uncode-countdown');
		$this.countdown(finalDate, function(event) {
			$this.html(event.strftime('<span>%D <small>' + SiteParameters.days + '</small></span> <span>%H <small>' + SiteParameters.hours + '</small></span> <span>%M <small>' + SiteParameters.minutes + '</small></span> <span>%S <small>' + SiteParameters.seconds + '</small></span>'));
		});
	});
};


})(jQuery);
