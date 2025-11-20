!function($) {
	"use strict";
	window.fixallInputs = function() {
		var settingsCheckBoxes = window.parent.jQuery('.wpb-toggle-wrapper:not(.checkbox_converted)');

		$('.wpb_el_type_checkbox:not(.checkbox_converted)').add(settingsCheckBoxes).each(function(index) {
			var $checkboxCont = $(this),
				$checkbox = $(this).find('input'),
				vals = new Array();
			$(this).addClass('checkbox_converted');
			if ($checkbox.length == 1) {
				$checkboxCont.addClass('uncode-checkbox');
				if ( ! $checkbox.closest('.edit_form_line').length ) {
					$checkbox.wrap('<div class="edit_form_line" />');
				}
				$checkbox.wrap('<div class="on-off-switch" />');
				if ($checkbox.hasClass('row_height_use_pixel') || $checkbox.hasClass('media_width_use_pixel') || $checkbox.hasClass('column_width_use_pixel')) {
					vals[0] = 'px';
					vals[1] = '%';
				} else if ($checkbox.is('[class*="_h_use_pixel"]')) {
					vals[0] = '%';
					vals[1] = 'px';
				} else if ($checkbox.hasClass('unlock_row')) {
					vals[0] = 'Full';
					vals[1] = 'Limit';
				} else if ($checkbox.hasClass('unlock_row_content')) {
					vals[0] = 'Full';
					vals[1] = 'Limit';
				} else if ($checkbox.hasClass('desktop_visibility') || $checkbox.hasClass('medium_visibility') || $checkbox.hasClass('mobile_visibility') || $checkbox.closest('.device_visibility').length || $checkboxCont.hasClass('inverted-checkbox')) {
					vals[0] = 'No';
					vals[1] = 'Yes';
				} else {
					vals[0] = 'Yes';
					vals[1] = 'No';
				}
				$checkbox.on('change', function() {
					if ($(this).is(':checked')) $(this).attr('checked', true);
					else $(this).removeAttr('checked');
				});
				$('<span class="slide-button"></span><label class="on-off-switch-label"><span class="on-off-switch-inner">' + vals[0] + '</span><span class="on-off-switch-inner">' + vals[1] + '</span></label>').insertAfter($checkbox);
			}
		});

		var settingsSelect = window.parent.jQuery('.vc_ui-panel-content .edit_form_line, #vc_settings-post_status');
		$('.wpb_el_type_widgetised_sidebars, .wpb_el_type_dropdown').add(settingsSelect).find('select:not(.icon-category-select):not(.vc-iconpicker)').each(function(index) {
			var $select = $(this),
				$wrapper = $select.closest('.select-wrapper').addClass('select-uncode-colors');
			if ( ! $(this).closest('.edit_form_line').length ) {
				$select.wrap('<div class="edit_form_line" />');
			}
			if ($(this).is('[name$=_color]') && !$(this).hasClass('easy-drop-color') ) {
				if (window.navigator.userAgent.indexOf("Windows NT 10.0") == -1) {
					$(this).addClass('easy-drop-color');
					$(this).easyDropDown({
						cutOff: 10,
					});
				}
			} else {
				if ( ! $select.closest('.select-wrapper').length ) {
					$select.wrap('<div class="select-wrapper" />');
				}
			}
		});

		window.initAllSliders();

		function sanitizeSlug(element) {
			var el = $(element),
			elValue = el.val(),
			elParent = el.closest('.wpb_el_type_textfield'),
			elParentSection = el.closest('.vc_edit-form-tab'),
			elLabel = elParent.find('.wpb_element_label'),
			elLabelSpan = elLabel.find('.section-slug'),
			checkSlug = $('input[name="row_custom_slug_check"]', elParentSection),
			slugEl = $('input[name="row_custom_slug"]', elParentSection),
			customVal = slugEl.val();
			if (elValue != '' && ( checkSlug.prop('checked') !== true || customVal == '' ) ) {
				elValue = elValue.toLowerCase().replace(/ /g, "-");
				if (!elLabelSpan.length) elLabel.append('<span class="section-slug-wrap"><span>Slug:</span><span class="section-slug">#'+elValue+'</span></span>');
				else {
					elLabelSpan.html('#'+elValue);
				}
			}
		}
		$('input[name="row_name"]').each(function(index, value) {
			sanitizeSlug(value);
			$(value).on('change input paste', function(e) {
				sanitizeSlug(e.target);
			});
		});
		function sanitizeCustomSlug(element) {
			var el = $(element),
			elParentSection = el.closest('.vc_edit-form-tab'),
			defaultEl = $('input[name="row_name"]', elParentSection),
			elParent = defaultEl.closest('.wpb_el_type_textfield'),
			elLabel = elParent.find('.wpb_element_label'),
			elLabelSpan = elLabel.find('.section-slug'),
			checkSlug = $('input[name="row_custom_slug_check"]', elParentSection),
			elValue = el.val();
			if (elValue != '' ) {
				elValue = elValue.toLowerCase().replace(/ /g, "-");
				if (!elLabelSpan.length) elLabel.append('<span class="section-slug-wrap"><span>Slug:</span><span class="section-slug">#'+elValue+'</span></span>');
				else {
					elLabelSpan.html('#'+elValue);
				}
			}
		}
		$('input[name="row_custom_slug"]').each(function(index, value) {
			sanitizeSlug(value);
			$(value).on('change input paste', function(e) {
				sanitizeCustomSlug(e.target);
			});
		});
	}

	window.initAllSliders = function() {
		var sliders = $(".vc_ui-panel-content-container .ot-numeric-slider:not(.ui-slider), #uncode_items_container .ot-numeric-slider, #uncode_matrix_items_container .ot-numeric-slider");
		sliders.each(function(i) {
			var slider = $(sliders[i]);
			slider.empty().slider({
				value: (slider.attr("data-value") != '') ? parseInt(slider.attr("data-value")) : 0,
				range: "min",
				step: parseInt(slider.attr("data-step")),
				min: parseInt(slider.attr("data-min")),
				max: parseInt(slider.attr("data-max")),
				slide: function(event, ui) {
					window.fixallInputs.refreshValue(ui.value, $(this))
				},
				stop: function(event, ui) {
					window.fixallInputs.refreshValue(ui.value, $(this))
				},
				change: function(event, ui) {
					window.fixallInputs.refreshValue(ui.value, $(this));
					$(this).attr("data-value", ui.value);
				},
				create: function(event, ui) {
					window.fixallInputs.refreshValue($(this).attr("data-value"), $(this))
				}
			});
		});
	};

	window.fixallInputs.refreshValue = function($value, $el) {
		var $input = $el.closest(".ot-numeric-slider-wrap").find("input"),
			$marker = $el.closest(".vc_shortcode-param").find(".numeric-slider-helper-input");
		$input.val($value).change();
		if ($value == 0) {
			if ($input.hasClass("row_height_percent") || $input.hasClass("row_inner_height_percent") || $input.hasClass("row_width") || $input.hasClass("animation_offset_bottom")) {
				$marker.html("Auto");
			} else if ($input.hasClass("border_width")) {
				$marker.html("Inherit");
			} else if ($input.is('[class*="gutter_size"]')) {
				$marker.html("0");
			} else if ($input.hasClass("empty_h")) {
				$marker.html('0.25x');
			} else if ($input.hasClass("linear_speed") || $input.hasClass("marquee_speed") || $input.hasClass("marquee_speed_alt")) {
				$marker.html('default');
			} else $marker.html($value);
		} else if ($value == parseInt($el.attr("data-max"))) {
			if ($input.hasClass("medium_width") || $input.hasClass("mobile_width")) {
				$marker.html('12/12');
			} else if ($input.hasClass("row_height_percent") || $input.hasClass("row_width")) {
				$marker.html("Full");
			} else if ($input.is('[class*="gutter_simple"]') || $input.is('[class*="gutter_tab"]')) {
				$marker.html("2x");
			} else if ($input.is('[class*="gutter_size"]')) {
				if ($value == 6) $marker.html('4x');
				else $marker.html("2x");
			} else if ($input.is('[class*="gutter_thumb"]')) {
				$marker.html('1x');
			} else if ($input.hasClass("top_padding") || $input.hasClass("bottom_padding") || $input.hasClass("h_padding") || $input.hasClass("zoom_width") || $input.hasClass("zoom_height") || $input.hasClass("off_grid_val") ) {
				$marker.html('6x');
			} else if ($input.hasClass("column_padding") || $input.hasClass("single_padding") || $input.hasClass("media_padding") || $input.hasClass("empty_h") || $input.hasClass("shift_x") || $input.hasClass("shift_y") || $input.hasClass("shift_y_down") || $input.hasClass("carousel_dot_padding") || $input.hasClass("vertical_text_h_pos") || $input.hasClass("vertical_text_v_pos") || $input.hasClass("horizontal_text_h_pos") || $input.hasClass("horizontal_text_v_pos") || $input.hasClass("tab_gap") || $input.closest(".h_dot_padding").length /*|| $input.hasClass("marquee_speed") || $input.hasClass("marquee_speed_alt")*/) {
				$marker.html('4x');
			}  else if ($input.closest(".slide_rhythm").length) {
				$marker.html('2x');
			} else $marker.html($value);
		} else {
			if ($input.hasClass("medium_width") || $input.hasClass("mobile_width")) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('2/12');
						break;
					case 2:
						$marker.html('3/12');
						break;
					case 3:
						$marker.html('4/12');
						break;
					case 4:
						$marker.html('6/12');
						break;
					case 5:
						$marker.html('8/12');
						break;
					case 6:
						$marker.html('9/12');
						break;
				}
			} else if ($input.is('[class*="gutter_thumb"]')) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('1px');
						break;
					case 2:
						$marker.html('0.25x');
						break;
					case 3:
						$marker.html('0.5x');
						break;
					case 4:
						$marker.html('1x');
						break;
				}
			} else if ($input.is('[class*="gutter_tab"]')) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('0.5x');
						break;
					case 2:
						$marker.html('1x');
						break;
					case 3:
						$marker.html('2x');
						break;
				}
			} else if ($input.is('[class*="gutter_simple"]')) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('1x');
						break;
					case 2:
						$marker.html('2x');
						break;
				}
			} else if ($input.is('[class*="gutter_size"]')) {
				switch (parseInt($value)) {
					case 1:
					case 50:
						$marker.html('1px');
						break;
					case 2:
						$marker.html('0.5x');
						break;
					case 3:
						$marker.html('1x');
						break;
					case 4:
						$marker.html('2x');
						break;
					case 5:
						$marker.html('3x');
						break;
					case 6:
						$marker.html('3x');
						break;
					case 7:
						$marker.html('3x');
						break;
				}
			} else if ($input.hasClass("off_grid_val") || $input.hasClass("tab_gap")) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('0.5x');
						break;
					case 2:
						$marker.html('1x');
						break;
					case 3:
						$marker.html('2x');
						break;
					case 4:
						$marker.html('3x');
						break;
					case 5:
						$marker.html('4x');
						break;
					case 6:
						$marker.html('5x');
						break;
					case 7:
						$marker.html('6x');
						break;
				}
			} else if ($input.hasClass("vertical_text_h_pos") || $input.hasClass("vertical_text_v_pos") || $input.hasClass("horizontal_text_h_pos") || $input.hasClass("horizontal_text_v_pos") /*|| $input.hasClass("marquee_speed") || $input.hasClass("marquee_speed_alt")*/) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('0.5x');
						break;
					case 2:
						$marker.html('1x');
						break;
					case 3:
						$marker.html('2x');
						break;
					case 4:
						$marker.html('3x');
						break;
					case 5:
						$marker.html('4x');
						break;
					case -1:
						$marker.html('-0.5x');
						break;
					case -2:
						$marker.html('-1x');
						break;
					case -3:
						$marker.html('-2x');
						break;
					case -4:
						$marker.html('-3x');
						break;
					case -5:
						$marker.html('-4x');
						break;
				}
			} else if ($input.hasClass("empty_h") || $input.hasClass("single_padding") || $input.hasClass("media_padding") || $input.hasClass("shift_x") || $input.hasClass("shift_y") || $input.hasClass("shift_y_down") || $input.hasClass("zoom_width") || $input.hasClass("zoom_height") || $input.hasClass("carousel_dot_padding") || $input.closest(".h_dot_padding").length || $input.closest(".slide_rhythm").length ) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('0.5x');
						break;
					case 2:
						$marker.html('1x');
						break;
					case 3:
						$marker.html('2x');
						break;
					case 4:
						$marker.html('3x');
						break;
					case -1:
						$marker.html('-0.5x');
						break;
					case -2:
						$marker.html('-1x');
						break;
					case -3:
						$marker.html('-2x');
						break;
					case -4:
						$marker.html('-3x');
						break;
					case -5:
						$marker.html('-4x');
						break;
				}
			} else if ($input.hasClass("top_padding") || $input.hasClass("bottom_padding") || $input.hasClass("column_padding") || $input.hasClass("h_padding")) {
				switch (parseInt($value)) {
					case 1:
						$marker.html('1px');
						break;
					case 2:
						$marker.html('1x');
						break;
					case 3:
						$marker.html('2x');
						break;
					case 4:
						$marker.html('3x');
						break;
					case 5:
						$marker.html('4x');
						break;
					case 6:
						$marker.html('5x');
						break;
				}
			} else $marker.html($value);
		}
	}



	// Change URL on edit button (CB)
	$(document).on('click', '.cb-edit-button', function () {
		var _button = $(this);
		var dropdown = _button.closest('.edit_form_line').find('select');
		var selected_value = parseInt(dropdown.val(), 10);
		var edit_url = _button.attr('data-url');

		if (window.vc_mode === 'admin_frontend_editor') {
			edit_url = edit_url + 'vc_action=vc_inline&post_id=' + selected_value + '&post_type=uncodeblock';
		} else {
			edit_url = edit_url + 'post=' + selected_value + '&action=edit';
		}

		_button.attr('href', edit_url);
	});

	// Show/hide edit buttons (CF7)
	$(document).on('change', '.wpb-select.id', function () {
		var _this = $(this);
		var edit_button = _this.closest('.edit_form_line').find('a.backend-edit-button');

		if (edit_button.length > 0) {
			var selected_value = parseInt(_this.val(), 10);
			var edit_url = edit_button.attr('data-url');

			if (edit_button.hasClass('cf7-edit-button')) {
				if (selected_value > 0) {
					edit_url = edit_url + 'page=wpcf7&post=' + selected_value + '&action=edit';
					edit_button.removeClass('disabled').attr('href', edit_url);
				} else {
					edit_button.addClass('disabled').attr('href', '');
				}
			}
		}
	});

	// Show/hide pagination fields
	window.uncode_index_show_hide_filter_pagination = function() {
		var pagination_fields = $('#vc_edit-form-tab-1 .pagination-field');
		var load_more_fields = $('#vc_edit-form-tab-1 .load-more-field');
		var has_filter_checked = false;

		var tax_type = $('.loop_params_holder select[name="taxonomy_query"]').val();

		if (tax_type && tax_type !== '') {
			pagination_fields.hide();
			return;
		}

		if ($('#show_woo_sorting-yes').prop('checked') || $('#show_widgetized_content_block-yes').prop('checked')) {
			has_filter_checked = true;
		}

		if (!$('#filtering-yes').prop('checked') || !$('#show_extra_filters-yes').prop('checked')) {
			has_filter_checked = false;
		}

		if (has_filter_checked === true) {
			load_more_fields.hide();
			$(document).trigger('uncode_index_hide_filter_pagination');
		} else {
			load_more_fields.show();
			$(document).trigger('uncode_index_show_filter_pagination');
		}
	};

	$(document).on('click', '#show_woo_sorting-yes, #show_widgetized_content_block-yes, #filtering-yes, #show_extra_filters-yes', function () {
		window.uncode_index_show_hide_filter_pagination();
	});

	// Show/hide color changer background checkbox
    window.uncode_check_flat_color = function() {
    	var model = this,
    		$content = model.$content,
    		params = model.currentModelParams,
    		back_color_type = params.back_color_type,
    		$check_changer_color = $content.find('[data-vc-shortcode-param-name="changer_back_color"]'),
    		$palette_selector = $content.find('[data-vc-shortcode-param-name="back_color"] select'),
    		$color_selectors = $content.find('[data-vc-shortcode-param-name="back_color_type"] .advanced-color-selector'),
    		$color_selector = $('> span', $color_selectors),
    		$back_color_type = $content.find('.uncode-advanced-color-selector-input'),
    		flat_colors = SiteParameters.uncode_colors_flat_array;

    	$color_selector.on('click', function(){
    		var $this = $(this),
    			dataColor = $this.attr('data-color-type');

    		if ( dataColor === 'uncode-solid' ) {
    			$check_changer_color.show();
    		} else if ( dataColor === 'uncode-palette' ) {
    			$palette_selector.on('change', function(){
    				var palette_val = $('option:selected', this).val();
    				if ( flat_colors.indexOf(palette_val) != -1 ) {
		    			$check_changer_color.show();
    				} else {
		    			$check_changer_color.hide();
    				}
    			}).trigger('change');
    		} else {
    			$check_changer_color.hide();
    		}

    	});

    	if ( typeof back_color_type !== 'undefined' && back_color_type !== '' ) {
    		$color_selectors.find('[data-color-type="' + back_color_type + '"]').trigger('click');
    	}

    };

    window.uncode_hide_flip_from_hor_el = function() {
    	var layout = $('.fixed-text-layout').find('select');

    	if (layout.val() === 'horizontal') {
			$('div[data-vc-shortcode-param-name="flip"]').hide();
		} else {
			$('div[data-vc-shortcode-param-name="flip"]').show();
		}
    }


    $(document).on('change', '.fixed-text-layout select', function () {
		window.uncode_hide_flip_from_hor_el();
	});

	window.uncode_hide_animation_seq_from_css_grid = function() {
		var select_css_animation = $('select.single_css_animation').val();
		if (select_css_animation && select_css_animation !== 'parallax') {
			$('div[data-vc-shortcode-param-name="single_animation_sequential"]').show();
		} else {
			$('div[data-vc-shortcode-param-name="single_animation_sequential"]').hide();
		}
	}

	$(document).on('change', 'select.single_css_animation', function () {
		window.uncode_hide_animation_seq_from_css_grid();
	});

	$(document).on('ajaxSend', function () {
		if ( !$('#vc_ui-panel-edit-element .wpb_edit_form_elements').length ) {
			$('#vc_ui-panel-edit-element').removeClass('vc-panel-shown');
		}
	});

	$('#vc_ui-panel-edit-element').on('vcPanel.shown', function(){
		$(this).addClass('vc-panel-shown');

		var $ul = $(this).find('[data-vc-ui-element="panel-tabs-controls"]');

		setTimeout(function(){
			$ul.vcTabsLine("refresh");
			$ul.vcTabsLine("moveTabs");
		}, 50);

		$('.vc_sorted-list-container').on( "sortstop", function( event, ui ) {
			var $list = $(this),
				$parent = $list.closest('.vc_sorted-list'),
				$input = $('.sorted_list_field', $parent);
			
			$input.change();
		});

	})


}(window.jQuery);
