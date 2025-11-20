(function($) {
	"use strict";

	UNCODE.filters = function() {
	var $systems = $('.isotope-system, .cssgrid-system');

	$systems.each(function(index, val){
		var $system = $(this),
			$widget_trgr = $('.uncode-woocommerce-toggle-widgetized-cb__link', $system),
			$widgets = $('.widgetized-cb-wrapper', $system),
			$sorting_trgr = $('.uncode-woocommerce-sorting__link', $system),
			$sorting_dd = $('.uncode-woocommerce-sorting-dropdown', $system),
			$cats_trigger = $('.menu-smart--filter-cats_mobile-toggle-trigger', $system),
			$cats_filters = $('.menu-smart--filter-cats-mobile-dropdown', $system);

		if ($system.hasClass('isotope-processed')) {
			return;
		}

		$cats_trigger.on('click', function(e) {
			if ( ! $('html').hasClass('screen-sm') ) {
				// $widgets.add($sorting_dd).slideUp(400);
				e.preventDefault();
				$widgets.slideUp(400, 'easeInOutCirc');
			}
		});

		$('.filters-toggle-trigger', $system).on('click', function(e) {
			e.preventDefault();
			var $filters = $('.isotope-filters .menu-horizontal', $system);
			$filters.slideToggle(400, 'easeInOutCirc');
			$widgets.add($cats_filters).slideUp(400, 'easeInOutCirc');
		});

		$widget_trgr.on('click', function(e) {
			e.preventDefault();
			$widgets.slideToggle(400, 'easeInOutCirc');
			if (!$('html').hasClass('screen-sm')) {
				$cats_filters.slideUp(400, 'easeInOutCirc');
			}
			window.dispatchEvent(new CustomEvent('boxResized'));
		});

		$sorting_trgr.on('click', function(e) {
			e.preventDefault();
			if (!$('html').hasClass('screen-sm')) {
				$widgets.add($cats_filters).slideUp(400, 'easeInOutCirc');
			}
		});

		$system.addClass('isotope-processed');
	});

};


})(jQuery);
