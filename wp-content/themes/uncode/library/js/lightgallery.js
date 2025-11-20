(function($) {
	"use strict";

	UNCODE.lightgallery = function( $el ) {
	var createSelectors = function(){
		$('a[data-lbox]:not([data-lbox-init]):not([data-album])' + SiteParameters.uncode_lb_add_items).each(function(){
			if ( !$(this).closest('.nested-carousel').length && !$(this).closest('.owl-item.cloned').length && !$(this).hasClass('lb-disabled') ) {
				$(this).addClass('lbox-trigger-item');
			} else if ( $(this).closest('.nested-carousel').length && !$(this).closest('.owl-item.cloned').length && !$(this).hasClass('lb-disabled') ) {
				$(this).addClass('lbox-nested-item');
			} else {
				$(this).removeClass('lbox-trigger-item');
				$(this).removeClass('lbox-nested-item');
			}
		});
	};

	createSelectors();

	var galleries = [],
		nested_a = $('a[data-lbox]:not(.lb-disabled):not([data-lbox-init]):not([data-album])').filter(function( index ) {
			return !$(this).closest('.nested-carousel').length;
		}),
		$_galleries = $('.isotope-container:not([data-lbox-init]), .owl-carousel:not([data-lbox-init]), .custom-grid-container:not([data-lbox-init]), .index-scroll-wrapper:not([data-lbox-init]), .justified-gallery:not([data-lbox-init]), .linear-container:not([data-lbox-init]), .uncode-single-media-wrapper:not([data-lbox-init]), .woocommerce-product-gallery:not([data-lbox-init]), .icon-box .icon-box-icon:not([data-lbox-init]), .icon-box .icon-box-content:not([data-lbox-init]), .grid-container:not([data-lbox-init]), .btn-container:not([data-lbox-init])' + SiteParameters.uncode_lb_add_galleries).has('.lbox-trigger-item').not('.isotope-container *, .owl-carousel *, .index-scroll-wrapper *, .justified-gallery *, .woocommerce-product-gallery *, .grid-container *, .linear-container *'), 
		$galleries = $_galleries.filter(function( index ) {
			return !$(this).closest('.owl-carousel').length || $(this).is('.owl-carousel');
		}),
		$nested = $('.nested-carousel:not([data-lbox-init])').has('.lbox-nested-item');

	if ( typeof $el === 'undefined' ) {
		$el = $galleries.add( $nested );
	}

	var $disabled = $('a.lb-disabled');
	$disabled.on('click', function(e){
		e.preventDefault();
	});

	var beforeSlide = function(event) {
		var detail = event.detail,
			info = detail.info,
			item = detail.item,
			$slide = $(detail.currentSlide.selector),
			$video = $('video', $slide),
			$previous = $(detail.previousSlide.selector),
			$prevVideo = $('video', $previous),
			isAudio = false;

		if ( typeof info.src !== 'undefined' ) {
			isAudio = info.src.search(/.mp3|.m4a/i) > -1;
		}

		if ( ! $video.length && ( info.video || isAudio ) ) {
			if ( info.video ) {
				if ( typeof info.video === 'object' ) {
					var infoJson = info.video;
				} else {
					var infoJson = JSON.parse(info.video);
				}
				var src = infoJson.source[0].src,
					autoplay = $(item).attr('data-autoplay') || event.target.autoplay === true || $(item).closest('[data-lb-autoplay=yes]').length || $(event.target).attr('data-lb-autoplay') === 'yes',
					muted = $(item).closest('[data-lb-muted=yes]').length || $(event.target).attr('data-lb-muted') === 'yes',
					loop = $(item).attr('data-loop');

			} else if ( isAudio ) {
				var src = info.src,
					autoplay = true,
					loop = false;
			}
			if ( typeof src !== 'undefined' ) {
				$slide.addClass('has-html5');
				var video = document.createElement('video');
				video.src = src;
				video.preload = 'auto';
				video.controls = 'controls';
				video.controlsList = 'nodownload';
				if ( autoplay ) {
					video.autoplay = 'autoplay';
				}
				if ( muted ) {
					video.muted = 'muted';
				}
				if ( loop ) {
					video.loop = 'loop';
				}
				$(video).appendTo($slide);
			}
		} else {
			var $video = $('video', $slide);
			if ( $video.length ) {
				$video[0].currentTime = 0;
				if ( $video[0].autoplay ) {
					$video[0].play();
				}
			}
		}
		if ( $prevVideo.length ) {
			$prevVideo[0].currentTime = 0;
			$prevVideo[0].pause();
		}
	};

	var beforeOpen = function(event) {
		var detail = event.detail,
			items = detail.items,
			galleryItems = detail.galleryItems,
			outer = detail.outer.selector,
			i, ii;
		for ( i = 0; i < galleryItems.length; i++ ) {
			var item = galleryItems[i];
			if ( typeof item.video !== 'undefined' || item.oembed === 'video' ) {
				$(outer).find('.lg-thumb-item[data-lg-item-id="' + i + '"]').addClass('thumbnail-video');
			}
		}
		for ( ii = 0; ii < items.length; ii++ ) {
			var item = items[ii];
			if ( $(item).attr('data-icon') === 'video' ) {
				$(outer).find('.lg-thumb-item[data-lg-item-id="' + ii + '"]').addClass('thumbnail-video');
			}
		}

	};

	//caption builder
	var captionBuilder = function($el){
		$el.each( function( index, val ) {
			var $gallery = $(this).attr('data-lbox-init','true'),
				$_a = '.lbox-trigger-item',
				$_nested_a = '.lbox-nested-item';

			$gallery.find($_a, $_nested_a).each(function(){
				var $a = $(this),
					$img = $('img', $a).first(),
					imgw = $img.attr('data-width'),
					imgh = $img.attr('data-height'),
					caption = $a.attr('data-caption'),
					title = $a.attr('data-title');

				if ( $img.length && $img.attr('data-crop') != true ) {
					if ( typeof $img.attr('data-guid') !== 'undefined' && $img.attr('data-guid') !== '' ) {
						$a.attr('data-external-thumb-image', $img.attr('data-guid'));
					} else if ( $img[0].src && typeof $img.attr('data-srcset') == 'undefined' && $a.attr('data-external-thumb-image') == '' ) {
						$a.attr('data-external-thumb-image', $img[0].src);
					}
				}

				if ( typeof title !== 'undefined' && title !== '' ) {
					title = '<h6>' + title + '</h6>';
				} else {
					title = '';
				}

				if ( typeof caption !== 'undefined' && caption !== '' ) {
					caption = '<p>' + caption + '</p>';
					title += caption;
				}

				if ( title !== '' ) {
					$a.attr( 'title', title );
				}

				if ( $img.attr('data-crop') != true && typeof imgw !== 'undefined' && typeof imgh !== 'undefined' && imgw !== '' && imgh !== '' && ( typeof $a.attr('data-lg-size') === 'undefined' || !$a.attr('data-lg-size') ) ) {
					$a.attr('data-lg-size', imgw + '-' + imgh);
				}
			});
		});
	};
	captionBuilder($el);

	//regular galleries
	$el.each( function( index, val ) {
		var $gallery = $(this),
			$_a = '.lbox-trigger-item',
			$_nested_a = '.lbox-nested-item',
			$_first = !$gallery.hasClass( 'nested-carousel' ) ? $($_a, $gallery).first() : $($_nested_a, $gallery).first(),
			galleryID = $_first.attr('data-lbox'),
			$_connected_a = $_a + '[data-lbox="' + galleryID + '"]',
			tmb = $_first.attr('data-notmb'),
			social = $_first.attr('data-social'),
			deep = $_first.attr('data-deep'),
			zoom = $_first.attr('data-zoom-origin'),
			actual = $_first.attr('data-actual-size'),
			download = $_first.attr('data-download'),
			controls = $_first.attr('data-arrows') !== 'no',
			fullScreen = $_first.attr('data-full'),
			counter = $_first.attr('data-counter'),
			transition = typeof $_first.attr('data-transition') !== 'undefined' ? $_first.attr('data-transition') : 'lg-slide',
			containerClass = $_first.closest('[data-skin="white"]').length ? 'lg-light-skin' : '',
			connect = $_first.attr('data-connect'),
			lgPlugins = [lgVideo],
			itemsLoadedTimeOut;

		if ( typeof galleryID === 'undefined' ) {
			galleryID = $gallery.attr('id');
		}

		containerClass += $_first.attr('data-transparency') === 'opaque' ? ' lg-opaque' : '';
		containerClass += controls && $_first.attr('data-arrows-bg') === 'semi-transparent' ? ' lg-semi-transparent-arrows' : '';

		if ( typeof tmb == 'undefined' || !tmb ) {
			lgPlugins.push(lgThumbnail);
		}
		if ( ( typeof actual != 'undefined' && actual != '' ) || $gallery.is('.woocommerce-product-gallery') ) {
			lgPlugins.push(lgZoom);
		}
		if ( typeof deep != 'undefined' && deep != '' ) {
			lgPlugins.push(lgHash);
		}
		if ( typeof fullScreen != 'undefined' && fullScreen != '' ) {
			lgPlugins.push(lgFullscreen);
		}
		if ( social ) {
			lgPlugins.push(lgShare);
		}

		if ( galleries.indexOf( galleryID ) !== -1 ) {
			return true;
		}

		galleries.push( galleryID );
		var $triggerGal = connect ? $('.page-wrapper') : $gallery,
			$selector = !$triggerGal.hasClass( 'nested-carousel' ) ? ( connect ? $_connected_a : $_a ) : $_nested_a;
		var gallery = lightGallery( $triggerGal[0], {
			addClass: containerClass,
			plugins: lgPlugins,
			mode: transition,
			selector: $selector,
			galleryId: galleryID,
			thumbnail: ( typeof tmb == 'undefined' || !tmb ),
			iframeWidth: '848px',
			iframeMaxWidth: '90%',
			iframeMaxHeight: '90%',
			exThumbImage: 'data-external-thumb-image',
			loadYouTubeThumbnail: false,
			autoplayVideoOnSlide: ( $gallery.attr('data-lb-autoplay') === 'yes' ),
			// autoplayFirstVideo: false,
			pager: false,
			startClass: 'lg-start-opacity',
			zoomFromOrigin: zoom,
			controls: controls,
			download: ( typeof download != 'undefined' && download != '' ),
			thumbWidth: 50,
			thumbHeight: '50px',
			counter: $triggerGal.find($selector).length > 1 ? counter : false,
			loadYouTubePoster: false,
			enableDrag: $triggerGal.find($selector).length > 1,
			mobileSettings: {
				showCloseIcon: $('body').hasClass('lightgallery-hide-close') ? false : true,
			},
		});

		$('.owl-item.cloned', $gallery).find(nested_a).on('click', function(e){
			e.preventDefault();
			var index = $(this).closest('.owl-item.cloned').attr('data-index');
			gallery.openGallery(index-1);
		});

		$triggerGal.on('more-items-loaded', function(e, items) {
			clearRequestTimeout(itemsLoadedTimeOut);
			itemsLoadedTimeOut = requestTimeout(function(){
				createSelectors();
				captionBuilder($triggerGal);
				gallery.refresh();
			}, 100);
		});

		if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
			window.parent.vc.events.once('shortcodeView:beforeUpdate', function(model) {
				$el = model.view.$el;
				if ( $el.find($triggerGal).length ) {
					gallery.destroy();
				}
			});
		}

		$triggerGal[0].addEventListener('lgBeforeSlide', beforeSlide);
		$triggerGal[0].addEventListener('lgBeforeOpen', beforeOpen);
		$triggerGal[0].addEventListener('lgAfterOpen', function(){
			$(window).trigger('uncode-custom-cursor');
		});

	});

	if ( typeof $el !== 'undefined' ) {

		//album galleries
		$('a[data-album]:not([data-lbox-init])').each(function(index, val) {
			var album = val,
				galleryID = index,
				$album = $(album),
				params = $album.attr('data-album'),
				tmb = $(val).attr('data-notmb'),
				social = $(val).attr('data-social'),
				deep = $(val).attr('data-deep'),
				actual = $(val).attr('data-actual-size'),
				download = $(val).attr('data-download'),
				controls = $(val).attr('data-arrows') !== 'no',
				fullScreen = $(val).attr('data-full'),
				counter = $(val).attr('data-counter'),
				transition = typeof $(val).attr('data-transition') !== 'undefined' ? $(val).attr('data-transition') : 'lg-slide',
				containerClass = $(val).closest('[data-skin="white"]').length ? 'lg-light-skin' : '',
				lgPlugins = [lgVideo];

			$(val).attr('data-lbox-init','true');

			containerClass += $(val).attr('data-transparency') === 'opaque' ? ' lg-opaque' : '';
			containerClass += controls && $(val).attr('data-arrows-bg') === 'semi-transparent' ? ' lg-semi-transparent-arrows' : '';

			if ( typeof tmb == 'undefined' || !tmb ) {
				lgPlugins.push(lgThumbnail);
			}
			if ( typeof actual != 'undefined' && actual != '' ) {
				lgPlugins.push(lgZoom);
			}
			if ( typeof deep != 'undefined' && deep != '' ) {
				lgPlugins.push(lgHash);
			}
			if ( typeof fullScreen != 'undefined' && fullScreen != '' ) {
				lgPlugins.push(lgFullscreen);
			}
			if ( social ) {
				lgPlugins.push(lgShare);
			}

			var gallery = window.lightGallery(album, {
				dynamic: true,
				plugins: lgPlugins,
				dynamicEl: JSON.parse(params),
				galleryId: galleryID,
				addClass: containerClass,
				mode: transition,
				thumbnail: ( typeof tmb == 'undefined' || !tmb ),
				iframeWidth: '848px',
				iframeMaxWidth: '90%',
				iframeMaxHeight: '90%',
				loadYouTubeThumbnail: false,
				autoplayVideoOnSlide: ( $album.attr('data-lb-autoplay') === 'yes' ),
				// autoplayFirstVideo: false,
				pager: false,
				startClass: 'lg-start-opacity',
				zoomFromOrigin: false,
				controls: controls,
				download: ( typeof download != 'undefined' && download != '' ),
				thumbWidth: 50,
				thumbHeight: '50px',
				loadYouTubePoster: false,
				counter: counter,
				exThumbImage: 'data-external-thumb-image',
				loadYouTubePoster: false,
				mobileSettings: {
					showCloseIcon: $('body').hasClass('lightgallery-hide-close') ? false : true,
				},
			});

			$album.on('click', function(){
				gallery.openGallery(0);
			});

			album.addEventListener('lgBeforeSlide', beforeSlide);
			album.addEventListener('lgBeforeOpen', beforeOpen);
			album.addEventListener('lgAfterOpen', function(){
				$(window).trigger('uncode-custom-cursor');
			});

			if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
				window.parent.vc.events.once('shortcodeView:beforeUpdate', function(model) {
					$el = model.view.$el;
					if ( $el.find($album).length ) {
						gallery.destroy();
					}
				});
			}

		});

		//single images
		$('.uncode-lbox:not(.lb-disabled):not([data-lbox-init])').each(function(index, val) {
			var gallery = lightGallery( $('.page-wrapper')[0], {
				selector: '.uncode-lbox:not(.lb-disabled):not([data-lbox-init])',
				iframeWidth: '848px',
				iframeMaxWidth: '90%',
				iframeMaxHeight: '90%',
				loadYouTubeThumbnail: false,
				// autoplayFirstVideo: false,
				startClass: 'lg-start-opacity',
				thumbWidth: 50,
				thumbHeight: '50px',
				download: false,
				loadYouTubePoster: false,
				counter: false
			});

			$('.page-wrapper')[0].addEventListener('lgBeforeSlide', beforeSlide);
			$('.page-wrapper')[0].addEventListener('lgBeforeOpen', beforeOpen);
		});
	}
};


})(jQuery);
