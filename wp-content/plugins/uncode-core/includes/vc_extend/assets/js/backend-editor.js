! function($) {
	"use strict";
    window.vc.events.on('shortcodeView:ready', function(e) {
        var model = e.model,
            shortcode = model.attributes.shortcode,
            cloned = model.attributes.cloned;
        if ( ( shortcode === 'vc_accordion_tab' ||  shortcode === 'vc_tab' ) && cloned ) {
            model.attributes.params.tab_id = model.attributes.cloned_from.params.tab_id + Math.floor(Math.random() * 10);;
        } else if ( ( shortcode === 'vc_gallery' ||  shortcode === 'uncode_index' ||  shortcode === 'uncode_slider' ) && cloned ) {
            model.attributes.params.el_id = model.attributes.cloned_from.params.el_id + Math.floor(Math.random() * 10);;
        }
    });

}(window.jQuery);
