(function($) {
	"use strict";
	/* global jQuery, CoreSettingsParameters, ajaxurl */

	$('.uncode-core-settings-option-input__radio').on('click', function() {
		var _this = $(this);
		var new_value = _this.val();
		var setting = _this.closest('.uncode-core-settings-option-input');
		var prev_value = setting.attr('data-checked-value');
		var option_id = setting.attr('data-option-id');
		var autoload = setting.attr('data-option-autoload');
		var row = _this.closest('.uncode-core-settings-option-row');
		var warning_text = row.find('.uncode-core-settings-option-warning').html();

		setting.attr('data-checked-value', new_value);
		autoload = autoload === '1' ? true : false;

		if (_this.val() !== prev_value) {
			$("<div />").html(warning_text).dialog({
				autoOpen: true,
				modal: true,
				dialogClass: 'uncode-modal uncode-modal-save-core-settings',
				title: "Warning",
				minHeight: 500,
				minWidth: 500,
				closeText: '',
				position: { my: "center", at: "center", of: window },
				buttons: [{
					text: CoreSettingsParameters.locale.button_confirm,
					click: function () {
						save_core_setting_option(option_id, new_value, autoload);
						$(this).dialog("close");
					}
				}],
				open: function( event, ui ) {
					$('body').addClass('overflow_hidden');
				},
				close: function( event, ui ) {
					var target = $(event.currentTarget);
					if (target.hasClass('ui-dialog-titlebar-close')) {
						setting.attr('data-checked-value', prev_value);
						setting.find('.uncode-core-settings-option-input__radio--' + prev_value).click();
					}
					$('body').removeClass('overflow_hidden');
				}
			});
		}
	});

	var save_core_setting_option = function(option_id, value, autoload) {
		$.ajax({
			url: ajaxurl,
			type: 'post',
			data: {
				action: 'uncode_core_settings_update_option',
				value: value,
				option_id: option_id,
				autoload: autoload,
				nonce: CoreSettingsParameters.nonce,
			}
		}).done(function(response) {
			if (response && response.success === false) {
				if (CoreSettingsParameters.enable_debug == true && response && response.success === false) {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('Option update failed');
				}
			} else if (response && response.success === true) {
				if (CoreSettingsParameters.enable_debug == true) {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('Option updated');
				}
			}
		}).fail(function() {
			if (CoreSettingsParameters.enable_debug == true) {
				// This console log is disabled by default
				// So nothing is printed in a typical installation
				//
				// It can be enabled for debugging purposes setting
				// the 'uncode_enable_debug_on_js_scripts' filter to true
				console.log('Option update failed');
			}
		});

	};
})(jQuery);
