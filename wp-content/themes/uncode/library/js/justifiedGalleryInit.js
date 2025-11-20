(function($) {
	"use strict";

	UNCODE.justifiedGallery = function() {

	var breakPointMe = function( val ) {
		val = parseInt( val );
		if ( isNaN(val) ) {
			return false;
		}
		if ( val >= 1500 ) {
			return 1;
		} else if ( val < 1500 && val >= 960 ) {
			return 2;
		} else if ( val < 960 && val >= 570 ) {
			return 3;
		} else if ( val < 570 ) {
			return 4;
		}
	}

	var gutterByBreakpoint = function( bp, gutter ) {
		var ret;
		switch(gutter) {
		    case 'no-gutter':
		    	ret = 0;
		        break;
		    case 'px-gutter':
		    	ret = 1;
		        break;
		    case 'half-gutter':
		    	ret = 18;
		        break;
		    case 'double-gutter':
				switch(bp) {
				    case 3:
				    case 4:
				    	ret = 36;
				        break;
				    default:
				    	ret = 72;
				        break;
				}
		        break;
		    case 'triple-gutter':
				switch(bp) {
				    case 3:
				    case 4:
				    	ret = 36;
				        break;
				    default:
				    	ret = 108;
				        break;
				}
		        break;
		    case 'quad-gutter':
				switch(bp) {
				    case 2:
				    	ret = 108;
				        break;
				    case 3:
				    	ret = 72;
				        break;
				    case 4:
				    	ret = 36;
				        break;
				    default:
				    	ret = 144;
				        break;
				}
		        break;
		    default:
		    	ret = 36;//single-gutter
		}
		return ret;
	}

	if ($('.justified-layout').length > 0) {
		var justifiedContainersArray = [],
			typeGridArray = [],
			layoutGridArray = [],
			transitionDuration = [],
			$filterItems = [],
			$filters = $('.justified-system .isotope-filters'),
			$itemSelector = '.tmb',
			$items,
			itemMargin,
			correctionFactor = 0,
			firstLoad = true,
			isOriginLeft = $('body').hasClass('rtl') ? false : true,
			prevW = breakPointMe(UNCODE.wwidth);
		$('[class*="justified-container"]').each(function() {
			var isoData = $(this).data();
			transitionDuration.push($('.t-inside.animate_when_almost_visible', this).length > 0 ? 0 : '0.5s');
			if (isoData.type == 'metro') typeGridArray.push(true);
			else typeGridArray.push(false);
			if (isoData.layout !== undefined) layoutGridArray.push(isoData.layout);
			else layoutGridArray.push('justified');
			justifiedContainersArray.push($(this));
		});
		var init_justifiedGallery = function() {
			for (var i = 0, len = justifiedContainersArray.length; i < len; i++) {
				var justifiedSystem = $(justifiedContainersArray[i]).closest($('.justified-system')),
					justifiedId = justifiedSystem.attr('id'),
					$layoutMode = layoutGridArray[i],
					gutter = $(justifiedContainersArray[i]).data('gutter'),
					rowHeight = $(justifiedContainersArray[i]).data('row-height'),
					maxRowHeight = $(justifiedContainersArray[i]).data('max-row-height'),
					lastRow = $(justifiedContainersArray[i]).data('last-row'),
					margins;

				rowHeight = typeof rowHeight === 'undefined' || rowHeight === '' ? 250 : parseFloat(rowHeight);
				maxRowHeight = typeof maxRowHeight === 'undefined' || maxRowHeight === '' ? false : parseFloat(maxRowHeight);
				lastRow = typeof lastRow === 'undefined' || lastRow === '' ? 'nojustify' : lastRow;

				margins = gutterByBreakpoint(prevW, gutter);

				$(justifiedContainersArray[i]).justifiedGallery({
					rowHeight: rowHeight,
					maxRowHeight: maxRowHeight,
					margins: margins,
					cssAnimation: true,
					lastRow: lastRow,
					waitThumbnailsLoad: false
				}).one('jg.complete', function(){ onLayout($(this), 0); } );

				if ($(justifiedContainersArray[i]).hasClass('isotope-infinite') && $.fn.infinitescroll) {
					$(justifiedContainersArray[i]).infinitescroll({
							navSelector: '#' + justifiedId + ' .loadmore-button', // selector for the pagination container
							nextSelector: '#' + justifiedId + ' .loadmore-button a', // selector for the NEXT link (to page 2)
							itemSelector: '#' + justifiedId + ' .justified-layout .tmb, #' + justifiedId + ' .isotope-filters li', // selector for all items you'll retrieve
							animate: false,
							behavior: 'local',
							debug: false,
							loading: {
								selector: '#' + justifiedId + '.justified-system .justified-footer-inner',
								speed: 0,
								finished: undefined,
								msg: $('#' + justifiedId + ' .loadmore-button'),
							},
							errorCallback: function() {
								var justified_system = $(this).closest('.justified-system');
								$('.loading-button', justified_system).hide();
								$('.loadmore-button', justified_system).attr('style', 'display:none !important');
							}
						},
						// append the new items to galleryJustified on the infinitescroll callback function.
						function(newElements, opts) {
							var $galleryJustified = $(this),
								justifiedId = $galleryJustified.closest('.justified-system').attr('id'),
								filters = new Array(),
								$loading_button = $galleryJustified.closest('.justified-system').find('.loading-button'),
								$infinite_button = $galleryJustified.closest('.justified-system').find('.loadmore-button'),
								$numPages = $('a', $infinite_button).data('pages'),
								delay = 300;
							$('a', $infinite_button).html($('a', $infinite_button).data('label'));
							$infinite_button.show();
							$loading_button.hide();
							if ( $numPages != undefined && opts.state.currPage == $numPages) $infinite_button.hide();
							$('> li', $galleryJustified).remove();
							$.each($(newElements), function(index, val) {
								$(val).addClass('tmb-iso');
								if ($(val).is("li")) {
									filters.push($(val)[0]);
								}
								$(val).addClass('uncode-appended');
							});
							newElements = newElements.filter(function(x) {
								return filters.indexOf(x) < 0
							});
							$.each($(filters), function(index, val) {
								if ($('#' + justifiedId + ' a[data-filter="' + $('a', val).attr('data-filter') + '"]').length == 0) $('#' + justifiedId + ' .isotope-filters ul').append($(val));
							});
							$galleryJustified.justifiedGallery('norewind', onLayout($galleryJustified, newElements.length));
							if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
								var getLightbox = UNCODE.lightboxArray['ilightbox_' + justifiedId];
								if (typeof getLightbox === 'object') {
									getLightbox.refresh();
								} else {
									UNCODE.lightbox();
								}
							}
							if ( typeof twttr !== 'undefined' )
								twttr.widgets.load(justifiedContainersArray[i]);

							requestTimeout(function() {
								$galleryJustified.trigger('more-items-loaded');
								$(window).trigger('more-items-loaded');
								window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
							}, 1000);
						});
					if ($(justifiedContainersArray[i]).hasClass('isotope-infinite-button')) {
						var $infinite_justified = $(justifiedContainersArray[i]),
							$infinite_button = $infinite_justified.closest('.justified-system').find('.loadmore-button a');
						$infinite_justified.infinitescroll('pause');
						$infinite_button.on('click', function(event) {
							if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
								$.each(UNCODE.lightboxArray, function(index, val) {
									UNCODE.lightboxArray[index].destroy();
								});
							}
							event.preventDefault();
							var $justified_system = $(event.target).closest('.justified-system'),
							$infinite_justified = $justified_system.find('.justified-container'),
							justifiedId = $justified_system.attr('id');
							$(event.currentTarget).html(SiteParameters.loading);
							$infinite_justified.infinitescroll('resume');
							$infinite_justified.infinitescroll('retrieve');
							$infinite_justified.infinitescroll('pause');
							$infinite_justified.trigger('more-items-loaded');
							$(window).trigger('more-items-loaded');
							window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
						});
					}
				}
			}
		},
		onLayout = function(justifiedObj, startIndex) {
			justifiedObj.css('opacity', 1);
			justifiedObj.closest('.justified-system').find('.justified-footer').css('opacity', 1);
			$('.tmb', justifiedObj).addClass('justified-object-loaded');

			requestTimeout(function() {
				// window.dispatchEvent(UNCODE.boxEvent);
				UNCODE.adaptive();
				if (SiteParameters.dynamic_srcset_active === '1') {
					UNCODE.refresh_dynamic_srcset_size(justifiedObj);
				}
				if (typeof MediaElement === "function") {
					$(justifiedObj).find('audio,video').each(function() {
						$(this).mediaelementplayer({
								pauseOtherPlayers: false,
						});
					});
				}
				if ($(justifiedObj).find('.nested-carousel').length) {
					if (typeof UNCODE.carousel !== 'undefined') {
						UNCODE.carousel($(justifiedObj).find('.nested-carousel'));
					}
					requestTimeout(function() {
						boxAnimation($('.tmb', justifiedObj), startIndex, true, justifiedObj);
						justifiedObj.addClass('justified-gallery-finished')
						Waypoint.refreshAll();
					}, 200);
				} else {
					requestTimeout(function() {
						boxAnimation($('.tmb', justifiedObj), startIndex, true, justifiedObj);
						justifiedObj.addClass('justified-gallery-finished')
						Waypoint.refreshAll();
					}, 300);
				}
			}, 100);

		},
		boxAnimation = function(items, startIndex, sequential, container) {
			var $allItems = items.length - startIndex,
				showed = 0,
				index = 0;
			if (container.closest('.owl-item').length == 1) return false;
			$.each(items, function(index, val) {
				var elInner = $('> .t-inside', val);
				if (UNCODE.isUnmodalOpen && !val.closest('#unmodal-content')) {
					return;
				}
				if (val[0]) val = val[0];
				if (elInner.hasClass('animate_when_almost_visible') && !elInner.hasClass('force-anim')) {
					new Waypoint({
						context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
						element: val,
						handler: function() {
							var element = $('> .t-inside', this.element),
								parent = $(this.element),
								currentIndex = parent.index();
							var delay = (!sequential) ? index : ((startIndex !== 0) ? currentIndex - $allItems : currentIndex),
								delayAttr = parseInt(element.attr('data-delay'));
							if (isNaN(delayAttr)) delayAttr = 100;
							delay -= showed;
							var objTimeout = requestTimeout(function() {
								element.removeClass('zoom-reverse').addClass('start_animation');
								showed = parent.index();
							}, delay * delayAttr);
							parent.data('objTimeout', objTimeout);
							if (!UNCODE.isUnmodalOpen) {
								this.destroy();
							}
						},
						offset: '100%'
					})
				} else {
					elInner.removeClass('animate_when_almost_visible');
					$(val).addClass('no-waypoint-animation');
					/*if (elInner.hasClass('force-anim')) {
						elInner.addClass('start_animation');
					} else {
						elInner.css('opacity', 1);
					}*/
				}
				index++;
			});
		};
		$filters.on('click', 'a[data-filter]', function(evt) {
			var $filter = $(this),
				filterContainer = $filter.closest('.isotope-filters'),
				filterValue = $filter.attr('data-filter'),
				container = $filter.closest('.justified-system').find($('.justified-layout')),
				lastRow = container.data('last-row'),
				transitionDuration = 0,
				delay = 300,
				filterItems = [];

			lastRow = typeof lastRow === 'undefined' || lastRow === '' ? 'nojustify' : lastRow;

			var filter_items = function(){
				if (filterValue !== undefined) {
					$.each($('> .tmb > .t-inside', container), function(index, val) {
						var parent = $(val).parent(),
							objTimeout = parent.data('objTimeout');
						if (objTimeout) {
							$(val).removeClass('zoom-reverse');
							clearRequestTimeout(objTimeout);
						}
						if (transitionDuration == 0) {
							if ($(val).hasClass('animate_when_almost_visible')) {
								$(val).addClass('zoom-reverse').removeClass('start_animation');
							} else {
								$(val).addClass('animate_when_almost_visible zoom-reverse zoom-anim force-anim');
							}
						}
					});

					requestTimeout(function() {
						var $block,
							selector,
							lightboxElements,
							$boxes;

						if ( filterValue !== '' && filterValue !== '*' ) {
							$('[data-lbox^=ilightbox]', container).addClass('lb-disabled');
							selector = '.' + filterValue;
							$.each($(selector, container), function(index, block) {
								lightboxElements = $('[data-lbox^=ilightbox]', block);
								if (lightboxElements.length) {
									lightboxElements.removeClass('lb-disabled');
									container.data('lbox', $(lightboxElements[0]).data('lbox'));
								}
								filterItems.push(block);
							});
							container.justifiedGallery({
								filter: selector,
								lastRow: 'nojustify'
							});
						} else {
							container.justifiedGallery({
								filter: false,
								lastRow: lastRow
							});
							$('[data-lbox^=ilightbox]', $block).removeClass('lb-disabled');
							filterItems = $('> .tmb', container);
						}
						container.trigger('more-items-loaded');
						$(window).trigger('more-items-loaded');
						window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));

						$('.t-inside.zoom-reverse', container).removeClass('zoom-reverse');
						if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
							var getLightbox = UNCODE.lightboxArray[container.data('lbox')];
							if (typeof getLightbox === 'object') {
								getLightbox.refresh();
							} else {
								UNCODE.lightbox();
							}
						}

						if (transitionDuration == 0) {
							requestTimeout(function() {
								boxAnimation(filterItems, 0, false, container);
							}, 100);
						}
						requestTimeout(function() {
							Waypoint.refreshAll();
							container.trigger('more-items-loaded');
							$(window).trigger('more-items-loaded');
							window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
							if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
								$(document).trigger('uncode-scrolltrigger-refresh');
							}
						}, 2000);

					}, delay);
				} else {
					if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
						$.each(UNCODE.lightboxArray, function(index, val) {
							UNCODE.lightboxArray[index].destroy();
						});
					}
					$.each($('> .tmb > .t-inside', container), function(index, val) {
						var parent = $(val).parent(),
							objTimeout = parent.data('objTimeout');
						if (objTimeout) {
							$(val).removeClass('zoom-reverse').removeClass('start_animation')
							clearRequestTimeout(objTimeout);
						}
						if (transitionDuration == 0) {
							if ($(val).hasClass('animate_when_almost_visible')) {
								$(val).addClass('zoom-reverse').removeClass('start_animation');
							} else {
								$(val).addClass('animate_when_almost_visible zoom-reverse zoom-anim force-anim');
							}
						}
					});
					if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
						UNCODE.lightbox();
					}
					container.parent().addClass('justified-loading');
					container.trigger('more-items-loaded');
					$(window).trigger('more-items-loaded');
					window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
				}
			};

			if (!$filter.hasClass('active')) {
				/** Scroll top with filtering */
				if (filterContainer.hasClass('filter-scroll')) {
                    var calc_scroll = SiteParameters.index_pagination_scroll_to != false ? eval(SiteParameters.index_pagination_scroll_to) : container.closest('.row-parent').offset().top;
                    calc_scroll -= UNCODE.get_scroll_offset();

					var bodyTop = document.documentElement['scrollTop'] || document.body['scrollTop'],
						delta = bodyTop - calc_scroll,
						scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(delta) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed,
						filterTolerance = false,
						filter_timeout;
					if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

					if ( !UNCODE.isFullPage ) {
						if (scrollSpeed == 0) {
							$('html, body').scrollTop(calc_scroll);
							UNCODE.scrolling = false;
							filter_items();
						} else {

							if ( bodyTop <= (calc_scroll+20) && bodyTop >= (calc_scroll-20) ) {
								filter_items();
								filterTolerance = true;
							}

							$('html, body').animate({
								scrollTop: calc_scroll
							},{
								easing: 'easeInOutQuad',
								duration: scrollSpeed,
								complete: function(){
									UNCODE.scrolling = false;
									if ( !filterTolerance ) {
										filter_timeout = setTimeout(function(){
											clearTimeout(filter_timeout);
											filter_items();
										}, 200);
									}
								}
							});
						}
					}
				} else {
					filter_items();
				}
			}
			evt.preventDefault();
		});

		$filters.each(function(i, buttonGroup) {
			var $buttonGroup = $(buttonGroup);
			$buttonGroup.on('click', 'a', function() {
				$buttonGroup.find('.active').removeClass('active');
				$(this).addClass('active');
			});

			var $cats_mobile_trigger = $('.menu-smart--filter-cats_mobile-toggle-trigger', $buttonGroup),
				$cats_mobile_toggle = $('.menu-smart--filter-cats_mobile-toggle', $buttonGroup),
				$cats_filters = $('.menu-smart--filter-cats', $buttonGroup);
			$buttonGroup.on('click', 'a.menu-smart--filter-cats_mobile-toggle-trigger', function(e) {
				e.preventDefault();
				$cats_filters.slideToggle(400, 'easeInOutCirc');
			});
		});
		window.addEventListener('boxResized', function(e) {
			if ( prevW !== breakPointMe(UNCODE.wwidth) ) {
				prevW = breakPointMe(UNCODE.wwidth);
				$.each($('.justified-layout'), function(index, val) {
					var gutter = $(this).data('gutter'),
						margins = gutterByBreakpoint( prevW, gutter);
					$(this).justifiedGallery({
						margins: margins
					});
					$(this).find('.mejs-video,.mejs-audio').each(function() {
						$(this).trigger('resize');
					});
				});
			}
		}, false);

		init_justifiedGallery();
	};
};


})(jQuery);
