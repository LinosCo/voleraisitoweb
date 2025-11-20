(function($) {
	"use strict";

	UNCODE.dropImage = function() {

	/****************************
	 * Image hover *
	****************************/
	function imageHover(){
		if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
			return;
		}

		var $postLists = $('.uncode-post-titles');
		$postLists.each(function(){
			var $list = $(this),
				timing = parseFloat( $list.attr('data-timing') ),
				default_image = $list.hasClass('uncode-post-titles-default-image'),
				default_title = $list.hasClass('uncode-post-titles-default-title'),
				$tmbs = $('.tmb', $list),
				$drop_moves = $('.t-entry-drop:not(.drop-parent)', $tmbs),
				clientX,
				clientY,
				$row_parent = $list.closest('.vc_row'),
				$drop_row_parents = $('.drop-parent.drop-parent-row', $list),
				$col_parent = $list.closest('.uncell'),
				$drop_col_parents = $('.drop-parent.drop-parent-column', $list),
				stoppedScrolling = true,
				setCTA;

			timing *= 0.001;

			var drop_bgs = function(){
				$drop_row_parents.add($drop_col_parents).filter('[data-bgset]').each(function(e){
					var $drop = $(this),
						srcset = $drop.attr('data-bgset'),
						setArr = srcset.split(","),
						setArrOrder = [],
						biggest = 0,
						checkBg = false,
						desktopBG = $drop.data('[data-background-image]'),
						mobileBG = $drop.data('[data-mobile-background-image]');

					if ( $drop.hasClass('srcset-bg-async') ) {

						if ( ( UNCODE.wwidth < UNCODE.mediaQuery && typeof mobileBG !== 'undefined' && mobileBG !== '' ) || ( UNCODE.wwidth >= UNCODE.mediaQuery && typeof desktopBG !== 'undefined' && desktopBG !== '' ) ) {
							return;
						}
						
					}

					if ( SiteParameters.uncode_adaptive == true ) {
						if (  typeof setArr[0] !== 'undefined' && setArr[0] !== null ) {
							$drop.css({
								'background-image' : 'url(' + setArr[0] + ')'
							});
						}
					} else {
						for ( var i = 0; i < setArr.length; i++ ) {
							var setLoop = setArr[i].trim().split(" ");
							if ( typeof setLoop[1] !== 'undefined' && setLoop[1] !== '' ) {
								var parseSet = parseFloat(setLoop[1]);
								if ( biggest < parseSet ) {
									biggest = parseSet;
								}
								setArrOrder[parseSet] = setLoop[0];
								if ( screenInfo.width <= parseSet && typeof setLoop[0] !== 'undefined' && setLoop[0] !== null ) {
									checkBg = true;
									$drop.css({
										'background-image' : 'url(' + setLoop[0] + ')'
									});
								}
							}
						}

						if ( !checkBg && typeof setArrOrder[biggest] !== 'undefined' && setArrOrder[biggest] !== null ) {
							$drop.css({
								'background-image' : 'url(' + setArrOrder[biggest] + ')'
							});
						}
					}

				});
			};

			drop_bgs();

			var dropMovesSize = function(){
				if ( UNCODE.wwidth < UNCODE.mediaQuery ) {
					return;
				}
				$drop_moves.each(function(){
					var $drop_move = $(this),
						dataW = $drop_move.attr('data-w'),
						$anim_parent = $drop_move.closest('.animate_when_almost_visible:not(.uncode-skew):not(.t-inside), .parallax-el');
					if ( typeof dataW !== 'undefined' && dataW !== null ) {
						dataW = screenInfo.width / 12 * parseFloat( dataW );
					}
					$drop_moves.css({
						width: dataW
					});

					if ( $anim_parent.length && $anim_parent.css('transform') !== '' && $anim_parent.css('transform') !== 'none' ) {
						$anim_parent.on('animationend', function(){
							var bound = $anim_parent[0].getBoundingClientRect();
							$drop_move.css({
								left: bound.x * -1,
								top: bound.y * -1,
							});
						});
					}
				});


			};

			dropMovesSize();

			$(window).on( 'resize', function(){
				clearRequestTimeout(setCTA);
				setCTA = requestTimeout( function() {
					drop_bgs();
					dropMovesSize();
				}, 100 );
			});

			if ( $drop_row_parents.length ) {
				$row_parent.addClass( 'drop-added' );
			}

			$drop_row_parents.each(function(index, val){
				var $drop = $(val);
				$row_parent.prepend($drop);
				manageVideos($drop, false);
				if ( typeof UNCODE.initVideoComponent !== 'undefined' ) {
					UNCODE.initVideoComponent($row_parent[0], '.uncode-video-container.video, .uncode-video-container.self-video');
				}
				if ( default_image && index == 0 ) {
					manageVideos($drop, true);
					var bg_img = $drop.css('background-image').match(/url\(["']?([^"']*)["']?\)/)[1],
						image_ph = new Image();
					if ( typeof bg_img !== 'undefined' && bg_img !== null ) {
						image_ph.onload = function() {
							$drop.addClass('active');
							if ( default_title ) {
								$list.addClass('drop-hover');
								$tmbs.first().addClass('drop-active');
							}
						};
						image_ph.src = bg_img;
					}
				}
			});

			if ( $drop_col_parents.length ) {
				$col_parent.addClass( 'drop-added' );
			}

			$drop_col_parents.each(function(index, val){
				var $drop = $(this);
				$col_parent.prepend($drop);
				manageVideos($drop, false);
				if ( typeof UNCODE.initVideoComponent !== 'undefined' ) {
					UNCODE.initVideoComponent($col_parent[0], '.uncode-video-container.video, .uncode-video-container.self-video');
				}
				if ( default_image && index == 0 ) {
					manageVideos($drop, true);
					var bg_img = $drop.css('background-image').match(/url\(["']?([^"']*)["']?\)/)[1],
						image_ph = new Image();
					if ( typeof bg_img !== 'undefined' && bg_img !== null ) {
						image_ph.onload = function() {
							$drop.addClass('active');
							if ( default_title ) {
								$list.addClass('drop-hover');
								$tmbs.first().addClass('drop-active');
							}
						};
						image_ph.src = bg_img;
					}
				}
			});

			function manageVideos( $el, start ) {
				var videoElem = $('video', $el),
					$iframe = $('iframe', $el),
					iframeID = $iframe.attr('id');
				if ( videoElem.length ) {
					if ( Object.prototype.toString.call( videoElem[0].setCurrentTime) == '[object Function]') {
						if ( start ) {
							videoElem[0].setCurrentTime(0);
							videoElem[0].play();
						} else {
							videoElem[0].pause();
							videoElem[0].setCurrentTime(0);
						}
					} else {
						if ( start ) {
							videoElem[0].currentTime = 0;
							videoElem[0].play();
						} else {
							videoElem[0].pause();
							videoElem[0].currentTime = 0;
						}
					}
				}

				$el.data('active', start);

				if ( $el.attr('data-provider') === 'vimeo' && typeof iframeID !== 'undefined' && iframeID !== null ) {
					var iframeIDv = iframeID.replace('okplayer-', ''),
						optionsV = $(window).data('okoptions-' + iframeIDv),
						vimeo = $iframe[0],
						playerV = new Vimeo.Player(vimeo),
						timeV = 0;

					if (optionsV.time != null) {
						var timeArr = (optionsV.time).replace('t=', '').split(/([^\d.-])/);
						for ( var i = 0; i < timeArr.length; i++ ) {
							if ( timeArr[i] === 'h' ) {
								timeV += parseFloat(timeArr[i-1]) * 3600;
							} else if ( timeArr[i] === 'm' ) {
								timeV += parseFloat(timeArr[i-1]) * 60;
							} else if ( timeArr[i] === 's' ) {
								timeV += parseFloat(timeArr[i-1]);
							}
						}
					}
					playerV.setCurrentTime(timeV);
					if ( start ) {
						playerV.setVolume(0);
						playerV.play();
					} else {
						playerV.pause();
					}
				} else if ( $el.attr('data-provider') === 'youtube' ) {
					if ( start ) {
						$el.trigger('uncode-resume');
					} else {
						$el.trigger('uncode-pause');
					}
				}

			}

			if ( UNCODE.wwidth >= UNCODE.mediaQuery ) {

				document.addEventListener("mousemove", function(e) {
					$drop_moves.each(function(){
						var $drop_move = $(this),
							duration = 0.4;

						if ( $('#uncode-custom-cursor:not(.in-content)').length ) {
							duration = 0.8;
						}

						clientX = e.clientX;
						clientY = e.clientY;

						gsap.to( $drop_move, {
							duration: duration,
							x: clientX,
							y: clientY,
							ease: Power1.easeOut,
						});
					});
				});

			} else {

				$(window).on("touchend scroll", function(e) {
					$list.removeClass('drop-hover');
					$drop_moves.removeClass('active');
					$tmbs.removeClass('drop-active');
				});

				$drop_moves.each(function(){
					var $drop_move = $(this),
						$tmb = $drop_move.closest('.tmb'),
						$anim_parent = $drop_move.closest('.animate_when_almost_visible, .uncode-skew, .parallax-el');

					if ( $anim_parent.hasClass('uncode-skew') ) {
						$anim_parent.css({
							'transform': 'skew(0)'
						});
					}

					$tmb.on('touchend', function(e){
						e.stopPropagation();

						$drop_moves.removeClass('active');
						$tmbs.removeClass('drop-active');

						$list.addClass('drop-hover');
						$tmb.addClass('drop-active');
						$drop_move.addClass('active');
						manageVideos($drop_move, true);
						clientX = e.changedTouches[0].clientX;
						clientY = e.changedTouches[0].clientY;

						if ( $anim_parent.length && $anim_parent.css('transform') !== '' && $anim_parent.css('transform') !== 'none' ) {
							var bound = $anim_parent[0].getBoundingClientRect();
							clientX = clientX - bound.x;
							clientY = clientY - bound.y;
						}

						$drop_move.css({
							left: clientX,
							top: clientY
						});
					});
				});

			}

			$tmbs.each(function(e){
				var $tmb = $(this),
					// $trgr = $('a', $tmb),
					$trgr = $tmb,
					$drop_move = $('.t-entry-drop:not(.drop-parent)', $tmb),
					$anim_parent = $drop_move.closest('.animate_when_almost_visible:not(.uncode-skew):not(.t-inside), .parallax-el'),
					$video = $('video', $tmb),
					$iframe = $('iframe', $tmb),
					$entryTxt = $('.t-entry-text', $tmb),
					stopBounding;

				$entryTxt.add($drop_move).css({
					'transition-duration': timing + 's'
				});

				if ( $video.length ) {
					var vidH = $video[0].videoHeight,
						vidW = $video[0].videoWidth;
					$video.css({
						'height': vidH,
						'width': vidW
					});
				}

				if ( $iframe.length ) {
					var vidH = $drop_move.attr('data-height'),
						vidW = $drop_move.attr('data-width');
					$iframe.css({
						'height': vidH,
						'width': vidW
					});
				}

				$iframe.each(function(){
					var $video = $(this),
						vidH = $video[0].videoHeight,
						vidW = $video[0].videoWidth;
					$video.css({
						'height': vidH,
						'width': vidW
					});
				});

				if ( $drop_move.length && UNCODE.wwidth >= UNCODE.mediaQuery ) {
					$trgr.on('mouseenter',function(e){

						$list.addClass('drop-hover');
						$tmbs.removeClass('drop-active');
						$tmb.addClass('drop-active');
						$drop_move.addClass('active');
						manageVideos($drop_move, true);

						var clientX = e.clientX,
							clientY = e.clientY;
						$drop_move.css({
							'transform': 'translate3d(' + clientX + 'px, ' + clientY + 'px, 0px)'
						});

					})
					.on('mouseleave', function(e){
						$list.removeClass('drop-hover');
						$drop_move.css({
							'transition-duration': ( timing*1.25 ) + 's'
						});
						$drop_move.removeClass('active');
						$tmb.removeClass('drop-active');
						$drop_move.on('transitionend', function(e){
							$drop_move.off('transitionend');
							$drop_move.css({
								'transition-duration': timing + 's'
							});
							manageVideos($drop_move,false);
						});
					});

					document.addEventListener('visibilitychange', function(){
						if ( document.visibilityState == 'hidden' && $drop_move.data('active') === true ) {
							$drop_move.css({
								'transition-duration': '0s'
							});
							$drop_move.removeClass('active');
							manageVideos($drop_move, false);
						}
					});

					document.addEventListener('scroll', function(){
						window.clearRequestTimeout( stopBounding );
						if ( stoppedScrolling ) {
							stoppedScrolling = false;
							if ( $drop_move.hasClass('active') ) {
								$list.removeClass('drop-hover');
								$tmbs.removeClass('drop-active');
								$drop_move.removeClass('active');
								$drop_move.on('transitionend', function(e){
									$drop_move.off('transitionend');
									$drop_move.css({
										'transition-duration': timing + 's'
									});
									manageVideos($drop_move,false);
								});
							}
						}

						stopBounding = requestTimeout(function() {
							if ( $anim_parent.length && $anim_parent.css('transform') !== '' && $anim_parent.css('transform') !== 'none' ) {
								var bound = $anim_parent[0].getBoundingClientRect();
								$drop_move.css({
									left: bound.x * -1,
									top: bound.y * -1,
								});
							}
							stoppedScrolling = true;
						}, 500);
					});
				}

				var datatarget = $trgr.closest('[data-drop-target]').attr('data-drop-target'),
					$drop = $('[data-drop="' + datatarget + '"]', $row_parent);

				$drop.css({
					'transition-duration': timing + 's'
				});

				if ( ( $drop_row_parents.length || $drop_col_parents.length ) && $drop.length ) {
					$trgr.on('mouseenter',function(e){
						$row_parent.add($col_parent).addClass('drop-list-loaded');
						$list.addClass('drop-hover');

						if ( !$tmb.hasClass('drop-active') ) {
							$tmbs.removeClass('drop-active');
							$tmb.addClass('drop-active');
							if ( default_image && !$drop.hasClass('active') ) {
								var $prev = $('[data-drop].active', $row_parent);
								$prev.css({
									'transition-duration': (timing*1.5) + 's'
								});
								$prev.removeClass('active');
								$prev.on('transitionend', function(e){
									$prev.off('transitionend');
									manageVideos($prev,false);
								});
							}
							$drop.css({
								'transition-duration': timing + 's'
							});
							$drop.off('transitionend');
							$drop.addClass('active');
							manageVideos($drop, true);
						}
					})
					.on('mouseleave', function(e){
						if ( ( default_image && !default_title ) || !default_image ) {
							$list.removeClass('drop-hover');
							$tmb.removeClass('drop-active');
						}
						if ( ! default_image ) {
							$drop.css({
								'transition-duration': (timing*1.5) + 's'
							});
							$drop.removeClass('active');

							$drop.on('transitionend', function(e){
								$drop.off('transitionend');
								manageVideos($drop,false);
							});
						}
					});

					document.addEventListener('visibilitychange', function(){
						if ( document.visibilityState == 'hidden' && $drop.data('active') === true && ! default_image ) {
							$drop.css({
								'transition-duration': '0s'
							});
							$drop.removeClass('active');
							manageVideos($drop, false);
						}
					});
				}
			});

		});
	};

	$(window).on('load', function(event) {
		imageHover();
	});

	var drop_wp_animation = function() {
		var $postLists = $('.uncode-post-titles');
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

							var nextTimeout = requestTimeout(function() {
								$('.drop-image-separator', parent).addClass('start_animation');
							}, 50);

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
			// imageHover();
			runWaypoints();
		});
	}
};


})(jQuery);
