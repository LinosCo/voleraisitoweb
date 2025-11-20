(function($) {
	"use strict";

	UNCODE.okvideo = function(ev) {
	var BLANK_GIF = "data:image/gif;base64,R0lGODlhAQABAPABAP///wAAACH5BAEKAAAALAAAAAABAAEAAAICRAEAOw%3D%3D";
	$.okvideo = function(options) {
		// if the option var was just a string, turn it into an object
		if (typeof options !== 'object') options = {
			'video': options
		};
		var base = this;
		// kick things off
		base.init = function() {
			base.options = $.extend({}, $.okvideo.options, options);
			// support older versions of okvideo
			if (base.options.video === null) base.options.video = base.options.source;
			base.setOptions();
			var target = base.options.target || $('body');
			var position = target[0] == $('body')[0] ? 'fixed' : 'absolute';
			var zIndex = base.options.controls === 3 ? -999 : "auto";
			if ($('#okplayer-' + base.options.id).length == 0) { //base.options.id = String(Math.round(Math.random() * 100000));
				var mask = '<div id="okplayer-mask-' + base.options.id + '" style="position:' + position + ';left:0;top:0;overflow:hidden;z-index:-998;height:100%;width:100%;"></div>';
				if (OKEvents.utils.isMobile()) {
					target.append('<div id="okplayer-' + base.options.id + '" style="position:' + position + ';left:0;top:0;overflow:hidden;z-index:' + zIndex + ';height:100%;width:100%;"></div>');
				} else {
					if (base.options.controls === 3) {
						target.append(mask)
					}
					if (base.options.adproof === 1) {
						target.append('<div id="okplayer-' + base.options.id + '" style="position:' + position + ';left:-10%;top:-10%;overflow:hidden;z-index:' + zIndex + ';height:120%;width:120%;"></div>');
					} else {
						target.append('<div id="okplayer-' + base.options.id + '" style="position:' + position + ';left:0;top:0;overflow:hidden;z-index:' + zIndex + ';height:100%;width:100%;"></div>');
					}
				}
				$("#okplayer-mask-" + base.options.id).css("background-image", "url(" + BLANK_GIF + ")");
				if (base.options.playlist.list === null) {
					if (base.options.video.provider === 'youtube') {
						base.loadYouTubeAPI();
					} else if (base.options.video.provider === 'vimeo') {
						base.options.volume /= 100;
						base.loadVimeoAPI();
					}
				} else {
					base.loadYouTubeAPI();
				}
			}
		};
		// clean the options
		base.setOptions = function() {
			// exchange 'true' for '1' and 'false' for 3
			for (var key in this.options) {
				if (this.options[key] === true) this.options[key] = 1;
				if (this.options[key] === false) this.options[key] = 3;
			}
			if (base.options.playlist.list === null) {
				base.options.video = base.determineProvider();
			}
			// pass options to the window
			$(window).data('okoptions-' + base.options.id, base.options);
		};
		// insert js into the head and exectue a callback function
		base.insertJS = function(src, callback, provider){
			var tag;
			if ( ev === 'uncode-more-items-loaded' && provider !== 'youtube' ) {
				delete UNCODE.insertedSripts[src];
				var tags = document.getElementsByTagName('script');
				for (var i = tags.length; i >= 0; i--){
					if (tags[i] && tags[i].getAttribute('src') != null && tags[i].getAttribute('src').indexOf(src) != -1) {
						tags[i].parentNode.removeChild(tags[i]);
					}
				}
			} else {
				if (UNCODE.insertedSripts && UNCODE.insertedSripts[src]) {
					tag = UNCODE.insertedSripts[src];
					if (callback){
						if (tag.readyState){  //IE
							tag.onreadystatechange = function(){
								if (tag.readyState === "loaded" ||
									tag.readyState === "complete"){
									tag.onreadystatechange = null;
									callback();
								}
							};
						} else {
							$(tag).on('load', callback);
						}
					}
					return;
				}
			}
			tag = document.createElement('script');
			if (callback){
				if (tag.readyState){  //IE
					tag.onreadystatechange = function(){
						if (tag.readyState === "loaded" || tag.readyState === "complete"){
							tag.onreadystatechange = null;
							callback();
						}
					};
				} else {
					tag.onload = function() {
						callback();
					};
				}
			}
			tag.src = src;
			var firstScriptTag = document.getElementsByTagName('script')[0];
			firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
			if ( ! UNCODE.insertedSripts ) {
				UNCODE.insertedSripts = [];
			}
			UNCODE.insertedSripts[src] = tag;
		};
		// load the youtube api
		base.loadYouTubeAPI = function(callback) {
			if ( ev === 'uncode-more-items-loaded' ) {
				onYouTubeIframeAPIReady();
			} else {
				base.insertJS('https://www.youtube.com/player_api', false, 'youtube');
			}
		};
		base.loadYouTubePlaylist = function() {
			player.loadPlaylist(base.options.playlist.list, base.options.playlist.index, base.options.playlist.startSeconds, base.options.playlist.suggestedQuality);
		};
		// load the vimeo api by replacing the div with an iframe and loading js
		base.loadVimeoAPI = function() {
			var source = '//player.vimeo.com/video/' + base.options.video.id + '?background=1&api=1&title=0&byline=0&portrait=0&playbar=0&loop=' + base.options.loop + '&autoplay=' + (base.options.autoplay === 1 ? 1 : 0) + '&player_id=okplayer-' + base.options.id + '&autopause=0',
			jIframe = $('<iframe data-src="'+source+'" frameborder="0" id="okplayer-' + base.options.id +'" style="visibility: hidden;" class="vimeo-background" webkitallowfullscreen mozallowfullscreen allowfullscreen >');
			$(window).data('okoptions-' + base.options.id).jobject = jIframe;
			$('#okplayer-' + base.options.id).replaceWith(jIframe[0]);
			base.insertJS('//player.vimeo.com/api/player.js', function() {
				vimeoPlayerReady(base.options.id);
			}, 'vimeo');
		};
		// is it from youtube or vimeo?
		base.determineProvider = function() {
			var a = document.createElement('a');
			a.href = base.options.video;
			if (/youtube.com/.test(base.options.video) || /youtu.be/.test(base.options.video)) {
				var videoid = a.href.split('/')[3].toString();
				var query = videoid.substring(videoid.indexOf('?') + 1);
				if (query != '') {
					var vars = query.split('&');
					for (var i = 0; i < vars.length; i++) {
						var pair = vars[i].split('=');
						if (pair[0] == 'v') {
							videoid = pair[1];
						}
					}
				}
				return {
					"provider": "youtube",
					"id": videoid
				};
			} else if (/vimeo.com/.test(base.options.video)) {
				return {
					"provider": "vimeo",
					"id": (a.href.split('/')[3].toString()).split('#')[0],
				};
			} else if (/[-A-Za-z0-9_]+/.test(base.options.video)) {
				var id = new String(base.options.video.match(/[-A-Za-z0-9_]+/));
				if (id.length == 11) {
					return {
						"provider": "youtube",
						"id": id.toString()
					};
				} else {
					for (var i = 0; i < base.options.video.length; i++) {
						if (typeof parseInt(base.options.video[i]) !== "number") {
							throw 'not vimeo but thought it was for a sec';
						}
					}
					return {
						"provider": "vimeo",
						"id": base.options.video
					};
				}
			} else {
				throw "OKVideo: Invalid video source";
			}
		};
		base.init();
	};

	var checkResize,
		newW = UNCODE.wwidth;

	$.okvideo.options = {
		id: null,
		source: null, // Deprecate dis l8r
		video: null,
		playlist: { // eat ur heart out @brokyo
			list: null,
			index: 0,
			startSeconds: 0,
			suggestedQuality: "default" // options: small, medium, large, hd720, hd1080, highres, default
		},
		disableKeyControl: 1,
		captions: 0,
		loop: 1,
		hd: 1,
		volume: 0,
		adproof: false,
		unstarted: null,
		onFinished: null,
		onReady: null,
		onPlay: null,
		onPause: null,
		buffering: null,
		controls: false,
		autoplay: true,
		annotations: true,
		cued: null
	};
	$.fn.okvideo = function(options) {
		options.target = this;
		return this.each(function() {
			(new $.okvideo(options));
		});
	};

	var checkForVideos = function(){
		$(".uncode-video-container.video").each(function(index, el) {
			var $this = $(this),
				mobile_ready = $this.hasClass('no-control-mobile-autoplay'),
				url = $this.attr('data-video'),
				id = $this.attr('data-id'),
				cloned = $this.closest('.owl-item');

			if ( mobile_ready || newW >= UNCODE.mediaQuery ) {
				if (!cloned.hasClass('cloned') || cloned.length == 0) {
					$this.okvideo({
						id: id,
						source: url.split('#')[0],
						time: ((url).indexOf("#") > -1) ? (url).substring((url).indexOf('#') + 1) : null,
						autoplay: 1,
						controls: 0,
						volume: 0,
						adproof: 0,
						caller: $this,
						hd: 1,
						onReady: function(player) {
							var getPlayer = player.c || player.h || player,
							$iframe,
							getContainer = $(getPlayer).closest('.background-element');
							if (getContainer.length) {
								UNCODE.initVideoComponent(getContainer[0], '.uncode-video-container.video:not(.drop-move)');
							}

							if ( $this.hasClass('drop-move') ) {

								var $iframe = $(getPlayer),
									w = parseFloat($iframe.attr('width')),
									h = parseFloat($iframe.attr('height')),
									ratio = h / w,
									setResizeiFto,
								resizeiFrame = function(){
									var dataW = $this.attr('data-w'),
										newW = UNCODE.wwidth / 12 * parseFloat( dataW ),
										newH = newW * ratio;
									$iframe.css({
										width: newW,
										height: newH
									});
								};
								resizeiFrame();
								$(window).on( 'load', resizeiFrame );
								$(window).on( 'resize', function(){
									clearRequestTimeout(setResizeiFto);
									setResizeiFto = requestTimeout( function() {
										resizeiFrame();
									}, 10 );
								});

							}

						}
					});
				}
			}
		});
	};

	checkForVideos();

	$(window).on('load', function(){
		$('.mejs-fullscreen-button button').on('click', function(){
			var $button = $(this),
				$stuck = $button.closest('.is_stucked');

			if ( $stuck.length ) {
				$stuck = $(this).trigger("sticky_kit:detach");
				window.scrollTo(0, 0);
			}
		});
	});

	var checkVideoResize = function(){
		clearRequestTimeout(checkResize);
		checkResize = requestTimeout(function(){
			if ( newW !== UNCODE.wwidth ) {
				newW = UNCODE.wwidth;
				checkForVideos();
			}
		}, 1000);
	};

	$(window).off('resize', checkVideoResize)
	.on( 'resize', checkVideoResize);

};

$(document).on('uncode-ajax-filtered.videos', function(){
	UNCODE.okvideo("uncode-more-items-loaded");
});

})(jQuery);
