!function($) {
	/*
	 * Close other color pickers when clicking outside the "select"
	 */
	$('.vc_ui-panel').on('click resize drag', function(e) {
		if (e.type !== 'resize') {
			var selectWrapper = $(e.target).closest('.advanced-colorpicker-select');
		}

		$('.vc_ui-panel').find('.advanced-colorpicker-select').removeClass('active');

		// add active class to clicked element
		if (e.type !== 'resize' && selectWrapper.length !== 0) {
			selectWrapper.addClass('active');
		}

		var notActiveSelects = $('.vc_ui-panel').find('.advanced-colorpicker-select').not('.active');

		// hide no-active color pickers
		notActiveSelects.each(function() {
			var _this = $(this);
			var headers = _this.find('.advanced-colorpicker-select__header');

			headers.each(function() {
				var _header = $(this);

				if (_header.hasClass('advanced-colorpicker-select__header--open')) {
					var wrapper = _header.closest('.advanced-colorpicker-select');
					var content = wrapper.find('.advanced-colorpicker-select__content');
					var input = wrapper.find('.advanced-colorpicker-input');

					// slide up
					_header.removeClass('advanced-colorpicker-select__header--open');
					content.stop().slideUp('fast');

					// set preview
					window.uncode_set_advancedcolor_preview(wrapper, input);
				}
			});
		});
	});

	/*
	 * Show only the selected color picker
	 */
	var initColorPicker = function(el, initialize) {
		var selectedColorType = el.find('.uncode-advanced-color-selector-input').val();
		var colorTypes = el.find('.advanced-colorpicker-container');

		colorTypes.hide();
		el.find("[data-advanced-color-type='" + selectedColorType + "']").show();

		if (initialize) {
			// Solid color pickers
			var solidPickerInput = el.find('.advanced-colorpicker-input--solid');
			if (!solidPickerInput.hasClass('wp-color-picker')) {
				OT_UI.bind_colorpicker(solidPickerInput.attr('id'));
			}
		}
	};

	$('.advanced-color-wrapper').each(function() {
		initColorPicker($(this), true);
	});

	// show/hide again when changing a vc dependent field
	$('.advanced-color-wrapper').find('input.uncode-advanced-color-selector-input').on('change.vcHookDepended', function() {
		var colorWrapper = $(this).closest('.advanced-color-wrapper');
		initColorPicker(colorWrapper);
	})

	// show/hide again when showing post fields (post query)
	$(document).on('uncodeShowPostRelatedFields uncode_index_show_filter_pagination', function() {
		$('.advanced-color-wrapper').each(function() {
			initColorPicker($(this));
		});
	});

	/*
	 * Activate the correct color picker when clicking on icons
	 */
	$('.vc_ui-panel').on('click', '.advanced-color-selector__icon', function() {
		var _this = $(this);
		var dataColor = _this.attr('data-color-type');
		var wrapper = _this.closest('.advanced-color-wrapper');
		var colorSelector = wrapper.find('.advanced-color-selector');
		var inputSelector = wrapper.find('.uncode-advanced-color-selector-input');
		var colorTypes = wrapper.find('.advanced-colorpicker-container');
		var $tabs = _this.closest('.vc_panel-tabs');

		// toggle active icon
		colorSelector.find('.advanced-color-selector__icon').removeClass('advanced-color-selector__icon--active');
		_this.addClass('advanced-color-selector__icon--active');

		// set input value
		inputSelector.val(dataColor);

		// show/hide options
		colorTypes.hide();
		wrapper.find("[data-advanced-color-type='" + dataColor + "']").show();

		//text stroke color
		if ( _this.hasClass('advanced-color-selector__icon--solid') ) {
			$tabs.find('[data-vc-shortcode-param-name="text_stroke"]').show();
		} else {
			$tabs.find('[data-vc-shortcode-param-name="text_stroke"]').hide();
		}
	});

	/*
	 * Text stroke on loading
	 */
	$('[data-vc-shortcode="vc_custom_heading"]').each(function(){
		var $this = $(this),
			$stroke = $('[data-vc-shortcode-param-name="text_stroke"]', $this),
			$solid = $('.advanced-color-selector__icon.advanced-color-selector__icon--solid', $this);

		if ( $solid.hasClass('advanced-color-selector__icon--active') ) {
			$stroke.show();
		}

	})

	/*
	 * Toggle color picker content when clicking on its header
	 */
	$('.vc_ui-panel').off('click', '.advanced-colorpicker-select__header').on('click', '.advanced-colorpicker-select__header', function() {
		var _this = $(this);
		var wrapper = _this.closest('.advanced-colorpicker-select');
		var content = wrapper.find('.advanced-colorpicker-select__content');
		var input = wrapper.find('.advanced-colorpicker-input');
		var dataColor = _this.attr('data-color-type');

		// toggle up/down
		if (_this.hasClass('advanced-colorpicker-select__header--open')) {
			_this.removeClass('advanced-colorpicker-select__header--open')
			content.stop().slideUp('fast');

			// set color preview
			window.uncode_set_advancedcolor_preview(wrapper, input);
		} else {
			_this.addClass('advanced-colorpicker-select__header--open')
			content.stop().slideDown('fast');
		}

		// initialize color pickers
		if (dataColor === 'uncode-solid') {
			OT_UI.fix_colorpicker_color(input);
		} else if (dataColor === 'uncode-gradient') {
			var gradientID = wrapper.find('.gradient-picker').attr('id');
			OT_UI.init_gradientpicker(gradientID, 'wpb_el_type_uncode_gradientpicker');
			_this.addClass('colorpicker-gradient-initialized');
		}
	});

	/*
	 * Set selected color preview
	 */
	window.uncode_set_advancedcolor_preview = function(wrapper, input) {
		var val = input.val();
		var preview = wrapper.find('.advanced-colorpicker-select__preview');
		var isSolidColor = input.hasClass('advanced-colorpicker-input--solid') ? true : false;

		if (val) {
			var previewText = wrapper.find('.advanced-colorpicker-select__text');
			var previewSelectedText = previewText.data('selected-text');

			if (isSolidColor) {
				preview.show().css('background', val);
				previewText.html(previewSelectedText + ' : ' + '<small>' + val + '</small>');
			} else {
				var gradientValue = JSON.parse(val);

				if (gradientValue.sliders.length > 0) {
					preview.show().attr('style', gradientValue.css);
					previewText.html(previewSelectedText + ' : ' + '<small>' + gradientValue.type + ' - ' + gradientValue.direction + '</small>');
				} else {
					preview.attr('style', '').hide();
					wrapper.removeClass('preview-with-color');
					previewText.html(previewSelectedText);
				}
			}

			wrapper.addClass('preview-with-color');
		} else {
			var previewText = wrapper.find('.advanced-colorpicker-select__text');
			var previewSelectedText = previewText.data('default-text');

			previewText.html(previewSelectedText);
			preview.attr('style', '').hide();
			wrapper.removeClass('preview-with-color');
		}
		input.change();
	};
}(window.jQuery);
