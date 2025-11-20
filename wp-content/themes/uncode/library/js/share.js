(function($) {
	"use strict";

	UNCODE.share = function() {
	if (typeof Share !== 'undefined') {
		var share_button_element = $('.share-button');
		var share_button_url = share_button_element.data('url');

		var share_button_config = {
			ui: {
				flyout: "top center",
				button_font: false,
				button_text: '',
				icon_font: false
			}
		};

		if (share_button_url) {
			share_button_config.url = share_button_url.replace("&", "%26");
		}

		var share_button_top = new Share('.share-button', share_button_config);

		$('li[data-network]', share_button_element).each(function(){
			var label = SiteParameters.uncode_share_label,
				network = $(this).attr('data-network');
			label = label.replace("%", network);
			$(this).attr('aria-label', label);
		});
	}
};


})(jQuery);
