(function($) {
	"use strict";

	UNCODE.widgets = function() {
	var widget_collapses = $('.widget-collapse');

	widget_collapses.each(function(){
		var widget_collapse = $(this),
			widget_title = widget_collapse.find('.widget-title'),
			widget = widget_title.closest('.widget'),
			content = widget.children().not('.widget-title'),
			setCTA;

		if ( widget_collapse.hasClass( 'widget-tablet-collapse-open' ) && UNCODE.wwidth <= UNCODE.mediaQuery && UNCODE.wwidth > UNCODE.mediaQueryMobile ) {
			widget_title.toggleClass('open');
		}

		widget_title.each(function() {
			var _this = $(this);
			var content = _this.closest('.widget').find('.widget-collapse-content');

			$(window).on('load resize', function(){
				clearRequestTimeout(setCTA);
				setCTA = requestTimeout( function() {
					if ( content.is(':visible') ) {
						_this.addClass( 'open' );
					} else {
						_this.removeClass( 'open' );
					}
				}, 10 );
			})

			_this.on( 'click', function(){

				// Get content of :after element (+ icon) to check the visibility
				var icon_content = window.getComputedStyle(_this[0], ':after').getPropertyValue('content');

				if (icon_content === 'none' || !icon_content) {
					return false;
				}

				_this.toggleClass('open');
				var isOpen = _this.hasClass('open'),
					hasBorder = _this.closest('.widget-no-separator').length ? 9 : 27;
				content.animate({
					height: 'toggle',
					padding: 'toggle',
					opacity: 'toggle',
					top: isOpen ? 0 : hasBorder
				}, {
					duration: 400,
					easing: "easeInOutCirc",
				});

				return false;

			});
		});
	});

	var $widgets_without_title = $('.collapse-init').removeClass('collapse-init');
};


})(jQuery);
