(function($) {
	"use strict";

	UNCODE.backgroundSelfVideos = function( $ctx ) {

	var backgroundSelfVideosInit = function( $ctx ) {
		if ( SiteParameters.block_mobile_videos === true ) {
			return false;
		}
		if (typeof MediaElement === "function") {
			if ( typeof $ctx === 'undefined' ) {
				$ctx = document;
			}
		
			$(".background-video-shortcode", $ctx).each(function(index, el) {
				if ( $(this).closest('mediaelementwrapper').length ) {
					return true;
				}
				var $video_el = $(this),
					$parent_carousel = $video_el.parents('.uncode-slider').eq(0),
					$parent_drop_move = $video_el.closest('.t-entry-drop.drop-move'),
					video_id = $video_el.attr('id');

				if ( SiteParameters.is_frontend_editor ) {
					video_id = video_id + '_' + index;
					$video_el.attr('id', video_id);
				}

				var media = new MediaElement(video_id, {
					startVolume: 0,
					loop: true,
					success: function(mediaElement, domObject) {
						domObject.volume = 0;
						$(mediaElement).data('started', false);
						mediaElement.addEventListener('timeupdate', function(e) {
							if (!$(e.target).data('started')) {
								$(mediaElement).data('started', true);
							}
						});
						mediaElement.addEventListener('loadedmetadata', function(e) {
							$('body').removeClass('video-not-supported');
							mediaElement.play();
						});
						if (!UNCODE.isMobile) {
							requestTimeout(function() {
								UNCODE.initVideoComponent(document.body, '.uncode-video-container.video:not(.drop-move), .uncode-video-container.self-video:not(.drop-move)');
							}, 100);
						}
						if ( ($('html.firefox').length) && !$parent_carousel.length  ) {
							mediaElement.play();
						}

						if ( $parent_drop_move.length ) {
							var setResizeMEto,
								resizeMediaElement = function(){
								var dataW = $parent_drop_move.attr('data-w'),
									videoW = domObject.width,
									videoH = domObject.height,
									newW = UNCODE.wwidth / 12 * parseFloat( dataW ),
									newH = newW / ( videoW / videoH );

								$(domObject).css({
									'height': newH,
									'width': newW
								});
							};
							$(window).on( 'resize load', function(){
								clearRequestTimeout(setResizeMEto);
								setResizeMEto = requestTimeout( function() {
									resizeMediaElement();
								}, 10 );
							});
						}

						mediaElement.addEventListener('play', function() {
							$(mediaElement).closest('.uncode-video-container:not(.t-entry-drop)').css('opacity', '1');
							$(mediaElement).closest('#page-header').addClass('video-started');
							$(mediaElement).closest('.background-wrapper').find('.block-bg-blend-mode.not-ie').css('opacity', '1');
						}, true);

					},
					// fires when a problem is detected
					error: function() {}
				});
			});
		} else {

			if ( typeof $ctx === 'undefined' ) {
				$ctx = document;
			}
		
			const videos = $ctx.querySelectorAll(".background-video-shortcode:not(.started)");
			Array.from(videos).forEach(function(video_el) {
				video_el.addEventListener('loadedmetadata', function(e) {
					$('body').removeClass('video-not-supported');
					video_el.play();
				});
				if ( video_el.currentTime > 0 && video_el.readyState > 2 ) {
					video_el.muted = true;
					video_el.loop = true;
					$(video_el).closest('.uncode-video-container:not(.t-entry-drop)').css('opacity', '1');
					$(video_el).addClass('started').closest('#page-header').addClass('video-started');
					$(video_el).closest('.background-wrapper').find('.block-bg-blend-mode.not-ie').css('opacity', '1');
					$('body').removeClass('video-not-supported');
					video_el.play();
				} else {
					requestTimeout(function(){
                         backgroundSelfVideosInit( $ctx );
					}, 1000);
				}
			});
		}
	};

	backgroundSelfVideosInit( $ctx );

	if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
		window.parent.vc.events.on( 'shortcodeView:updated shortcodeView:ready', function(model){
			var $el = model.view.$el,
				shortcode = model.attributes.shortcode;

			if (typeof MediaElement === "function") {
				backgroundSelfVideosInit( $el );
			} else {
				backgroundSelfVideosInit( $el[0] );
			}
		});
	}
};


})(jQuery);
