(function($) {
	"use strict";

	UNCODE.collapse = function() {
	$(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
		var $this = $(this),
			href
		var target = $this.attr('data-target') || e.preventDefault() || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
		var $target = $(target)
		var parent = $this.attr('data-parent')
		var $parent = parent && $(parent)
		var $title = $(this).parent()
		var $accordion = $(e.target).closest('.uncode-accordion')
		var $group = $this.closest('.group')
		var $panel_group = $this.closest('.panel-group')
		if ($parent) {
			$parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
			if ($title.hasClass('active') && ( $panel_group.attr('data-no-toggle') != true || e.type === 'click' ) ) {
				$title.removeClass('active');
				$group.removeClass('active-group');
			} else {
				if ( $panel_group.attr('data-no-toggle') != true ) {
					$parent.find('.panel-title').removeClass('active')
					$parent.find('.group').removeClass('active-group')
				}
				$title[!$target.hasClass('in') ? 'addClass' : ( $panel_group.attr('data-no-toggle') != true ) && 'removeClass']('active')
				$group[!$target.hasClass('in') ? 'addClass' : ( $panel_group.attr('data-no-toggle') != true ) && 'removeClass']('active-group')
			}
		}
		$this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
		requestTimeout(function() {
			var $accordion = $(e.target).closest('.uncode-accordion');
			if ( $accordion.hasClass('tabs-trigger-box-resized') ) {
			  window.dispatchEvent(new CustomEvent('boxResized'));
			} else if ( $accordion.hasClass('tabs-trigger-window-resize') ) {
				window.dispatchEvent(new Event('resize'));
				$(window).trigger('uncode.re-layout');
			} 

			var $active_panel = $('.panel.active-group', $parent);

			$.each($('.animate_when_almost_visible:not(.start_animation):not(.t-inside):not(.drop-image-separator), .index-scroll .animate_when_almost_visible, .tmb-media .animate_when_almost_visible:not(.start_animation), .animate_when_almost_visible.has-rotating-text, .custom-grid-container .animate_when_almost_visible:not(.start_animation)', $active_panel), function(index, val) {
				var element = $(val),
					delayAttr = element.attr('data-delay');
				if (delayAttr == undefined) delayAttr = 0;
				requestTimeout(function() {
					element.addClass('start_animation');
				}, delayAttr);
			});

		}, 500);
	});

	$('.uncode-accordion.tabs-no-lazy').each(function(){
		var $accordion = $(this),
			$panes = $('.panel:not(.active-group)', $accordion);
		$panes.each(function(){
			var $pane = $(this),
				$imgs = $('img[loading="lazy"]', $pane);
			$imgs.removeAttr('loading');
			$imgs.removeAttr('decoding');
		});
	});
};


})(jQuery);
