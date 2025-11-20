(function($) {
	"use strict";

	UNCODE.process_shortpixel_image = function(image) {
	var data = {
		action: 'shortpixel_manual_optimization',
		image_id: image,
		cleanup: true
	};

	$.get(SiteParameters.ajax_url, data);
};


})(jQuery);
