(function($) {
	"use strict";

	UNCODE.stickyElements = function() {
	var isMobile_wide = UNCODE.isMobile && UNCODE.wwidth < 1024;
	if (!isMobile_wide ) {

		var $pageHeader = $('#page-header'),
			$headerRow = $('.vc_row', $pageHeader),
			$headerSection = $headerRow.closest('section[data-parent]'),
			startSticky = false;

		if ( $headerRow.hasClass('sticky-element') && !$headerSection.length ) {
			$headerRow.removeClass('sticky-element');
			$pageHeader.addClass('sticky-element');
			startSticky = true;
		}

		var calculateOffset = function(el) {
			var getRowPadding = (!$(el).hasClass('with-bg')) ? $(el).closest('.row-parent').css("padding-top") : 0,
				sideOffset = (getRowPadding != undefined && getRowPadding != 0) ? parseInt(getRowPadding.replace("px", "")) : 0,
				shrink = typeof $('.navbar-brand').data('padding-shrink') !== 'undefined' ?  $('.navbar-brand').data('padding-shrink')*2 : 0,
				elTop = window.pageYOffset + el.getBoundingClientRect().top;

			sideOffset += UNCODE.bodyBorder;

			if (UNCODE.adminBarHeight > 0) sideOffset += UNCODE.adminBarHeight;
			if ($('.menu-sticky .menu-container:not(.menu-hide)').length && elTop > sideOffset) {
				if ($('.menu-shrink').length) {
					sideOffset += parseFloat( $('.navbar-brand').data('minheight') ) + shrink;
				} else {
					sideOffset += ($('body.hmenu-center').length ? $('#masthead .menu-container').outerHeight() : parseInt(UNCODE.menuMobileHeight));
				}
			}

			return sideOffset;

		},

		initStickyElement = function($els) {
			if ( $('body').hasClass('vc-safe-mode') ) {
				return true;
			}
			if ( typeof $els === 'undefined' ) {
				$els = $('.sticky-element');
			}
			$.each($els, function(index, element) {
				if ($(element).closest('.tab-pane').length) {
					var $paneParent = $(element).closest('.tab-pane');
					if ( !$paneParent.hasClass('active') ) {
						return true;
					}
				}
				$(element).stick_in_parent({
					sticky_class: 'is_stucked',
					offset_top: calculateOffset(element),
					bottoming: true,
					inner_scrolling: SiteParameters.sticky_elements === 'on'
				});
			});
		};

		var oldW = UNCODE.wwidth,
			oldH = UNCODE.wHeight;

		requestTimeout(function() {
			if ($('.sticky-element').length) {

				if ($(window).width() > UNCODE.mediaQuery) {
					initStickyElement();

					if ( startSticky === true ) {
						$('#page-header').trigger('sticky_kit:recalc');
					}
				}

				$(window).on('resize lateral_resize', function(event) {
					if ( oldW !== UNCODE.wwidth || oldH !== UNCODE.wHeight ) {
						$(".sticky-element").trigger("sticky_kit:detach");
						if ($(window).width() > UNCODE.mediaQuery) {
							initStickyElement();
						}
						oldW = UNCODE.wwidth;
						oldH = UNCODE.wHeight;
					}
				});
			}
		}, 1000);

		if ($('.sticky-element').length) {
			$(window).on('uncode_wc_variation_gallery_loaded', function (event) {
				requestTimeout(function() {
					$(document.body).trigger("sticky_kit:recalc");
				}, 100);
			});
		}

		var $panels = $('.panel-collapse');
		if ( $panels.length ) {
			$panels.each(function(){
				var $panel = $(this);
				$panel.on('shown.bs.collapse hidden.bs.collapse', function(){
					$(document.body).trigger("sticky_kit:recalc");
				});
			});
		}

		$('.nav-tabs a').on('shown.bs.tab', function(e){
			var $tabs = $(e.target).closest('.tab-container'),
				$panel = $('.tab-pane.active', $tabs),
				$els = $(e.target).nextAll(".sticky-element");

			$els.trigger("sticky_kit:detach");
			initStickyElement($els);
		});

		$(window).on('vc-safe-mode-on', function(){
			$(".sticky-element").trigger("sticky_kit:detach");
		});

		$(window).on('vc-safe-mode-off', function(){
			initStickyElement();
		});
	}
};


})(jQuery);
