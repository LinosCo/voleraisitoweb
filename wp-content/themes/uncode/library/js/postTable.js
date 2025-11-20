(function($) {
	"use strict";

	UNCODE.postTable = function() {

	var clickRow = function(){
		var $postLists = $('.uncode-post-table');

		$postLists.each(function(){
			var $postList = $(this),
				$tmbClicks = $('.tmb.tmb-click-row', $postList);

			$tmbClicks.each(function(){
				var $tmb = $(this),
					$click = $('.table-click-row', $tmb);
				$('*:not(.table-click-row)', $tmb).on('click', function(e){
					e.preventDefault();
					e.stopPropagation();
					$click[0].click();
					return false;
				});
			});

		})
	};

	clickRow();

	var hoverRow = function(){
		var $postLists = $('.uncode-post-table.uncode-post-table-hover');

		$postLists.on('mouseenter', function(){
			$(this).addClass('post-table-hover');
		});
		$postLists.on('mouseleave', function(){
			$(this).removeClass('post-table-hover');
		});
	}

	hoverRow();

	var drop_wp_animation = function() {
		var $postLists = $('.uncode-post-table');
		$postLists.each(function(){
			$.each($('.t-inside.animate_when_almost_visible', $postLists), function(index, val) {
				new Waypoint({
					context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
					element: val,
					handler: function() {
						var element = $(this.element),
							parent = element.closest('.tmb'),
							currentIndex = parent.index(),
							delay = currentIndex,
							delayAttr = parseInt(element.attr('data-delay'));
						if (isNaN(delayAttr)) delayAttr = 100;
						var objTimeout = requestTimeout(function() {
							element.addClass('start_animation');
						}, delay * delayAttr);
						if (!UNCODE.isUnmodalOpen) {
							this.destroy();
						}
					},
					offset: UNCODE.isFullPage ? '100%' : '90%'
				})
			});
		});
	}

	var runWaypoints_TO,
		runWaypoints_delay = 0;

	var runWaypoints = function(){
		if ( typeof runWaypoints_TO !== 'undefined' && runWaypoints_TO !== '' ) {
			runWaypoints_delay = 400;
		}
		clearRequestTimeout(runWaypoints_TO);
		runWaypoints_TO = requestTimeout(function() {
			drop_wp_animation();
		}, runWaypoints_delay);
	};
	runWaypoints();
	$( document.body ).on( 'uncode_waypoints', runWaypoints );
	if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
		window.parent.vc.events.on( 'shortcodeView:ready shortcodeView:updated', function(){
			runWaypoints();
			// clickRow();
		});
	}
};


})(jQuery);
