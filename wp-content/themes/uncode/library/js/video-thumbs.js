(function($) {
	"use strict";

	UNCODE.videoThumbs = function() {
	var checkResize,
		newW = UNCODE.wwidth;
	var checkForVideos = function(){

		$(window).on('okevents.y.change', function(e, y){
			var $video = $(y.target.g),
				$video_wrap = $video.closest('.fluid-object.is-no-control.play-on-hover'),
				$mobile_video_wrap = $video.closest('.fluid-object.is-no-control.no-control-mobile-autoplay'),
				restart = !$video_wrap.hasClass('play-pause'),
				$tmb = $video.closest('.tmb-all-hover.tmb-content-under').length ? $video.closest('.t-inside') : $video.closest('.t-entry-visual, .un-inline-image'),
				setTime;
			if ( newW >= UNCODE.mediaQuery ) {

				if( $video_wrap.length && $video_wrap.data('hovered') !== true ) {
					$video_wrap.data('hovered', true);
					$video_wrap.addClass('played-on');
					y.target.pauseVideo();
					$tmb.on('mouseenter', function(){
						if ( restart ) {
							y.target.seekTo(0);
						}
						y.target.playVideo();
					}).on('mouseleave', function(){
						clearTimeout(setTime);
						setTime = setTimeout(function(){
							y.target.pauseVideo();
						}, 300);
					});
				}

			} else {
				if( $mobile_video_wrap.length ) {
					$video_wrap.addClass('played-on');
					y.target.playVideo();
				}
			}

		});

		$(window).on('okevents.v.loaded', function(e, playerV){
			var $video = $(playerV.element),
				$video_wrap = $video.closest('.fluid-object.is-no-control.play-on-hover'),
				$mobile_video_wrap = $video.closest('.fluid-object.is-no-control.no-control-mobile-autoplay'),
				restart = !$video_wrap.hasClass('play-pause'),
				$tmb = $video.closest('.tmb-all-hover.tmb-content-under').length ? $video.closest('.t-inside') : $video.closest('.t-entry-visual, .un-inline-image'),
				setTime;

			if ( newW >= UNCODE.mediaQuery ) {
				
				if( $video_wrap.length ) {

					var playPromise = playerV.play();
					if (playPromise !== undefined) {
						playPromise.then(function( value ) {
							playerV.pause();
						});
					}
					$video_wrap.addClass('played-on');
					$tmb.on('mouseenter', function(){
						if ( restart ) {
							playerV.setCurrentTime(0)
						}
						playerV.play();
					}).on('mouseleave', function(){
						clearTimeout(setTime);
						setTime = setTimeout(function(){
							playerV.pause();
						}, 300);
					});
				}

			} else {

				if( $mobile_video_wrap.length ) {
					var playPromise = playerV.play();
					if (playPromise !== undefined) {
						playPromise.then(function( value ) {
							playerV.play();
						});
					}
					$video_wrap.addClass('played-on');
				}
			}
		});

		$('.fluid-object.self-video.is-no-control video').each(function(key, video){
			var $video = $(video),
				$noscript = $('noscript', $video),
				$video_wrap = $video.closest('.fluid-object.is-no-control.play-on-hover'),
				restart = !$video_wrap.hasClass('play-pause'),
				$mobile_video_wrap = $video.closest('.fluid-object.is-no-control.no-control-mobile-autoplay'),
				$tmb = $video.closest('.tmb-all-hover.tmb-content-under').length ? $video.closest('.t-inside') : $video.closest('.t-entry-visual, .un-inline-image'),
				setTime,
			manageVideo = function(){
				video.currentTime = 0;
				video.pause();
				if ( newW >= UNCODE.mediaQuery ) {
					if ( $video_wrap.length ) {
						$video_wrap.addClass('played-on');
						$tmb.on('mouseenter', function(){
							if ( restart ) {
								video.currentTime = 0;
							}
							video.play();
						}).on('mouseleave', function(){
							clearTimeout(setTime);
							setTime = setTimeout(function(){
								video.pause();
							}, 300);
						});
					} else {
						video.play();
					}
				} else {
					if ( $mobile_video_wrap.length ) {
						$mobile_video_wrap.addClass('played-on');
						video.play();
					}
				}

			};
			if ( $noscript.length && newW >= UNCODE.mediaQuery ) {
				$noscript.each(function(key, val){
					$noscript.after(val.textContent || val.innerText || val.innerHTML);
					$noscript.remove();
				});
			}

			if (typeof MediaElement === "function") {
				$video.has('source[src]').mediaelementplayer({
					pauseOtherPlayers: false,
				});
			}
			if (video.readyState > 0) {
				manageVideo();
			} else {
				$video.on("loadedmetadata", function(_event) {
					manageVideo();
				});
			};
		});
	
	};
	
	checkForVideos();

	var checkVideoResize = function(){
		clearRequestTimeout(checkResize);
		checkResize = requestTimeout(function(){
			if ( newW !== UNCODE.wwidth ) {
				checkForVideos();
				newW = UNCODE.wwidth;
			}
		}, 1000);
	};

	$(window).off('resize.videos', checkVideoResize)
	.on( 'resize.videos', checkVideoResize);

	$(window).off('more-items-loaded.videos', checkForVideos)
	.on('more-items-loaded.videos', checkForVideos);

	$(document).off('uncode-ajax-filtered.videos', checkForVideos)
	.on('uncode-ajax-filtered.videos', checkForVideos);

};

})(jQuery);
