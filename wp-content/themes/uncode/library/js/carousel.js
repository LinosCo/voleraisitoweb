(function($) {
	"use strict";

	UNCODE.carousel = function(container) {
	var $owlContainers = $('.owl-carousel-container', container);
	$owlContainers.each(function() {
		var $owlContainer = $(this),
			$owlWrapper = $owlContainer.closest('.owl-carousel-wrapper'),
			$owlSelector = $('> [class*="owl-carousel"]', $owlContainer),
			values = {},
			tempTimeStamp,
			newWidth = UNCODE.wwidth,
			$owlInsideEqual = [];
		$owlSelector.each(function() {
			var itemID = $(this).attr('id'),
				$elSelector = $(('#' + itemID).toString());
			values['id'] = itemID;
			values['items'] = 1;
			values['columns'] = 3;
			values['fade'] = false;
			values['nav'] = false;
			values['navmobile'] = false;
			values['navskin'] = 'light';
			values['navspeed'] = 400;
			values['dots'] = false;
			values['dotsmobile'] = false;
			values['loop'] = false;
			values['autoplay'] = false;
			values['timeout'] = 3000;
			values['autoheight'] = false;
			values['stagepadding'] = 0;
			values['margin'] = 0;
			values['lg'] = 1;
			values['md'] = 1;
			values['sm'] = 1;
			$.each($(this).data(), function(i, v) {
				values[i] = v;
			});

			if ($(this).closest('.uncode-slider').length) {
				values['navskin'] = '';
				values['navmobile'] = false;
				//values['dotsmobile'] = true;
			} else {
				values['navskin'] = ' style-'+values['navskin']+' style-override';
			}

			var setIndexActive = function(event, init){
				var init = typeof init === 'undefined' ? false : init,
					thiis = $(event.currentTarget);
				if (tempTimeStamp != event.timeStamp && ( init || ( !UNCODE.isFullPage || ( UNCODE.isFullPage && thiis.closest('.fp-section').hasClass('uncode-scroll-active') ) ) ) ) {
					var scrolltop = $(document).scrollTop(),
						size = event.page.size,
						i;
					var setIndex = requestTimeout(function() {
						for ( i = 0; i < size; i++ ) {
							var itemCont = event.item.index != null ? (event.item.index + i) : i;
							var currentItem = thiis.find("> .owl-stage-outer > .owl-stage > .owl-item")[itemCont];
							if (thiis.closest('.row-slider').length) {
								if (currentItem == undefined) {
									currentItem = thiis.children()[i];
								}
								if ($(currentItem).closest('#page-header').length) {
									if ($('.row-container > .row > .row-inner > div > .style-dark', currentItem).closest('.uncode-slider').length) {
										UNCODE.switchColorsMenu(scrolltop, 'dark');
									} else if ($('.row-container > .row > .row-inner > div > .style-light', currentItem).closest('.uncode-slider').length) {
										UNCODE.switchColorsMenu(scrolltop, 'light');
									}
								}
								var owlCustomNav = $elSelector.closest('.owl-carousel-wrapper-nav').find('.uncode-owl-nav-out.skin-inherit');
								if (owlCustomNav.length) {
									if ($('.row-container > .row > .row-inner > div > .style-dark', currentItem).closest('.uncode-slider').length) {
										owlCustomNav.addClass('style-dark').removeClass('style-light');
									} else if ($('.row-container > .row > .row-inner > div > .style-light', currentItem).closest('.uncode-slider').length) {
										owlCustomNav.addClass('style-light').removeClass('style-dark');
									}
								}
							}
							var itendIndex = $(currentItem).attr('data-index');
							if ( isNaN(itendIndex) ) {
								itendIndex = 1;
							}
							$elSelector.find('.owl-item:not(.new-indexed)').removeClass('index-active');
							$elSelector.find('.owl-item[data-index="' + itendIndex + '"]').addClass('index-active').addClass('new-indexed');
							if ($.fn.counterUp) {
								$elSelector.find('.owl-item[data-index="' + itendIndex + '"] .uncode-counter').each(function(){
									var $counter = $(this);
									$counter.addClass('started').counterUp({
										delay: 10,
										time: 1500
									});
								});
							}
						}
						$elSelector.find('.owl-item.new-indexed').removeClass('new-indexed');
					}, 200);
				}
				tempTimeStamp = event.timeStamp;
			}

			/** Initialize */
			$elSelector.on('initialize.owl.carousel', function(event) {
				if (typeof UNCODE.owlNav !== 'undefined') {
					UNCODE.owlNav(itemID, event);
				}

				if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
					window.parent.vc.events.on('shortcodeView:beforeUpdate shortcodeView:destroy', function(model) {
						var shortcode = model.attributes.shortcode,
							$el = model.view.$el,
							$row_wrap = $el.closest('.row');
						if ( shortcode === 'uncode_carousel_nav' && typeof UNCODE.owlNav !== 'undefined') {
							$row_wrap.find('.owl-carousel-wrapper-nav .uncode-owl-nav-out').remove();
						}
					});
					window.parent.vc.events.on('shortcodeView:updated', function(model) {
						var shortcode = model.attributes.shortcode;
						if ( shortcode === 'uncode_carousel_nav' && typeof UNCODE.owlNav !== 'undefined') {
							tempTimeStamp = Math.floor(Date.now() / 1000);
						}
					});
					window.parent.vc.events.on('shortcodeView:updated shortcodeView:ready', function(model) {
						var shortcode = model.attributes.shortcode;
						if ( shortcode === 'uncode_carousel_nav' && typeof UNCODE.owlNav !== 'undefined') {
							UNCODE.owlNav(itemID, event);
							$elSelector.trigger('refresh.owl.carousel');
						}
					});
				}
			});

			/** Initialized */
			$elSelector.on('initialized.owl.navigation', function(event) {
				$('.owl-dot', event.currentTarget).each(function(key, val){
					$(val).attr('aria-label', SiteParameters.uncode_slide_label + ' ' + (key+1));
				});
			});

			$elSelector.on('initialized.owl.carousel', function(event) {

				if ( $('.isotope-container', event.currentTarget).length ) {
					window.dispatchEvent(UNCODE.boxEvent);
				}

				$('.owl-dot.active', $elSelector).on('click', function(){
					return false;
				});

				var thiis = $(event.currentTarget),
					// get the time from the data method
					time = thiis.data("timer-id"),
					rowParent = thiis.closest('.row-parent');

				if ( typeof rowParent[0] !== 'undefined' ) {
					rowParent[0].dispatchEvent(new CustomEvent('owl-carousel-initialized'));
				}

				if (time) {
					clearRequestTimeout(time);
				}

				thiis.addClass('showControls');
				var new_time = requestTimeout(function() {
					thiis.closest('.owl-carousel-container').removeClass('owl-carousel-loading');
					if (thiis.hasClass('owl-height-viewport'))
						setItemsRelHeight(thiis);
					if (thiis.hasClass('owl-height-equal'))
						setItemsHeight(thiis);
					if (!UNCODE.isMobile && !$elSelector.closest('.header-wrapper').length) navHover($elSelector.parent());
					if (thiis.closest('.unequal, .unexpand').length) {
						UNCODE.setRowHeight(rowParent[0], true);
					}
					if (SiteParameters.dynamic_srcset_active === '1') {
						UNCODE.refresh_dynamic_srcset_size(thiis);
					}
				}, 350);
				// save the new time
				thiis.data("timer-id", new_time);

				var scrolltop = $(document).scrollTop();
				thiis.closest('.uncode-slider').find('video').removeAttr('poster');

				//if (!UNCODE.isMobile) {
					/** fix autoplay when visible **/
				$(window).on('load', function(){
					if (thiis.data('autoplay')) {
						if ( !thiis.closest('.sticky-element').length ) {
							thiis.trigger('stop.autoplay.owl');
						} else {
							thiis.trigger('play.owl.autoplay');
						}
					}
					if (UNCODE.isUnmodalOpen && !thiis.closest('#unmodal-content')) {
						return;
					}
					if ( ! thiis.closest('.sticky-element').length ) {
						var carouselInView = new Waypoint.Inview({
							context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
							element: thiis[0],
							exited: function() {
								var el = $(this.element);
								if (el.data('autoplay') ) {
									el.trigger('stop.owl.autoplay');
									el.data('stopped','true');
								}
							},
							enter: function(direction) {
								var el = $(this.element);
								requestTimeout(function() {
									if (el.data('autoplay')) {
										el.trigger('play.owl.autoplay');
										el.data('stopped','false');
									}
								}, 100);
							}
						});
					}
					if ( typeof window.lenis !== 'undefined' && window.lenis !== null ) {
						setTimeout(function(){
							window.lenis.resize();
						}, 1000);
					}
			  	
				});
				//}

				// $(window).on('frontend:carousel_updated', function(){
				// 	Waypoint.refreshAll();
				// });

				if (!thiis.closest('.isotope-system').length) {
					requestTimeout(function() {
						animate_thumb($('.t-inside', el), event);
					}, 400);
				} else {
					requestTimeout(function() {
						thiis.closest('.isotope-container').isotope('layout');
					}, 400);
				}

				var currentItem = thiis.find("> .owl-stage-outer > .owl-stage > .owl-item")[event.item.index],
				currentIndex = $(currentItem).attr('data-index');

				$.each($('.owl-item:not(.active) .start_animation', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeClass('start_animation');
					}
				});
				$.each($('.owl-item:not(.active) .already-animated', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeClass('already-animated');
					}
				});

				$.each($('.owl-item:not(.active) [data-animated="yes"]', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeAttr('data-animated');
					}
				});

				$.each($('.owl-item.cloned', thiis), function(index, val) {
					$('.t-entry-visual-cont > a', $(val)).attr('data-lbox-clone', true);
				});

				$.each($('.owl-item:not(.active)', thiis), function(index, val) {
					if ($(val).attr('data-index') != currentIndex) {
						$('.start_animation:not(.t-inside)', val).removeClass('start_animation');
						$('.already-animated:not(.t-inside)', val).removeClass('already-animated');
					}
					if ($(val).attr('data-index') != currentIndex) {
						$('[data-animated="yes"]:not(.t-inside)', val).removeAttr('data-animated');
					}
					if ($(val).attr('data-index') == currentIndex) {
						$('.animate_when_almost_visible:not(.t-inside), .animate_inner_when_almost_visible:not(.t-inside)', val).addClass('start_animation');
					}
				});

				if (thiis.closest('.uncode-slider').length) {
					var el = thiis.closest('.row-parent')[0],
						section = thiis.closest('.vc_section');
					if ( section.length ) {
						el = $('> .row-parent', section)[0];
					}
					if ($(el).data('imgready')) {
						firstLoaded(el, event);
					} else {
						el.addEventListener("imgLoaded", function(el) {
							firstLoaded(el.target, event);
						}, false);
					}
					var transHeight = $('.hmenu .menu-transparent.menu-primary .menu-container').height() - UNCODE.bodyBorder;
					if (transHeight != null) {
						requestTimeout(function() {
							thiis.closest('.uncode-slider').find('.owl-prev, .owl-next').css('paddingTop', transHeight / 2 + 'px');
						}, 100);
					}
				} else {
					var el = thiis;
					el.closest('.uncode-slider').addClass('slider-loaded');
				}

				requestTimeout(function() {
					if (typeof UNCODE.bigText !== 'undefined') {
						UNCODE.bigText(thiis);
					}
					if (thiis.closest('.uncode-slider').length || thiis.closest('.row').find('.uncode-owl-nav-in').length) {
						if (thiis.data('autoplay')) pauseOnHover(thiis);
					}
				}, 500);

				if (thiis.closest('.unequal').length) {
					$owlInsideEqual.push(thiis.closest('.row-parent'));
				}

				var containerClasses = '',
					containerStyle = '';
				if ( $('.owl-dots-classes', $owlContainer).length ) {
					containerClasses = $('.owl-dots-classes', $owlContainer).attr('class');
					containerStyle = $('.owl-dots-classes', $owlContainer).attr('style');
					$('.owl-dots-classes', $owlContainer).remove();
				}

				if ( containerClasses !== '' ) {
					requestTimeout(function() {
						if ( containerClasses !== '' )
							$('.owl-dots', $owlContainer).attr('style', containerStyle);
						if ( containerStyle !== '' )
							$('.owl-dots', $owlContainer).addClass(containerClasses);
					}, 100);
				}

				$.each($('.column_child.pos-bottom', thiis), function(index, val) {
					$(val).closest('.row-inner').css({
						'margin-top': '-1px'
					});
				});

				if ($.fn.isotope) {
					if ( thiis.closest('.isotope-container').length ) {
						if (thiis.closest('.isotope-container').data('isotope')) {
							requestTimeout(function(){
								thiis.closest('.isotope-container').isotope('layout');
							}, 300);
						}
						$(window).on('load', function(){
							if (thiis.closest('.isotope-container').data('isotope')) {
								thiis.closest('.isotope-container').isotope('layout');
							}
						});
					}
				}

				if (thiis.data('autoplay')) {
					$(window).on('menuOpen', function(){
						thiis.trigger('stop.owl.autoplay');
						thiis.data('stopped','true');
					}).on('menuClose', function(){

					});
				}
				$(window).on('menuClose', function(){
					if (thiis.data('autoplay')) {
						thiis.trigger('play.owl.autoplay');
						thiis.data('stopped','false');
					}
				});

				setIndexActive(event, true);

				var nested_a = $('a[data-lbox]:not(.lb-disabled):not([data-lbox-init]):not([data-album])').filter(function( index ) {
						return !$(this).closest('.nested-carousel').length;
					}),
					$_galleries = $('.isotope-container:not([data-lbox-init]), .owl-carousel:not([data-lbox-init]), .custom-grid-container:not([data-lbox-init]), .index-scroll-wrapper:not([data-lbox-init]), .justified-gallery:not([data-lbox-init]), .uncode-single-media-wrapper:not([data-lbox-init]), .woocommerce-product-gallery:not([data-lbox-init]), .icon-box:not([data-lbox-init]), .grid-container:not([data-lbox-init])', thiis).has(nested_a),
					$galleries = $_galleries.filter(function( index ) {
						return !$(this).closest('.owl-carousel').length || $(this).is('.owl-carousel');
					});

				if (typeof UNCODE.lightgallery !== 'undefined' && SiteParameters.lbox_enhanced) {
					UNCODE.lightgallery( $galleries );
				}

				if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
					$(document).trigger('uncode-scrolltrigger-refresh');
				}
			});

			$elSelector.on('resized.owl.carousel', function(event) {
				$('.owl-dot', event.currentTarget).each(function(key, val){
					$(val).attr('aria-label', SiteParameters.uncode_slide_label + ' ' + (key+1));
				});
			});

			$elSelector.on('resized.owl.carousel', function(event) {
				var thiis = $(event.currentTarget);
				// if ($(this).closest('.nested-carousel').length) {
				// 	requestTimeout(function() {
				// 		window.dispatchEvent(UNCODE.boxEvent);
				// 	}, 200);
				// }
				if ( thiis.hasClass('owl-height-equal') )
					setItemsHeight(thiis);

				if ( UNCODE.wwidth > UNCODE.mediaQuery || ( UNCODE.wwidth <= UNCODE.mediaQuery && newWidth !== UNCODE.wwidth ) ) {
					newWidth = UNCODE.wwidth;
					setItemsRelHeight($elSelector);
				}

				setIndexActive(event);

				if (SiteParameters.dynamic_srcset_active === '1') {
					UNCODE.refresh_dynamic_srcset_size(thiis);
				}

				if ($.fn.isotope) {
					$(window).on('load', function(){
						if ($(event.currentTarget).closest('.isotope-container').data('isotope')) {
							$(event.currentTarget).closest('.isotope-container').isotope('layout');
						}
					});
				}

				if ( typeof window.lenis !== 'undefined' && window.lenis !== null ) {
					setTimeout(function(){
						window.lenis.resize();
					}, 1000);
				}
				if ( typeof ScrollTrigger !== 'undefined' && ScrollTrigger !== null ) {
					$(document).trigger('uncode-scrolltrigger-refresh');
				}
			});

			$elSelector.on('refreshed.owl.carousel', function(event) {
				setIndexActive(event);
			});

			/** detect resize window for fluid height layout */
			var setFluidResize;
			function manageFluidCarouseHeight() {
				clearRequestTimeout(setFluidResize);
				setFluidResize = requestTimeout(function(){
					if ( UNCODE.wwidth > UNCODE.mediaQuery || ( UNCODE.wwidth <= UNCODE.mediaQuery && newWidth !== UNCODE.wwidth ) ) {
						newWidth = UNCODE.wwidth;
						setItemsRelHeight($elSelector);
					}
				}, 100);
			}
			window.addEventListener('resize', manageFluidCarouseHeight);

			/** Change */
			$elSelector.on('change.owl.carousel', function(event) {
				if (!UNCODE.isMobile) UNCODE.owlStopVideo(event.currentTarget);
			});

			/** Changed */
			$elSelector.on('changed.owl.carousel', function(event) {
				var $row = $elSelector.parents('.row')[0];
				if ( typeof $row !== 'undefined' ) {
					$row.dispatchEvent(new CustomEvent('owl-carousel-changed'));
				}
				setIndexActive(event);
			});

			var checkDrag = function(e) {
				$elSelector.addClass('owl-dragging');
			};
			$elSelector.on('drag.owl.carousel', function(event) {
				document.addEventListener("mousemove", checkDrag);
			});

			$elSelector.on('dragged.owl.carousel', function(event) {
				$elSelector.removeClass('owl-dragging');
				document.removeEventListener("mousemove", checkDrag);
			});

			$elSelector.on('translate.owl.carousel', function(event) {
				if (UNCODE.isMobile) {
					$(event.currentTarget).addClass('owl-translating');
				}
			});

			/** Translated */
			$elSelector.on('translated.owl.carousel', function(event) {

				var thiis = $(event.currentTarget),
					currentItem = thiis.find("> .owl-stage-outer > .owl-stage > .owl-item")[event.item.index],
					currentIndex = $(currentItem).attr('data-index'),
					stagePadding = thiis.data('stagepadding');

				stagePadding = (stagePadding == undefined || stagePadding == 0) ? false : true;

				if (!UNCODE.isMobile) {
					UNCODE.owlPlayVideo(thiis);
				}

				requestTimeout(function(){
					var lastDelayElems = animate_elems($('.owl-item.index-active', thiis));
					var lastDelayThumb = animate_thumb($('.owl-item' + (stagePadding ? '' : '.active') + ' .t-inside', thiis), event);
					if (thiis.closest('.uncode-slider').length && thiis.data('autoplay')) {
						if (lastDelayElems == undefined) lastDelayElems = 0;
						if (lastDelayThumb == undefined) lastDelayThumb = 0;
						var maxDelay = Math.max(lastDelayElems, lastDelayThumb);
						thiis.trigger('stop.owl.autoplay');
						requestTimeout(function() {
							if (!thiis.hasClass('owl-mouseenter') && thiis.data('stopped') != 'true') thiis.trigger('play.owl.autoplay');
						}, maxDelay);
					}
				}, 200);

				$.each($('.owl-item:not(.active) .start_animation', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeClass('start_animation');
					}
				});

				$.each($('.owl-item:not(.active) .already-animated', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeClass('already-animated');
					}
				});

				$.each($('.owl-item:not(.active) [data-animated="yes"]', $(event.target)), function(index, val) {
					if ($(val).closest('.uncode-slider').length) {
						$(val).removeAttr('data-animated');
					}
				});

				$.each($('.owl-item:not(.active)', thiis), function(index, val) {
					if ($(val).attr('data-index') != currentIndex) {
						$('.start_animation:not(.t-inside)', val).removeClass('start_animation');
						$('.already-animated:not(.t-inside)', val).removeClass('already-animated');
					}
					if ($(val).attr('data-index') != currentIndex) {
						$('[data-animated="yes"]:not(.t-inside)', val).removeClass('start_animation');
					}
					if ($(val).attr('data-index') == currentIndex) {
						$('.animate_when_almost_visible:not(.t-inside), .animate_inner_when_almost_visible:not(.t-inside)', val).addClass('start_animation');
					}
				});

				if (UNCODE.isMobile) {
					thiis.removeClass('owl-translating');
				}

				setIndexActive(event);
			});

			if (UNCODE.wwidth < UNCODE.mediaQuery && $(this).data('stagepadding') > 25) values['stagepadding'] = 25;

			/** Init carousel */
			$elSelector.not('.showControls').owlCarousel({
				items: values['items'],
				animateIn: (values['fade'] == true) ? 'fadeIn' : null,
				animateOut: (values['fade'] == true) ? 'fadeOut' : null,
				nav: values['nav'],
				dots: values['dots'],
				loop: values['loop'],
				stagePadding: values['stagepadding'],
				margin: 0,
				video: true,
				autoWidth: false,
				autoplay: false,
				autoplayTimeout: values['timeout'],
				autoplaySpeed: values['navspeed'],
				autoplayHoverPause: $(this).closest('.uncode-slider').length ? false : true,
				autoHeight: ( $(this).hasClass('owl-height-equal') ? false : values['autoheight'] ),
				rtl: $('body').hasClass('rtl') ? true : false,
				fluidSpeed: true,
				navSpeed: values['navspeed'],
				dotsSpeed: values['navspeed'] / values['items'],
				navElement: ['button type="button" aria-label="' + SiteParameters.uncode_prev_label + '"', 'button type="button" aria-label="' + SiteParameters.uncode_next_label + '"'],
				navClass: [ 'owl-prev'+values['navskin'], 'owl-next'+values['navskin'] ],
				navText: ['<div class="owl-nav-container btn-default btn-hover-nobg" tabindex="0"><i class="fa fa-fw fa-angle-left"></i></div>', '<div class="owl-nav-container btn-default btn-hover-nobg" aria-label="' + SiteParameters.uncode_next_label + '" tabindex="0"><i class="fa fa-fw fa-angle-right"></i></div>'],
				navContainer: values['nav'] && ! SiteParameters.is_frontend_editor ? $elSelector : false,
				responsiveClass: true,
				responsiveBaseElement: '.box-container',
				responsive: {
					0: {
						items: values['sm'],
						nav: values['navmobile'],
						dots: values['dotsmobile'],
						dotsSpeed: values['navspeed'] / values['sm'],
					},
					480: {
						items: values['sm'],
						nav: values['navmobile'],
						dots: values['dotsmobile'],
						dotsSpeed: values['navspeed'] / values['sm'],
					},
					570: {
						items: values['md'],
						nav: values['navmobile'],
						dots: values['dotsmobile'],
						dotsSpeed: values['navspeed'] / values['md'],
					},
					960: {
						items: values['lg'],
						dotsSpeed: values['navspeed'] / values['lg'],
					}
				}
			});

			var transDuration = parseFloat(values['navspeed']) * 0.3;
			var transDuration2 = parseFloat(values['navspeed']) * 0.8;

			$('.owl-item .tmb', $elSelector).css({
				'-webkit-transition-delay': transDuration + 'ms',
				'-moz-transition-delay': transDuration + 'ms',
				'-o-transition-delay': transDuration + 'ms',
				'transition-delay': transDuration + 'ms',
				'-webkit-transition-duration': transDuration2 + 'ms',
				'-moz-transition-duration': transDuration2 + 'ms',
				'-o-transition-duration': transDuration2 + 'ms',
				'transition-duration': transDuration2 + 'ms',
			});

			requestTimeout(function() {
				for (var i = $owlInsideEqual.length - 1; i >= 0; i--) {
					UNCODE.setRowHeight($owlInsideEqual[i]);
				};
			}, 300);

			$(window).on('load', function(){
				var $elCarousel = $elSelector.data('owl.carousel');
				if ( typeof $elCarousel !== 'undefined' ) {
					$elCarousel.trigger('refreshed');
					for (var i = $owlInsideEqual.length - 1; i >= 0; i--) {
						UNCODE.setRowHeight($owlInsideEqual[i]);
					};
				}
			});

			$( document.body ).on( 'added-owl-item', function( e, carousel_id, $new_slide, randId ) {
				if ( $('#' + carousel_id).data( 'added-id' ) != randId ) {
					$('#' + carousel_id).data( 'added-id', randId ).trigger( 'add.owl.carousel', $new_slide ).trigger('refresh.owl.carousel');
					$('#' + carousel_id).find('.owl-item').each( function() {
						var $item = $(this),
							index = ( $item.index() + 1 );
						$item.attr('data-index', index);
					});
				}
			});

			if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
				window.parent.vc.events.on( 'removed-owl-item', function( carousel_id, item_index, randId ) {
					if ( $('#' + carousel_id).data( 'added-id' ) != randId ) {
						$('#' + carousel_id).data( 'added-id', randId ).trigger('remove.owl.carousel', [ (item_index-1) ]).trigger('refresh.owl.carousel');
						$('#' + carousel_id).find('.owl-item').each( function() {
							var $item = $(this),
								index = ( $item.index() + 1 );
							$item.attr('data-index', index);
						});
					}
				});
			}

		});

		function firstLoaded(el, event) {
			var el = $(el),
			uncode_slider = el.find('.uncode-slider');
			el.find('.owl-carousel').css('opacity', 1);
			uncode_slider.addClass('slider-loaded');
			if (typeof UNCODE.bigText !== 'undefined') {
				UNCODE.bigText(el.find('.owl-item.active'));
			}
			//if (!UNCODE.isMobile) {
				requestTimeout(function() {
					var lastDelayElems = animate_elems(el.find('.owl-item.index-active'));
					var lastDelayThumb = animate_thumb(el.find('.owl-item.active .t-inside'), event);
					if (uncode_slider.length && el.find('.owl-carousel').data('autoplay')) {
						if (lastDelayElems == undefined) lastDelayElems = 0;
						if (lastDelayThumb == undefined) lastDelayThumb = 0;
						var maxDelay = Math.max(lastDelayElems, lastDelayThumb);
						$('> .owl-carousel', uncode_slider).trigger('stop.owl.autoplay');
						requestTimeout(function() {
							$('> .owl-carousel', uncode_slider).trigger('play.owl.autoplay');
						}, maxDelay);
					}
				}, 500);

			//}
		}

		function navHover(el) {
			var $owlCont = el,
				$owlPrev = $owlCont.find('.owl-prev'),
				$owlNext = $owlCont.find('.owl-next'),
				$owlDots = $owlCont.find('.owl-dots-inside .owl-dots'),
				$owlPagination = $owlCont.next(),
				owlPrevW = $owlPrev.outerWidth(),
				owlNextW = $owlNext.outerWidth(),
				owlDotsH = $owlDots.innerHeight(),
				owlTime = 400,
				owlNested = $owlCont.parent().parent().hasClass('nested-carousel');
			if ( $('body').hasClass('rtl') ) {
				$owlPrev.css("margin-right", -owlPrevW);
				$owlNext.css("margin-left", -owlNextW);
			} else {
				$owlPrev.css("margin-left", -owlPrevW);
				$owlNext.css("margin-right", -owlNextW);
			}
			if (!owlNested) $owlDots.css("bottom", -owlDotsH);
			$owlCont.mouseenter(function() {
				owlNested = $owlCont.parent().parent().hasClass('nested-carousel');
				$owlPrev.add($owlNext).css({
					marginLeft: 0,
					marginRight: 0
				});
				if (!owlNested) {
					$owlDots.css({
						opacity: 1,
						bottom: 0
					});
				}
			}).mouseleave(function() {
				owlNested = $owlCont.parent().parent().hasClass('nested-carousel');
				if ( $('body').hasClass('rtl') ) {
					$owlPrev.css("margin-right", -owlPrevW);
					$owlNext.css("margin-left", -owlNextW);
				} else {
					$owlPrev.css("margin-left", -owlPrevW);
					$owlNext.css("margin-right", -owlNextW);
				}
				if (!owlNested) {
					$owlDots.css({
						opacity: 1,
						bottom: -owlDotsH
					});
				}
			});
		};

		function animate_elems($this) {
			var lastDelay;
			$.each($('.animate_when_almost_visible:not(.t-inside), .animate_inner_when_almost_visible:not(.t-inside), .animate_when_parent_almost_visible:not(.t-inside)', $this), function(index, val) {
				var element = $(val),
					delayAttr = element.attr('data-delay'),
					$first_item = element.closest('.owl-item[data-index="1"]');

				if ( $first_item.length && $first_item.attr('data-already-reached') !== 'true' && !$first_item.closest('#page-header').length ) {
					return false;
				}

				if (delayAttr == undefined) delayAttr = 0;
				requestTimeout(function() {
					element.addClass('start_animation');
				}, delayAttr);
				lastDelay = delayAttr;
			});
			return lastDelay;
		}

		function animate_thumb(items, event) {
			var lastDelay,
				itemIndex,
				thiis = $(event.currentTarget),
				tempIndex = (thiis.data('tempIndex') == undefined) ? $('.owl-item.active', thiis).first().index() : thiis.data('tempIndex'),
				numActives = $('.owl-item.active', thiis).length,
				stagePadding = thiis.data('stagepadding');

			stagePadding = (stagePadding == undefined || stagePadding == 0) ? false : true;

			thiis.data('tempIndex', event.item.index);
				$.each(items, function(index, val) {
					var parent = $(val).closest('.owl-item');
					if (UNCODE.isUnmodalOpen && !val.closest('#unmodal-content')) {
						return;
					}
					if (!$(val).hasClass('start_animation')) {
						if (parent.hasClass('active') || stagePadding || $owlWrapper.hasClass('carousel-animation-first')) {
							var thumbInView = new Waypoint.Inview({
							  context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
							  element: val,
							  enter: function(direction) {
								var element = $(this.element),
										delayAttr = parseInt(element.attr('data-delay')),
										itemIndex = element.closest('.owl-item').index() + 1,
										diffItem = Math.abs(itemIndex - tempIndex) - 1;
									if (itemIndex > tempIndex) {
										thiis.data('tempIndex', itemIndex);
									}
									if (isNaN(delayAttr)) delayAttr = 100;
									if (stagePadding) {
										var objTimeout = requestTimeout(function() {
											element.addClass('start_animation');
										}, index * delayAttr);
										lastDelay = index * delayAttr;
									} else {
										$('.owl-item.cloned[data-index="'+(element.closest('.owl-item').data('index'))+'"] .t-inside', thiis).addClass('start_animation');
										var objTimeout = requestTimeout(function() {
											element.addClass('start_animation');
										}, diffItem * delayAttr);
										lastDelay = diffItem * delayAttr;
									}
									parent.data('objTimeout', objTimeout);
									if (!UNCODE.isUnmodalOpen) {
										this.destroy();
									}
								}
							});
						}
					}
				});
				return lastDelay;
			}

		function setItemsHeight(item) {
			$.each($('.owl-item', item), function(index, val) {
				var availableThumbHeight = $('.t-inside', $(val)).height(),
				innerThumbHeight = $('.t-entry-text-tc', $(val)).outerHeight(),
				difference = availableThumbHeight - innerThumbHeight;
				if ($('.tmb-content-under', val).length) {
					var visualPart = $('.t-entry-visual', val);
					if (visualPart.length) {
						difference -= $('.t-entry-visual', val).height();
					}
				}
				if (! $('.tmb-content-lateral', val).length)
					$('.t-entry > *:last-child', val).css( 'transform', 'translateY('+difference+'px)' );
			});
		}

		function setItemsRelHeight(item) {
			$.each($('.owl-item', item), function(index, val) {
				var $rowContainer = $(item).parents('.row-parent').eq(0),
					paddingRow = parseInt($rowContainer.css('padding-top')) + parseInt($rowContainer.css('padding-bottom')),
					$colContainer = $(item).parents('.uncell').eq(0),
					paddingCol = parseInt($colContainer.css('padding-top')) + parseInt($colContainer.css('padding-bottom')),
					winHeight = UNCODE.wheight,
					multiplier_h = parseInt($(item).attr('data-vp-height')),
					data_viewport_h,
					consider_menu = $(item).data('vp-menu');

				if ( consider_menu ) {
					winHeight = winHeight - UNCODE.menuHeight;
				}

				data_viewport_h = Math.ceil(winHeight / (100 / multiplier_h) ) - ( paddingRow + paddingCol );
				$('.t-inside', val).css( 'height', data_viewport_h );
			});
		}

		function pauseOnHover(slider) {
			var $owlCustomNavSels = slider.closest('.row').find('.uncode-nav-dots, .uncode-nav-prev, .uncode-nav-next');
			$('.owl-dots, .owl-prev, .owl-next', slider).add($owlCustomNavSels).on({
				mouseenter: function () {
					$(slider).addClass('owl-mouseenter');
					$(slider).trigger('stop.owl.autoplay');
				},
				mouseleave: function () {
					$(slider).removeClass('owl-mouseenter');
					$(slider).trigger('play.owl.autoplay');
				}
			});
		}
	});
};

UNCODE.owlPlayVideo = function(carousel) {
	var player, iframe;
	$('.owl-item.active .uncode-video-container', carousel).each(function(index, val) {
		var content = $(val).html();
		if (content == '') {
			var getCloned = $('.owl-item:not(.active) .uncode-video-container[data-id="'+$(this).attr('data-id')+'"]').children().first().clone();
			$(val).append(getCloned);
		}
		if ($(this).attr('data-provider') == 'vimeo') {
			iframe = $(this).find('iframe');
			player = new Vimeo.Player(iframe[0]);
			player.play();
		} else if ($(this).attr('data-provider') == 'youtube') {
			if (youtubePlayers[$(this).attr('data-id')] != undefined) youtubePlayers[$(this).attr('data-id')].playVideo();
		} else {
			var player = $(this).find('video');
			if (player.length) {
				$(this).find('video')[0].volume = 0;
				$(this).find('video')[0].play();
				$(val).css('opacity', 1);
			}
		}
	});
};

UNCODE.owlStopVideo = function(carousel) {
	$('.owl-item .uncode-video-container', carousel).each(function(index, val) {
		var player, iframe;
		if ($(this).attr('data-provider') == 'vimeo') {
			iframe = $(this).find('iframe');
			player = new Vimeo.Player(iframe[0]);
			player.pause();
		} else if ($(this).attr('data-provider') == 'youtube') {
			if (youtubePlayers[$(this).attr('data-id')] != undefined) youtubePlayers[$(this).attr('data-id')].pauseVideo();
		} else {
			var player = $(this).find('video');
			if (player.length) {
				$(this).find('video')[0].volume = 0;
				$(this).find('video')[0].play();
			}
		}
	});
};


})(jQuery);
