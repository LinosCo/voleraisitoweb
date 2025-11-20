/*
 * OKVideo by OKFocus v2.3.2
 * http://okfoc.us
 *
 * Copyright 2014, OKFocus
 * Licensed under the MIT license.
 *
 */
var player, OKEvents, options, videoWidth, videoHeight, YTplayers, youtubePlayers = new Array();
// youtube player ready
function onYouTubeIframeAPIReady() {
	YTplayers = new Array();
	jQuery('.uncode-video-container.video').each(function() {
		var playerY;
		if (jQuery(this).attr('data-provider') == 'youtube') {
			var id = jQuery(this).attr('data-id'),
				start = jQuery(this).attr('data-start'),
				end = jQuery(this).attr('data-end');
			start = typeof start && start !== null ? start : 0;
			end = typeof end && end !== null ? end : 0;
			options = jQuery(window).data('okoptions-' + id);
			if ( typeof options === 'undefined' ) {
				return true;
			}
			options.time = jQuery(this).attr('data-t');
			playerY = new YT.Player('okplayer-' + id, {
				videoId: options.video ? options.video.id : null,
				playerVars: {
					'autohide': 1,
					'autoplay': jQuery(this).hasClass('is-no-control') ? options.autoplay : 0, //options.autoplay,
					'disablekb': 1,
					'cc_load_policy': options.captions,
					'controls': 0,
					'enablejsapi': 1,
					'fs': 0,
					'modestbranding': 1,
					'origin': window.location.origin || (window.location.protocol + '//' + window.location.hostname),
					'iv_load_policy': options.annotations,
					'loop': options.loop,
					'showinfo': 0,
					'rel': 0,
					'wmode': 'opaque',
					'hd': options.hd,
					'mute': 1,
					'start': start,
					'end': end
				},
				events: {
					'onReady': OKEvents.yt.ready,
					'onStateChange': OKEvents.yt.onStateChange,
					'onError': OKEvents.yt.error
				}
			});
			YTplayers[id] = playerY;
			playerY.videoId = id;
		}

	});
}
// vimeo player ready
function vimeoPlayerReady(id) {
	options = jQuery(window).data('okoptions-' + id);
	if ( typeof options === 'undefined' ) {
		return true;
	}
	var jIframe = options.jobject,
		iframe = jIframe[0];

	jIframe.attr('src', jIframe.data('src'));
	var playerV = new Vimeo.Player(iframe);
	// hide player until Vimeo hides controls...
	playerV.on('loaded', function(e) {
		OKEvents.v.onReady(iframe);
		var carouselContainer = jQuery(iframe).closest('.owl-carousel');
		if (carouselContainer.length) {
			UNCODE.owlPlayVideo(carouselContainer);
		}
		// "Do not try to add listeners or call functions before receiving this event."
		if (OKEvents.utils.isMobile()) {
			// mobile devices cannot listen for play event
			OKEvents.v.onPlay(playerV);
		} else {
			playerV.on('play', function(){
				OKEvents.v.onPlay(playerV);
				jQuery(window).trigger('okevents.v.play', [playerV]);
			});
			playerV.on('pause', function(){
				OKEvents.v.onPause;
				jQuery(window).trigger('okevents.v.pause', [playerV]);
			});
			playerV.on('ended', function(){
				OKEvents.v.onFinish
				jQuery(window).trigger('okevents.v.ended', [playerV]);
			});
		}
		if (options.time != null) {
			var optsTimeStr = (options.time).replace('t=', ''),
				timeV = '';

			if ( /[a-zA-Z]/g.test(optsTimeStr) ) {
				var timeArr = optsTimeStr.split(/([^\d.-])/);
				for ( var i = 0; i < timeArr.length; i++ ) {
					if ( timeArr[i] === 'h' ) {
						timeV += parseFloat(timeArr[i-1]) * 3600;
					} else if ( timeArr[i] === 'm' ) {
						timeV += parseFloat(timeArr[i-1]) * 60;
					} else if ( timeArr[i] === 's' ) {
						timeV += parseFloat(timeArr[i-1]);
					}
				}
			} else {
				timeV = optsTimeStr;
			}

			playerV.setCurrentTime(timeV);
		}

		playerV.setVolume(0);
		playerV.play();
		jQuery(iframe).css({
			visibility: 'visible',
			opacity: 1
		});
		jQuery(iframe).closest('.uncode-video-container:not(.t-entry-drop)').css('opacity', '1');
		jQuery(iframe).closest('#page-header').addClass('video-started');
		jQuery(iframe).closest('.background-wrapper').find('.block-bg-blend-mode.not-ie').css('opacity', '1');

		jQuery(window).trigger('okevents.v.loaded', [playerV]);
	});
}
OKEvents = {
	yt: {
		ready: function(event) {
			var id = event.target.videoId,
				$video = jQuery('#okplayer-' + id),
				options = jQuery(window).data('okoptions-' + id);
			if ( typeof options === 'undefined' ) {
				return true;
			}
			youtubePlayers[id] = event.target;
			event.target.setVolume(options.volume);
			if (options.autoplay === 1) {
				if (options.playlist.list) {
					player.loadPlaylist(options.playlist.list, options.playlist.index, options.playlist.startSeconds, options.playlist.suggestedQuality);
				} else {
					var inCarousel = $video.closest('.owl-item');
					if (!inCarousel.length || (inCarousel.length && inCarousel.hasClass('active'))) {
						if (options.time != null) {
							event.target.seekTo(parseInt(options.time));
						}
						event.target.playVideo();
					} else {
						event.target.pauseVideo();
					}
				}
			}
			OKEvents.utils.isFunction(options.onReady) && options.onReady(event.target);

			$video.closest('[data-provider]').on('uncode-resume', function(){
				if (options.time != null) {
					event.target.seekTo(parseInt(options.time)).playVideo();
				} else {
					event.target.seekTo(0).playVideo();
				}
			});

			$video.closest('[data-provider]').on('uncode-pause', function(){
				if (options.time != null) {
					event.target.seekTo(parseInt(options.time)).pauseVideo();
				} else {
					event.target.seekTo(0).pauseVideo();
				}
			});
			jQuery(window).trigger('okevents.y.loaded', [event]);
		},
		onStateChange: function(event) {
			var id = event.target.videoId,
				$video = jQuery('#okplayer-' + id),
				options = jQuery(window).data('okoptions-' + id);
			if ( typeof options === 'undefined' || typeof event.target.setVolume === 'undefined' ) {
				return true;
			}
			youtubePlayers[id] = event.target;
			event.target.setVolume(options.volume);
			var $fluid = $video.closest('.fluid-object'),
				$tmb = $video.closest('.tmb'),
				setTime;
			switch (event.data) {
				case -1:
					OKEvents.utils.isFunction(options.unstarted) && options.unstarted();
					break;
				case 0:
					OKEvents.utils.isFunction(options.onFinished) && options.onFinished();
					options.loop && event.target.playVideo();
					break;
				case 1:
					OKEvents.utils.isFunction(options.onPlay) && options.onPlay();
					setTimeout(function() {
						UNCODE.initVideoComponent(document.body, '.uncode-video-container.video:not(.drop-move), .uncode-video-container.self-video:not(.drop-move)');
						jQuery('#okplayer-' + id).closest('.uncode-video-container:not(.t-entry-drop)').css('opacity', '1');
						jQuery('#okplayer-' + id).closest('#page-header').addClass('video-started');
						jQuery('#okplayer-' + id).closest('.background-wrapper').find('.block-bg-blend-mode.not-ie').css('opacity', '1');
					}, 300);
				break;
				case 2:
					OKEvents.utils.isFunction(options.onPause) && options.onPause();
					break;
				case 3:
					OKEvents.utils.isFunction(options.buffering) && options.buffering();
					break;
				case 5:
					OKEvents.utils.isFunction(options.cued) && options.cued();
					break;
				default:
					throw "OKVideo: received invalid data from YT player.";
			}

			jQuery(window).trigger('okevents.y.change', [event]);
		},
		error: function(event) {
			throw event;
		}
	},
	v: {
		onReady: function(target) {
			if ( typeof options === 'undefined' ) {
				return true;
			}
			OKEvents.utils.isFunction(options.onReady) && options.onReady(target);
		},
		onPlay: function(player) {
			if ( typeof options === 'undefined' ) {
				return true;
			}
			if (!OKEvents.utils.isMobile()) player.setVolume(options.volume);
			OKEvents.utils.isFunction(options.onPlay) && options.onPlay();
			jQuery(player.element).closest('.uncode-video-container:not(.t-entry-drop)').css('opacity', '1');
			jQuery(player.element).closest('#page-header').addClass('video-started');
			jQuery(player.element).closest('.background-wrapper').find('.block-bg-blend-mode.not-ie').css('opacity', '1');
		},
		onPause: function() {
			if ( typeof options === 'undefined' ) {
				return true;
			}
			OKEvents.utils.isFunction(options.onPause) && options.onPause();
		},
		onFinish: function() {
			if ( typeof options === 'undefined' ) {
				return true;
			}
			OKEvents.utils.isFunction(options.onFinish) && options.onFinish();
		}
	},
	utils: {
		isFunction: function(func) {
			if (typeof func === 'function') {
				return true;
			} else {
				return false;
			}
		},
		isMobile: function() {
			if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
				return true;
			} else {
				return false;
			}
		}
	}
};