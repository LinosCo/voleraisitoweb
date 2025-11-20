(function($) {
	"use strict";

	UNCODE.cssGrid = function() {
	if ($('.cssgrid-layout').length > 0) {
		var cssGridContainersArray = [];
		var transitionDuration = [];
		var $filters = $('.cssgrid-system .cssgrid-filters');

		$('[class*="cssgrid-container"]').each(function() {
			cssGridContainersArray.push($(this));
			transitionDuration.push($('.t-inside.animate_when_almost_visible', this).length > 0 ? 0 : '0.5s');
		});

		var init_cssGridAjax = function() {
			for (var i = 0, len = cssGridContainersArray.length; i < len; i++) {
				var cssGridSystem = $(cssGridContainersArray[i]).closest($('.cssgrid-system')),
					cssGridId = cssGridSystem.attr('id');

				cssGridSystem.data('transitionDuration', transitionDuration[i]);

				if ($(cssGridContainersArray[i]).hasClass('cssgrid-infinite') && $.fn.infinitescroll) {
					$(cssGridContainersArray[i]).infinitescroll({
						navSelector: '#' + cssGridId + ' .loadmore-button', // selector for the pagination container
						nextSelector: '#' + cssGridId + ' .loadmore-button a', // selector for the NEXT link (to page 2)
						itemSelector: '#' + cssGridId + ' .cssgrid-layout .tmb, #' + cssGridId + ' .grid-filters li.filter-cat, #' + cssGridId + ' .woocommerce-result-count-wrapper--default', // selector for all items you'll retrieve
						animate: false,
						behavior: 'local',
						debug: false,
						loading: {
							selector: '#' + cssGridId + '.cssgrid-system .cssgrid-footer-inner',
							speed: 0,
							finished: undefined,
							msg: $('#' + cssGridId + ' .loadmore-button'),
						},
						errorCallback: function() {
							var cssgrid_system = $(this).closest('.cssgrid-system');
							$('.loading-button', cssgrid_system).hide();
							$('.loadmore-button', cssgrid_system).attr('style', 'display:none !important');
						}
					},
					// append the new items to cssGrid on the infinitescroll callback function.
					function(newElements, opts) {
						var $cssGrid = $(this),
							cssGridSystemCont = $cssGrid.closest('.cssgrid-system'),
							cssGridId = cssGridSystemCont.attr('id'),
							filters = new Array(),
							$loading_button = cssGridSystemCont.find('.loading-button'),
							$infinite_button = cssGridSystemCont.find('.loadmore-button'),
							$numPages = $('a', $infinite_button).data('pages'),
							$woo_results,
							delay = 300;
						$('a', $infinite_button).html($('a', $infinite_button).data('label'));
						$infinite_button.show();
						$loading_button.hide();
						if ( $numPages != undefined && opts.state.currPage == $numPages) $infinite_button.hide();
						$('> li', $cssGrid).remove();
						$('.cssgrid-container').find('.woocommerce-result-count-wrapper').remove();
						$.each($(newElements), function (index, val) {
							if ($(val).hasClass('woocommerce-result-count-wrapper')) {
								$woo_results = $(val);
								delete newElements[index];
							} else {
								$(val).addClass('tmb-grid');
								if ($(val).is("li")) {
									filters.push($(val)[0]);
								}
							}
							$(val).addClass('uncode-appended');
						});
						newElements = newElements.filter(function(x) {
							return filters.indexOf(x) < 0
						});
						$.each($(filters), function(index, val) {
							if ($('#' + cssGridId + ' a[data-filter="' + $('a', val).attr('data-filter') + '"]').length == 0) $('#' + cssGridId + ' .grid-filters ul').append($(val));
						});
						if ($woo_results && $woo_results.length > 0) {
							var old_count = cssGridSystemCont.find('.woocommerce-result-count').text();
							var new_count = $woo_results.find('.woocommerce-result-count').text();
							var old_start = old_count.match(/(\d+)–(\d+)/)[1];
							var new_end = new_count.match(/(\d+)–(\d+)/)[2];
							function replaceMatch(match, p1, p2) {
        						return old_start + '–' + new_end;
							}
							var new_count_text = old_count.replace(/(\d+)–(\d+)/, replaceMatch);
							cssGridSystemCont.find('.woocommerce-result-count').text(new_count_text);
						}

						var filterValue = cssGridSystemCont.find('.grid-nav-link.active').attr('data-filter');
						var sequential = cssGridSystemCont.hasClass('cssgrid-animate-sequential') ? true : false;
						if (filterValue !== undefined && filterValue != '*') {
							$(newElements).hide();
							var els_to_show = $();
							$(newElements).each(function() {
								var el = $(this);
								if (el.hasClass(filterValue)) {
									els_to_show = els_to_show.add(el);
									el.show();
								}
							});
							UNCODE.animate_css_grids(cssGridSystemCont, els_to_show, els_to_show.length, sequential, true);
						} else {
							UNCODE.animate_css_grids(cssGridSystemCont, $(newElements), $(newElements).length, sequential, true);
						}

						UNCODE.adaptive();
						if (SiteParameters.dynamic_srcset_active === '1') {
							UNCODE.refresh_dynamic_srcset_size($cssGrid);
						}
						if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
							var getLightbox = UNCODE.lightboxArray['ilightbox_' + cssGridId];
							if (typeof getLightbox === 'object') {
								getLightbox.refresh();
							} else {
								UNCODE.lightbox();
							}
						}
						if ( typeof twttr !== 'undefined' ) {
							twttr.widgets.load(cssGridContainersArray[i]);
						}

						UNCODE.carousel($(newElements));
						requestTimeout(function() {
							$cssGrid.trigger('more-items-loaded');
							$(window).trigger('more-items-loaded');
							window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
						}, 1000);

					});
					if ($(cssGridContainersArray[i]).hasClass('cssgrid-infinite-button')) {
						var $cssgrid_el = $(cssGridContainersArray[i]),
							$infinite_button = $cssgrid_el.closest('.cssgrid-system').find('.loadmore-button a');
						$cssgrid_el.infinitescroll('pause');
						$infinite_button.on('click', function(event) {
							event.preventDefault();
							var $cssgrid_system = $(event.target).closest('.cssgrid-system'),
							$cssgrid_el = $cssgrid_system.find('.cssgrid-container'),
							cssGridId = $cssgrid_system.attr('id');
							$(event.currentTarget).html(SiteParameters.loading);
							$cssgrid_el.infinitescroll('resume');
							$cssgrid_el.infinitescroll('retrieve');
							$cssgrid_el.infinitescroll('pause');
						});
					}
				}
			}
		};

		init_cssGridAjax();

		if ($('.cssgrid-pagination').length > 0) {
			$('.cssgrid-system').on('click', '.pagination a', function(evt) {
				evt.preventDefault();

				if (SiteParameters.index_pagination_disable_scroll !== '1') {
					var container = $(this).closest('.cssgrid-system'),
						pagination_disable_scroll = container.attr('data-pagination-scroll'),
						calc_scroll = SiteParameters.index_pagination_scroll_to != false ? eval(SiteParameters.index_pagination_scroll_to) : container.closest('.row-parent').offset().top;

					if ( pagination_disable_scroll === 'disabled' ) {
						return;
					}

					calc_scroll -= UNCODE.get_scroll_offset();

					var menu_container = $('.menu-sticky');
					var menu = menu_container.find('.menu-container');

					if (menu_container.length > 0 && menu.length > 0) {
						calc_scroll = calc_scroll - menu.outerHeight();
					}

					var bodyTop = document.documentElement['scrollTop'] || document.body['scrollTop'],
						delta = bodyTop - calc_scroll,
						scrollSpeed = (SiteParameters.constant_scroll == 'on') ? Math.abs(delta) / parseFloat(SiteParameters.scroll_speed) : SiteParameters.scroll_speed;
					if (scrollSpeed < 1000 && SiteParameters.constant_scroll == 'on') scrollSpeed = 1000;

					if ( !UNCODE.isFullPage ) {
						if (scrollSpeed == 0) {
							$('html, body').scrollTop(calc_scroll);
						} else {
							$('html, body').animate({
								scrollTop: calc_scroll
							},{
								easing: 'easeInOutQuad',
								duration: scrollSpeed,
								complete: function(){
									UNCODE.scrolling = false;
								}
							});
						}
					}
				}

				loadCssGrid($(this), true);
			});
		}

		$filters.on('click', 'a.grid-nav-link', function(evt) {
			if ($(this).hasClass('no-grid-filter')) {
				return;
			}
			var $filter = $(this),
				filterContainer = $filter.closest('.cssgrid-filters'),
				filterValue = $filter.attr('data-filter'),
				containerSystem = $filter.closest('.cssgrid-system'),
				container = containerSystem.find($('.cssgrid-layout')),
				transitionDuration = containerSystem.data('transitionDuration'),
				delay = 300,
				filterItems = [],
				all_thumbs = container.find('.tmb-grid');

			var filter_items = function(){
				if (filterValue !== undefined) {
					$.each($('> .tmb-grid > .t-inside', container), function(index, val) {
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
					requestTimeout(function(){
						if ( filterValue == '*' ) {
							all_thumbs.show();
							all_thumbs.each(function(index, val) {
								$(val).find('[data-lbox^=ilightbox]').removeClass('lb-disabled');
								filterItems.push($(this));
							});
						} else {
							all_thumbs.each(function() {
								var _tmb = $(this);
								if (_tmb.hasClass(filterValue)) {
									_tmb.show();
									_tmb.find('[data-lbox^=ilightbox]').removeClass('lb-disabled');
									filterItems.push(_tmb);
								} else {
									_tmb.find('[data-lbox^=ilightbox]').addClass('lb-disabled');
									_tmb.hide();
								}
							});
						}

						$('.t-inside.zoom-reverse', container).removeClass('zoom-reverse');

						var sequential = containerSystem.hasClass('cssgrid-animate-sequential') ? true : false;
						UNCODE.animate_css_grids(containerSystem, filterItems, 0, sequential, true);
						var lightboxElements = $('[data-lbox^=ilightbox]', container);
						if (lightboxElements.length) {
							container.data('lbox', $(lightboxElements[0]).data('lbox'));
							if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
								var getLightbox = UNCODE.lightboxArray['ilightbox_' + container.closest('.cssgrid-system').attr('id')];
								if (typeof getLightbox === 'object') {
									getLightbox.refresh();
								} else {
									UNCODE.lightbox();
								}
							}
						}
						container.trigger('more-items-loaded');
						$(window).trigger('more-items-loaded');
						window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
					}, delay);
				} else {
					$.each($('> .tmb-grid > .t-inside', container), function(index, val) {
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
					loadCssGrid($filter);
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

		$(window).off('popstate.cssgrid').on("popstate.cssgrid", function(e) {
			var params = UNCODE.getURLParams(window.location);
			var old_params = UNCODE.getURLParams(UNCODE.lastURL, true);

			UNCODE.lastURL = window.location.href;

			if (UNCODE.hasEqualURLParams(params, old_params) || ($.isEmptyObject(params) && $.isEmptyObject(old_params)) || params.form !== undefined) {
				return;
			}

			if (params.id === undefined) {
				$.each($('.cssgrid-system'), function(index, val) {
					loadCssGrid($(val));
				});
			} else {
				if (!params.hasOwnProperty(SiteParameters.ajax_filter_key_unfilter)) {
					loadCssGrid($('#' + params.id));
				}
			}
		});

		var loadCssGrid = function($href, $paginating) {
			var is_paginating = false;

			if (undefined !== $paginating && $paginating) {
				var is_paginating = $paginating;
			}

			var href = ($href.is("a") ? $href.attr('href') : location),
				cssgridSystem = ($href.is("a") ? $href.closest($('.cssgrid-system')) : $href),
				cssgridWrapper = cssgridSystem.find($('.cssgrid-wrapper')),
				cssgridFooter = cssgridSystem.find($('.cssgrid-footer-inner')),
				cssgridResultCount = cssgridSystem.find($('.woocommerce-result-count-wrapper')),
				cssgridContainer = cssgridSystem.find($('.cssgrid-layout')),
				cssgridId = cssgridSystem.attr('id');
			if ( $href.is("a") && ! cssgridSystem.hasClass('un-no-history') ) {
				UNCODE.lastURL = href;
				history.pushState({
					myCSSgrid: true
				}, document.title, href);
			}
			cssgridWrapper.addClass('cssgrid-loading');
			if (is_paginating) {
				cssgridWrapper.addClass('grid-filtering');
			}
			$.ajax({
				url: href
			}).done(function(data) {
				var $resultItems = $(data).find('#' + cssgridId + ' .cssgrid-layout').html(),
					$resultPagination = $(data).find('#' + cssgridId + ' .pagination')[0],
					$resultCount = $(data).find('#' + cssgridId + ' .woocommerce-result-count')[0];
				requestTimeout(function() {
					cssgridContainer.html($resultItems);
					cssgridWrapper.removeClass('cssgrid-loading');
					cssgridWrapper.removeClass('grid-filtering');
					var sequential = cssgridSystem.hasClass('cssgrid-animate-sequential') ? true : false;
					UNCODE.animate_css_grids(cssgridSystem, cssgridContainer.find('.tmb-grid'), 0, sequential, false);
					UNCODE.adaptive();
					if (SiteParameters.dynamic_srcset_active === '1') {
						UNCODE.refresh_dynamic_srcset_size(cssgridContainer);
					}
					if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
						var getLightbox = UNCODE.lightboxArray['ilightbox_' + cssgridContainer.closest('.cssgrid-system').attr('id')];
						if (typeof getLightbox === 'object') {
							getLightbox.refresh();
						} else {
							UNCODE.lightbox();
						}
					}
					cssgridContainer.trigger('more-items-loaded');
					$(window).trigger('more-items-loaded');
					window.dispatchEvent(new CustomEvent('uncode-more-items-loaded'));
				}, 300);

				$('.pagination', cssgridFooter).remove();
				cssgridFooter.append($resultPagination);

				if (cssgridResultCount.length > 0) {
					$('.woocommerce-result-count', cssgridResultCount).remove();
					cssgridResultCount.append($resultCount);
				}
			});
		};

		$filters.each(function(i, buttonGroup) {
			var $buttonGroup = $(buttonGroup);
			$buttonGroup.on('click', 'a:not(.no-grid-filter)', function() {
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
	};
};


})(jQuery);
