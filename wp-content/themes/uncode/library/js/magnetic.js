(function($) {
	"use strict";

	UNCODE.magneticCursor = function(){
	function magneticCursor($wrap){
		$wrap = typeof $wrap === 'undefined' ? $('body') : $wrap;
		var $magnetics = $wrap.find('.tmb-image-anim-magnetic .t-entry-visual').has('img:not(.avatar), .t-background-cover, .dummy.secondary-dummy-image, .t-secondary-background-cover').add($('.magnetic').has('.background-inner, .header-bg'));

		$magnetics.on('mousemove', function(e){
			var $this = $(this),
				$el,
				bound = e.currentTarget.getBoundingClientRect(),
				coeff = 30,
				hor = (bound.width / 2) - (e.clientX - bound.left),
				ver = (bound.height / 2) - (e.clientY - bound.top),
				toX = hor / bound.width * coeff,
				toY = ver / bound.height * coeff,
				scaleX = ((bound.width + coeff + 5) / bound.width).toFixed(2),
				scaleY = ((bound.height + coeff + 5) / bound.height).toFixed(2),
				toScale = Math.max(scaleX, scaleY);

			if ( $this.hasClass('magnetic') ) {
				$el = $('.background-inner, .header-bg', $this);
			} else {
				$el = $('img:not(.avatar), .t-background-cover, .fluid-object, .dummy.secondary-dummy-image, .t-secondary-background-cover', $this);
			}

			gsap.killTweensOf($el);
			gsap.to( $el, {
				duration: 0.75,
				x: toX,
				y: toY,
				scale: toScale,
				ease: Power1.easeOut,
				transformPerspective: 900,
				transformOrigin: 'center',
				force3D: true
			});
		}).on('mouseout', function(e){
			var $this = $(this),
				$el
			if ( $this.hasClass('magnetic') ) {
				$el = $('.background-inner, .header-bg', $this);
			} else {
				$el = $('img:not(.avatar), .t-background-cover, .fluid-object, .dummy.secondary-dummy-image, .t-secondary-background-cover', $this);
			}
			gsap.killTweensOf($el);
			gsap.to( $el, {
				duration: 0.6,
				y: 0,
				x: 0,
				scale: 1,
				ease: Power1.easeOut,
				transformPerspective: 900,
				transformOrigin: 'center',
				force3D: true
			});
		});
	};

	$(window).on('load uncode-custom-cursor uncode-quick-view-loaded', function(event) {
		magneticCursor();
	});

	$(document).ajaxComplete(function( event, xhr, settings ) {
		magneticCursor();
	});

	$('.isotope-container').on('isotope-layout-complete', function() {
		var $this = $(this);
		magneticCursor($this);
	});

};


})(jQuery);
