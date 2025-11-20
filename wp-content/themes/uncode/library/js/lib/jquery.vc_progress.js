/* Progress bar
 ---------------------------------------------------------- */
function uncode_progress_bar() {
	jQuery.each(jQuery('.vc_progress_bar'), function(index, val) {
		if (UNCODE.isUnmodalOpen && !val.closest('#unmodal-content')) {
			return;
		}
		if (!UNCODE.isMobile) {
			new Waypoint({
				context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
				element: val,
				handler: function() {
					var element = jQuery(this.element);
					element.find('.vc_single_bar').each(function(index) {
						var $this = jQuery(this),
							bar = $this.find('.vc_bar'),
							val = bar.data('percentage-value');
						setTimeout(function() {
							bar.css({
								"width": val + '%'
							});
						}, index * 200);
					});
				},
				offset: '80%'
			});
		} else {
			var element = jQuery(val);
			element.find('.vc_single_bar').each(function(index) {
				var $this = jQuery(this),
					bar = $this.find('.vc_bar'),
					val = bar.data('percentage-value');
				setTimeout(function() {
					bar.css({
						"width": val + '%'
					});
				}, index * 200);
			});
		}
	});
};
uncode_progress_bar();
