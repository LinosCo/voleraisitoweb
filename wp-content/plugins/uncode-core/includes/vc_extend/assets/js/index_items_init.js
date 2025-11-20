!function($) {
    "use strict";

    function getTaxType() {
		var $taxType = false;
		var $mainLoopField = $('.wpb_el_type_loop .loop_field').val();

		if ($mainLoopField) {
			var $mainLoop = $mainLoopField.split('|');

			for (var $loop in $mainLoop) {
				if ($mainLoop[$loop].indexOf('taxonomy_query:') != -1) {
					$taxType = $mainLoop[$loop];
					$taxType = $taxType.replace('taxonomy_query:', '');
				}
			}
		}

		return $taxType;
    }

    var $taxType = getTaxType();

    if ($taxType) {
    	window.showHideQueryBuilderOptions($taxType);
    }

    $(document).on('vc.display.template', function() {
    	var $taxType = getTaxType();

    	if ($taxType) {
			window.showHideQueryBuilderOptions($taxType);
		}
	});

	function showHideCSSGridOptions() {
		var layout = $('select.index_type');
		var extra_filters = $('input.show_extra_filters');

		if (layout.val() === 'css_grid') {
			var matrix_input = $('select[name="post_matrix"]');
			matrix_input.val('');
			matrix_input.closest('.vc_shortcode-param').hide();
			if (extra_filters.is(':checked')) {
				extra_filters.trigger('click');
			}
			extra_filters.closest('.vc_shortcode-param').hide();
		} else {
			$('li[data-tab-index="5"]').removeClass('single-tab-disabled');
			$('#vc_edit-form-tab-5').removeClass('single-tab-disabled');
			extra_filters.closest('.vc_shortcode-param').show();
		}
	}

	showHideCSSGridOptions();
	$('select.index_type').on('change', function() {
		showHideCSSGridOptions();
	});

	function showHideQueryBuilderMetaKeyOptions() {
		var order_by = $('.loop_params_holder select[name="order_by"]').val();

		if (order_by === 'meta_value' || order_by === 'meta_value_num') {
			$('.loop_params_holder').find('.vc_row--meta_key-field').show();
		} else {
			$('.loop_params_holder').find('.vc_row--meta_key-field').hide();
		}
	}

	 $(document).on('vc.display.template', function() {
    	showHideQueryBuilderMetaKeyOptions();
	});

	// showHideQueryBuilderMetaKeyOptions();
	$(document).on('change', '.loop_params_holder select[name="order_by"]', function() {
		showHideQueryBuilderMetaKeyOptions();
	});

    setTimeout(function() {
    	window.itemIndex();
    	window.uncode_index_show_hide_filter_pagination();
		window.showHideJustifyContent();
		window.showHideStickyInnnerRows();
    }, 1000);

	$('#vc_ui-panel-edit-element').one('vcPanel.shown', function(e){
		var shortcode = e.target.dataset.vcShortcode;
		if ( shortcode === 'uncode_index' ||  shortcode === 'vc_gallery' || shortcode === 'uncode_slider' ) {
			var $this = $(e.target),
				$advNav = $('input[name="advanced_nav"]', $this),
				$fieldsToOff = $('.hide-advanced_nav', $this),
				$fieldsToOn = $('.on-advanced_nav', $this),
				$readOnly = $('.input-readonly input[type=text]', $this),
				$elID = $('input[name="el_id"]', $this);

			$readOnly.attr("readonly", "true");
			
			$advNav.off('change.advNav');
			var checkAdvNav = function($advNav){
				if ( $advNav.is(':checked') ) {
					$fieldsToOff.addClass('uncode_dependent-hidden').find('input, textarea, select').each(function(){
						if ($(this).is('[type="checkbox"]') ) {
							$(this).prop("checked", false).change();
						} else if ($(this).is('select') ) {
							$(this).find('option[value=""]').prop("selected", true).change();
						} else {
							$(this).val("").change();
						}
					});
					$fieldsToOn.find('input[type="checkbox"]').each(function(){
						$(this).prop("checked", true).change();
					});
				} else {
					$fieldsToOff.removeClass('uncode_dependent-hidden');
				}
			};
			checkAdvNav($advNav);
			$advNav.on('change.advNav', function(){
				var _this = $(this);
				checkAdvNav(_this);
			});

			$elID.off('change.targetID');
			var setTarget = function($elID, $readOnly){
				var elID =  $elID.val();
				$readOnly.val(elID);
			};
			setTarget($elID, $readOnly);
			$elID.on('change.targetID', function(){
				var _this = $(this);
				setTarget(_this, $readOnly);
			});
		}

		if ( shortcode === 'uncode_carousel_nav' ) {
			var $this = $(e.target),
				$selPos = $('.owl-nav-position-sel select', $this),
				$genPos = $('select[name="position"]', $this),
				$dotsTab = $('#vc_edit-form-tab-1', $this),
				$dotsPos = $('select[name="dots_position"]', $dotsTab),
				$dotsHover = $('input[name=dots_hover]', $dotsTab),
				$dotsAnim = $('select[name="dots_animation"]', $dotsTab),
				$counterTab = $('#vc_edit-form-tab-2', $this),
				$counterPos = $('select[name="counter_position"]', $counterTab),
				$counterHover = $('input[name=counter_hover]', $counterTab),
				$counterAnim = $('select[name="counter_animation"]', $counterTab),
				$arrowsTab = $('#vc_edit-form-tab-3', $this),
				$arrowsPos = $('select[name="arrows_position"]', $arrowsTab),
				$arrowsHover = $('input[name=arrows_hover]', $arrowsTab),
				$arrowsAnim = $('select[name="arrows_animation"]', $arrowsTab);

			var checkPosition = function($sel, $tab){
				var genPosVal = $('option:selected', $genPos).val(),
					dotsPosVal = $('option:selected', $dotsPos).val(),
					counterPosVal = $('option:selected', $counterPos).val(),
					arrowsPosVal = $('option:selected', $arrowsPos).val();

				if ( genPosVal !== '' ) {
					$dotsHover.add($dotsAnim).add($counterHover).add($counterAnim).add($arrowsHover).add($arrowsAnim).closest('.vc_shortcode-param').removeClass('uncode_dependent-hidden');
				} else {
					if ( dotsPosVal !== '' ) {
						$dotsHover.add($dotsAnim).closest('.vc_shortcode-param').removeClass('uncode_dependent-hidden');
					} else {
						$dotsHover.add($dotsAnim).closest('.vc_shortcode-param').addClass('uncode_dependent-hidden');
					}
					if ( counterPosVal !== '' ) {
						$counterHover.add($counterAnim).closest('.vc_shortcode-param').removeClass('uncode_dependent-hidden');
					} else {
						$counterHover.add($counterAnim).closest('.vc_shortcode-param').addClass('uncode_dependent-hidden');
					}
					if ( arrowsPosVal !== '' ) {
						$arrowsHover.add($arrowsAnim).closest('.vc_shortcode-param').removeClass('uncode_dependent-hidden');
					} else {
						$arrowsHover.add($arrowsAnim).closest('.vc_shortcode-param').addClass('uncode_dependent-hidden');
					}
				}
			};
			
			$selPos.on('change.navPos', function(){
				checkPosition();
			});
			checkPosition();
		}
	});

}(window.jQuery);
