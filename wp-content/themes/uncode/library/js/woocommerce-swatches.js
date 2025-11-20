(function($) {
	"use strict";

	function find_select(variation_form, id) {
		var selects = variation_form.find('select');
		var select = false;

		selects.each(function() {
			var _this = $(this);

			if (_this.attr('id').toLowerCase() == encodeURIComponent(id).toLowerCase()) {
				select = _this;
				return true;
			}
		});

		return select;
	}

	function find_swatch(swatch_selector, value) {
		var swatches = swatch_selector.find('.swatch');
		var swatch = false;

		swatches.each(function() {
			var _this = $(this);

			if (_this.attr('data-swatch-value') == value) {
				swatch = _this;
				return true;
			}
		});

		return swatch;
	}

	function init_general_swatches() {
		var variation_forms = $('.variations_form');

		variation_forms.each(function() {
			var variation_form = $(this);

			if (variation_form.data('swatches')) {
				return;
			}

			variation_form.data('swatches', true);

			variation_form.on('click', '.swatches-select > .swatch', function() {
				var _this = $(this);
				var value = _this.data('swatch-value');
				var id = _this.parent().data('swatch-id');
				var title = _this.data('swatch-title');

				if (variation_form.hasClass('is-updating-gallery')) {
					return;
				}

				reset_general_swatches(variation_form);

				if (_this.hasClass('swatch--active')) {
					return;
				}

				if (_this.hasClass('swatch--disabled')) {
					return;
				}

				if (window.UncodeWCParameters != undefined && window.UncodeWCParameters.swatches_use_custom_find === '1') {
					var select = find_select(variation_form, id);
					select.val(value).trigger('change');
				} else {
					variation_form.find('select#' + id).val(value).trigger('change');
				}

				_this.parent().find('.swatch--active').removeClass('swatch--active');
				_this.addClass('swatch--active');
				reset_general_swatches(variation_form);
			})
			.on('woocommerce_update_variation_values', function() {
				reset_general_swatches(variation_form);
			})
			.on('click', '.reset_variations', function() {
				variation_form.find('.swatch--active').removeClass('swatch--active');
			})
		});
	}

	function reset_general_swatches(variation_form) {
		if (variation_form.data('product_variations') === false) {
			return;
		}

		var has_hidden_swatch = false;

		variation_form.find('.variations select').each(function() {
			var select = $(this);
			var swatch_selector = select.parent().find('.swatches-select');
			var options = select.html();

			options = $(options);

			swatch_selector.find('> .swatch').removeClass('swatch--enabled').addClass('swatch--disabled');

			options.each(function() {
				var value = $(this).val();

				if ($(this).hasClass('enabled')) {
					if (window.UncodeWCParameters != undefined && window.UncodeWCParameters.swatches_use_custom_find === '1') {
						var swatch = find_swatch(swatch_selector, value);
						if (swatch) {
							swatch.removeClass('swatch--disabled').addClass('swatch--enabled');
						}
					} else {
						swatch_selector.find('.swatch[data-swatch-value="' + value + '"]').removeClass('swatch--disabled').addClass('swatch--enabled');
					}
				} else {
					if (window.UncodeWCParameters != undefined && window.UncodeWCParameters.swatches_use_custom_find === '1') {
						var swatch = find_swatch(swatch_selector, value);
						if (swatch) {
							swatch.removeClass('swatch--disabled').addClass('swatch--enabled');
						}
					} else {
						swatch_selector.find('.swatch[data-swatch-value="' + value + '"]').addClass('swatch--disabled').removeClass('swatch--enabled');
					}
				}
			});

			var hidden_swatches = swatch_selector.find('> .swatch--active.hidden');

			if (hidden_swatches.length > 0) {
				hidden_swatches.remove();
				has_hidden_swatch = true;
			}
		});

		if (has_hidden_swatch) {
			$('.swatch--active').removeClass('swatch--active');
		}
	}

	function init_more_swacthes_link() {
		var more_link = $('.swatches-more-link');

		more_link.on('click', function() {
			var link = $(this).data('link');

			if (link) {
				window.location = link;
			}
		});
	}

	init_more_swacthes_link();
	init_general_swatches();

	$(document).on('uncode-quick-view-loaded more-items-loaded', function() {
		init_more_swacthes_link();
		init_general_swatches();
	});
})(jQuery);
