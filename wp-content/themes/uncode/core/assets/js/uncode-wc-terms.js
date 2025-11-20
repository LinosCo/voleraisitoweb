(function($) {
	"use strict";

	function init_term_color() {
		var colors = $('.product_attribute_color');

		if (colors.length <= 0) {
			return;
		}

		colors.each(function() {
			$(this).wpColorPicker();
		});
	}

	init_term_color();

	function init_image_size_select() {
		var type_select = $('#attribute_type');
		var image_size_select = $('#swatch_thumbnail_size').closest('.form-field');

		if (type_select.val() === 'image') {
			image_size_select.show();
		} else {
			image_size_select.hide();
		}

		type_select.on('change', function() {
			if ($(this).val() === 'image') {
				image_size_select.show();
			} else {
				image_size_select.hide();
			}
		});
	}

	init_image_size_select();
})(jQuery);
