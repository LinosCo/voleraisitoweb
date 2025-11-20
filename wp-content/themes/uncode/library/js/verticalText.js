(function($) {
	"use strict";

	UNCODE.verticalText = function() {
	$(window).on('menuCanvasOpen', function(){
		$('.vertical-text--fixed').fadeOut(500);
		$('.horizontal-text--fixed').fadeOut(500);
	}).on('menuCanvasClose', function(){
		$('.vertical-text--fixed').fadeIn(500);
		$('.horizontal-text--fixed').fadeIn(500);
	});

	var hideOnBottomVerticalTexts = $('.vertical-text--vis-hide-bottom');
	var showOnTopVerticalTexts = $('.vertical-text--vis-show-top');
	var hideOnBottomHorizontalTexts = $('.horizontal-text--vis-hide-bottom');
	var showOnTopHorizontalTexts = $('.horizontal-text--vis-show-top');

	if (hideOnBottomVerticalTexts.length > 0 || showOnTopVerticalTexts.length > 0 || hideOnBottomHorizontalTexts.length > 0 || showOnTopHorizontalTexts.length > 0) {
		window.addEventListener('scroll', function(e) {
			var totalPageHeight = document.body.scrollHeight;
			var scrollPoint = window.scrollY + window.innerHeight;

			if (window.scrollY > 0) {
				showOnTopVerticalTexts.fadeOut();
				showOnTopHorizontalTexts.fadeOut();
			} else {
				showOnTopVerticalTexts.fadeIn();
				showOnTopHorizontalTexts.fadeIn();
			}

			if (scrollPoint >= totalPageHeight) {
				hideOnBottomVerticalTexts.fadeOut();
				hideOnBottomHorizontalTexts.fadeOut();
			} else {
				hideOnBottomVerticalTexts.fadeIn();
				hideOnBottomHorizontalTexts.fadeIn();
			}
		}, false);
	}
};


})(jQuery);
