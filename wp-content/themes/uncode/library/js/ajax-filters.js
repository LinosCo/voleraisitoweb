(function($) {
	"use strict";

	UNCODE.ajax_filters = function () {
	var isAjaxing = false;

/*************************
 *
 * Filters Menu and Widgets Area
 *
 ************************/

 	var clear_clicked = false;

 	var init_ajax_grid = function(){

		var $grids = $('.ajax-grid-system:not(.init-ajax-grid)');
		$grids.each(function(index, val){
			var $body = $('body'),
				$grid = $(val).addClass('init-ajax-grid'),
				starting_point = $grid.attr('data-toggle'),
				$trigger = $('.uncode-toggle-ajax-filters', $grid),
				$sidebar_wrapper = $('.ajax-filter-sidebar-wrapper', $grid),
				$isotope_wrapper = $('.isotope-wrapper', $grid),
				$sidebar = $('.ajax-filter-sidebar', $sidebar_wrapper),
				$sorting_trgr = $('.uncode-woocommerce-sorting__link', $grid),
				$footprint = $('.ajax-filter-footprint', $grid),
				sidebar_w,
				data_w = parseFloat( $sidebar.attr('data-max-width') ),
				$firstCol = $grid.closest('.uncol.style-light, .uncol.style-dark'),
				skin = $firstCol.hasClass('style-light') ? 'style-light' : 'style-dark',
				$positioned_top = $('.ajax-filter-position-horizontal', $grid),
				overlay_desktop = $('.ajax-filter-position-left-overlay, .ajax-filter-position-right-overlay', $grid).length,
				$close_btn = $('.close-ajax-filter-sidebar', $sidebar_wrapper),
				$vc_row = $('.vc_row', $sidebar_wrapper).eq(0),
				sidew,
				$inside_row = $('> .row-parent', $vc_row),
				bg_row,
				$side_header = $('.ajax-filter-sidebar-header', $sidebar_wrapper),
				$side_footer = $('.ajax-filter-sidebar-footer', $sidebar_wrapper),
				$apply_filters = $('.ajax-filter-sidebar__button', $side_footer),
				sidebar_overlay = false,
				sidebar_hover = false,
				switchMobile = false,
				scrollTop;

			if ( $vc_row.attr('class') ) {
				bg_row = $vc_row.attr('class').match(/style-color-([^-]+)-bg/);
			}

			if ( bg_row != null ) {
				$side_header.add($side_footer).addClass(bg_row[0]);
			}

			$trigger.add($apply_filters).on('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				$grid = $('.ajax-grid-system').eq(0);
				$positioned_top = $('.ajax-filter-position-horizontal', $grid);
				overlay_desktop = $('.ajax-filter-position-left-overlay, .ajax-filter-position-right-overlay', $grid).length,
				$sidebar_wrapper = $('.ajax-filter-sidebar-wrapper').eq(0);
				sidebar_w = $sidebar_wrapper.width();
				$sidebar = $('.ajax-filter-sidebar', $sidebar_wrapper);
				if ($(this).hasClass('ajax-filter-sidebar__button--clear')) {
					$(this).trigger('uncode-ajax-clear-filters');
				}
				if ( $positioned_top.length && UNCODE.wwidth >= UNCODE.mediaQuery ) {
					$grid.toggleClass('ajax-hide-filters-blanks');
					$sidebar.slideToggle({
						duration: 400,
						easing: 'easeOutQuad',
					});
				} else {
					$grid.removeClass('ajax-hide-filters-blanks');
					$grid.toggleClass('ajax-hide-filters');
					if ( $grid.hasClass('ajax-hide-filters') ) {
						$body.addClass('ajax-hide-filters');
					} else {
						scrollTop = $('html, body').scrollTop();
						$body.removeClass('ajax-hide-filters');
					}
				}
				if ( overlay_desktop || UNCODE.wwidth < UNCODE.mediaQuery ) {
					$('html, body').scrollTop(scrollTop);
				}
				return false;
			});

			$close_btn.on('click', function(e){
				e.preventDefault();
				$grid = $('.ajax-grid-system').eq(0);
				$grid.addClass('ajax-hide-filters');
				if ( $grid.hasClass('ajax-hide-filters') ) {
					$body.addClass('ajax-hide-filters');
				} else {
					scrollTop = $('html, body').scrollTop();
					$body.removeClass('ajax-hide-filters');
				}
				$('html, body').scrollTop(scrollTop);
			});

			$sidebar_wrapper.on('mouseover',function(){
				sidebar_hover = true;
			}).on('mouseout', function(){
				sidebar_hover = false;
			});

			$body.off('click.ajax-filter-sidebar').on('click.ajax-filter-sidebar', function( e, from ){
				if ( $(e.target).closest('.ajax-filter-sidebar').length ) {
					return;
				}
				if (undefined !== from && from === 'select_active_attributes') {
					return;
				}
				if ($(e.target).closest('.select2-container--open').length ) {
					return;
				}
				if ( ! $body.hasClass('ajax-hide-filters') && !sidebar_hover && $body.hasClass('ajax-filter-sidebar-overlay') ) {
					$grid.add($body).addClass('ajax-hide-filters');
				}
			});

			$sorting_trgr.on('click', function(e) {
				e.preventDefault();
			});

			var inside_width = function(){
				$sidebar_wrapper = $('.ajax-filter-sidebar-wrapper').eq(0);
				$sidebar = $('.ajax-filter-sidebar', $sidebar_wrapper);
				$vc_row = $('.vc_row', $sidebar_wrapper).eq(0);
				$inside_row = $('> .row-parent', $vc_row);
				if ( ( UNCODE.wwidth < UNCODE.mediaQuery ) || overlay_desktop ) {
					sidew = $sidebar.width();
					$inside_row.css({
						width: sidew
					});
				} else {
					$inside_row.css({
						width: ''
					});
				}
			};
			inside_width();

			var ajax_sidebar_position = function(e, f_editor){
				$grid = $('.ajax-grid-system').eq(0);
				$sidebar_wrapper = $('.ajax-filter-sidebar-wrapper').eq(0);
				$positioned_top = $('.ajax-filter-position-horizontal', $grid);
				$sidebar = $('.ajax-filter-sidebar', $sidebar_wrapper);
				$vc_row = $('.vc_row', $sidebar_wrapper).eq(0);
				$inside_row = $('> .row-parent', $vc_row);
				scrollTop = $('html, body').scrollTop();
				if ( f_editor !== true && ( ( UNCODE.wwidth < UNCODE.mediaQuery && switchMobile !== true) || overlay_desktop ) ) {
					$grid.add($body).addClass('ajax-hide-filters');
					$sidebar_wrapper.after('<span class="ajax-sidebar-placeholder" />');
					$body.append($sidebar_wrapper.addClass('main-container ajax-filter-sidebar--offcanvas'));
					sidebar_overlay = true;
					$body.addClass('ajax-filter-sidebar-overlay');
					$sidebar_wrapper.addClass(skin);
					var sideHeadH = $side_header.outerHeight(),
						sideFooterH = $side_footer.outerHeight();
					if ( data_w !== '' && data_w > 0 ) {
						if ( UNCODE.wwidth >= UNCODE.mediaQuery ) {
							$sidebar.css({
								'max-width': data_w
							});
						} else {
							$sidebar.css({
								'max-width':'none'
							});
						}
					}
					$vc_row.css({
						'padding-top':sideHeadH,
						'padding-bottom':sideFooterH
					});
					var sidew = $sidebar.width();
					$inside_row.css({
						width: sidew
					});
					switchMobile = true;
				} else {
					if ( ( typeof e !== 'undefined' && e.type === 'wwResize' && starting_point === 'hidden' ) || f_editor === true ) {
						scrollTop = $('html, body').scrollTop();
						$grid.add($body).removeClass('ajax-hide-filters');
					}
					if ( typeof e !== 'undefined' && e.type === 'wwResize' && $positioned_top.length && UNCODE.wwidth < UNCODE.mediaQuery ) {
						$grid.addClass('ajax-hide-filters-blanks');
						$sidebar.hide();
					}
					$('.ajax-sidebar-placeholder', $grid).after($sidebar_wrapper.removeClass('main-container ajax-filter-sidebar--offcanvas'));
					$('.ajax-sidebar-placeholder', $grid).remove();
					sidebar_overlay = false;
					$body.removeClass('ajax-filter-sidebar-overlay');
					$sidebar_wrapper.removeClass(skin);
					if ( data_w !== '' && data_w > 0 ) {
						$sidebar.css({
							'max-width':'none'
						});
					}
					$vc_row.css({
						'padding-top':0,
						'padding-bottom':0,
					});

					$inside_row.css({
						width: ''
					});

					if ( f_editor === true ) {
						UNCODE.ajax_filters();
					}

					switchMobile = false;
				}
				if ( overlay_desktop || UNCODE.wwidth < UNCODE.mediaQuery ) {
					$('html, body').scrollTop(scrollTop);
				}
			};

			var sidebar_width = function(){
				if ( ! $body.hasClass('ajax-filter-sidebar-overlay') && ! $positioned_top.length && UNCODE.wwidth >= UNCODE.mediaQuery ) {
					sidebar_w = $footprint.width();
					$sidebar.css({ width: sidebar_w });
				} else {
					$sidebar.css({ width: '' });
				}
			};
			sidebar_width();

			if ( SiteParameters.is_frontend_editor ) {
				ajax_sidebar_position();
			}

			$(window).off('load.ajax_filters wwResize.ajax_filters').on('load.ajax_filters wwResize.ajax_filters', function(e){
				if ( ! SiteParameters.is_frontend_editor || e.type === 'wwResize' ) {
					ajax_sidebar_position(e);
				}
				sidebar_width();
			});

			$(window).off('uncode.ajax_filters').one('uncode.ajax_filters', function(e){
				ajax_sidebar_position(e, true);
			});

			$isotope_wrapper.on('transitionend', function(e){
				if ( $(e.target).hasClass('isotope-wrapper') ) {
					window.dispatchEvent(new CustomEvent('boxResized'));
				}
				return false;
			});

			if ( UNCODE.wwidth < UNCODE.mediaQuery && $body.hasClass('ajax-hide-filters') ) {
				var $grid = $('.ajax-grid-system').eq(0);
				$grid.addClass('ajax-hide-filters');
			}

		});
	};

	init_ajax_grid();
	$(document).on('uncode-ajax-filtered', init_ajax_grid);

/*************************
 *
 * Hover hack
 *
 ************************/
 	var widget_hover_hack = function() {
 		$('.widget, .uncode_widget').each(function(){
			var $widget = $(this),
				class_w = $widget.attr('class'),
				$lis = $('ul:not(.menu-horizontal) > li', $widget).has('a'),
				$footer = $widget.closest('#colophon');

			if ( class_w.indexOf('widget_yith') > 0 ) {
				return true;
			}

			$lis.each(function(){
 				var $li = $(this),
 					$a = $('a', $li),
 					$label = $a.closest('label');

				if ( !$footer.length ) {
					$li.addClass('no-evts');
				}

				if ( ! $('span', $a).length ) {
 					$li.addClass( 'li-hover' );
 				}

 				$('li', $li).hover(function(e){
 					$(e.target).parents('li').each(function(){
 						$(this).addClass( 'parent-li-hover' );
 					});
					}, function (e) {
 					$(e.target).parents('li').each(function(key, val){
 						if ( key === 0) {
	 						$(val).removeClass( 'parent-li-hover' );
	 					}
 					});
 				});

				$li.off('mouseup').on('mouseup', function (e) {
					if (e.which !== 3) {
						e.stopPropagation();
						var $a = $('a', this).first();
						$a[0].click();
					}
	 			});
 			});
 		});
 	}
	if (SiteParameters.disable_hover_hack !== '1') {
		widget_hover_hack();
		$(document).on('uncode-ajax-filtered', widget_hover_hack);
	}

/*************************
 *
 * Init Filters
 *
 ************************/

	function init_filters() {
		$(document).on('click', '.term-filter-link', function(e) {
			var _this = $(this);
			var widget = _this.closest('.uncode_widget');
			var container = get_filters_container();

			if (widget.hasClass('widget-ajax-filters--no-ajax')) {
				return true;
			}

			e.preventDefault();

			if (widget.hasClass('widget-ajax-filters--checkbox')) {
				_this.parent().find('input[type="checkbox"]').trigger('click');
			} else {
				if (_this.hasClass('term-filter-link--active')) {
					_this.removeClass('term-filter-link--active');
				} else {
					_this.addClass('term-filter-link--active');

					if (widget.hasClass('widget-ajax-filters--single')) {
						widget.find('.term-filter-link').not(_this).removeClass('term-filter-link--active');
					}
				}

				var url = _this.attr('href');

				reload_items(container, url, true);
			}
		});

		$(document).on('click', '.term-filter input[type="checkbox"]', function(e) {
			var _this = $(this);
			var widget = _this.closest('.uncode_widget');
			var link = _this.closest('.term-filter').find('.term-filter-link');
			var url = link.attr('href');
			var container = get_filters_container();

			if (widget.hasClass('widget-ajax-filters--no-ajax')) {
				window.location = url;
				return;
			}

			if (widget.hasClass('widget-ajax-filters--single')) {
				widget.find('input[type="checkbox"]').each(function() {
					if (_this.attr('id') !== $(this).attr('id')) {
						$(this).prop('checked', false);
						$(this).closest('.term-filter').find('.term-filter-link').removeClass('term-filter-link--active');
					}
				});
			}

			if (_this.prop('checked')) {
				link.addClass('term-filter-link--active');
			} else {
				link.removeClass('term-filter-link--active');
			}

			reload_items(container, url, true);
		});

		$(document).on('change', 'select.select--term-filters', function(e) {
			var _this = $(this);
			var selected = _this.find('option:selected');
			var option = $(selected);
			var url = option.attr('data-term-filter-url');
			var container = get_filters_container();
			var widget = _this.closest('.uncode_widget');

			if (widget.hasClass('widget-ajax-filters--no-ajax')) {
				window.location = url;
			} else {
				reload_items(container, url, true);
			}
		});

		$(document).on('click', '.filter-list__link', function(e) {
			if (SiteParameters.is_frontend_editor) {
				return false;
			}

			e.preventDefault();

			var _this = $(this);
			var container = get_filters_container();
			var url = _this.attr('href');
			reload_items(container, url, true);
		});

		$('.ajax-filter-sidebar__button--clear').on('uncode-ajax-clear-filters', function(e) {
			var _this = $(this);
			var container = get_filters_container();
			var url = _this.attr('href');
			reload_items(container, url, true);
		});

		$(document).on('click', '.uncode-woocommerce-sorting-dropdown__link', function(e) {

			var _this = $(this);
			var container = get_filters_container();
			var url = _this.attr('href');

			if ( container.length ) {
				e.preventDefault();
				reload_items(container, url, true);
			}
		});

		$(document).on('click', '.uncode_woocommerce_widget--price-filter .button', function(e) {
			var _this = $(this);
			var container = get_filters_container();

			if (container.length > 0) {
				e.preventDefault();

				var min_price = $('#min_price').val();
				var max_price = $('#max_price').val();
				var location = window.location;
				var url = location.href;
				var page_uri = location.origin + location.pathname;
				var is_filtered = page_uri !== url;

				if (is_filtered) {
					url = remove_parameter_from_url(url, 'min_price');
					url = remove_parameter_from_url(url, 'max_price');
				}

				var concat = page_uri === url ? '?' : '&';
				var params = {'min_price': min_price, 'max_price': max_price};

				url = url + concat + $.param(params);

				reload_items(container, url, true);
			}
		});

		var search_timer;

		$(document).on('keyup', '.term-filters-search-input', function(e) {
			var _this = $(this);
			var container = get_filters_container();
			var value = _this.val();

			if (search_timer) {
				clearTimeout(search_timer);
			}

			search_timer = setTimeout(function() {
				update_search_url(container, value);
			}, 500);
		});
	}

	function update_search_url(container, search_value) {
		var location = window.location;
		var url = location.href;
		var page_uri = location.origin + location.pathname;
		var is_filtered = page_uri !== url;
		var key_search = SiteParameters.ajax_filter_key_search;
		var key_unfilter = SiteParameters.ajax_filter_key_unfilter;

		if (is_filtered) {
			url = remove_parameter_from_url(url, key_search);
			url = remove_parameter_from_url(url, key_unfilter);
		}

		if (search_value) {
			var concat = page_uri === url ? '?' : '&';
			var params = {};

			params[key_search] = search_value;
			params[key_unfilter] = 1;
			url = url + concat + $.param(params);
		} else {
			url = remove_parameter_from_url(url, key_search);
		}

		reload_items(container, url, true);
	}

	function remove_parameter_from_url(url, parameter) {
		return url.replace(new RegExp('[?&]' + parameter + '=[^&#]*(#.*)?$'), '$1').replace(new RegExp('([?&])' + parameter + '=[^&]*&'), '$1');
	}

	function get_filters_container() {
		var container = $('.ajax-grid-system');

		if (container.length == 0) {
			container = $('.ajax-filters');
		}

		return container;
	}

	function update_widgets_state(widgets_states, container) {
		for (var i = widgets_states.length - 1; i >= 0; i--) {
			var state = widgets_states[i];

			if (!state.collapse) {
				continue;
			}

			var new_widget = container.find('.uncode_widget[data-id="' + state.id + '"');

			if (state.open) {
				new_widget.find('.widget-title').addClass('open');
				if (state.css) {
					new_widget.find('.widget-collapse-content').attr('style', state.css);
				}
			} else {
				new_widget.find('.widget-title').removeClass('open');
				if (state.css) {
					new_widget.find('.widget-collapse-content').attr('style', state.css);
				}
			}
		}
	}

	// Reload items via AJAX
	function reload_items(container, url, push) {
		if (isAjaxing) {
			return
		};

		isAjaxing = true;

		container.addClass('grid-filtering');

		$.ajax({
			url     : url,
			success : function(response) {
				if (!response) {
					return;
				}

				$(document).trigger('uncode-ajax-pre-filtered');

				var container_id = container.attr('id');
				var pagination = $('.row-navigation');

				if (container_id) {
					var container_to_append = $(response).find('#' + container_id);
					var pagination_to_append = $(response).find('.row-navigation');
					var offcanvas_sidebar_wrapper = $('.ajax-filter-sidebar--offcanvas');

					// Remember open/closed widgets
					var widgets = $('.uncode_widget');
					var widgets_container = widgets.closest('.ajax-filter-sidebar--offcanvas').length > 0 ? $('.ajax-filter-sidebar--offcanvas') : container_to_append;
					var widgets_states = [];

					widgets.each(function() {
						var widget = $(this);
						var id = widget.attr('data-id');
						var state = {
							'id': id,
							'collapse': false,
							'open': false,
							'css': false,
						};

						var collapse_wrapper = widget.find('.widget-collapse-content');

						if (collapse_wrapper.length > 0) {
							state.collapse = true;

							var collapse_wrapper_css = collapse_wrapper.attr('style');
							var title = widget.find('.widget-title');

							state.css = collapse_wrapper_css;

							if (title.hasClass('open')) {
								state.open = true;
							} else {
								state.open = false;
							}
						}

						widgets_states.push(state);
					});

					// Update widgets state
					if (offcanvas_sidebar_wrapper.length === 0) {
						update_widgets_state(widgets_states, container_to_append);
					}

					// Update default sidebar state
					if (!container.hasClass('ajax-hide-filters')) {
						container_to_append.removeClass('ajax-hide-filters');
					}

					// Update horizontal sidebar
					if (!container.hasClass('ajax-hide-filters-blanks')) {
						container_to_append.removeClass('ajax-hide-filters-blanks');
					}
					var horizontal_sidebar_wrapper = $('.ajax-filter-position-horizontal');
					if (horizontal_sidebar_wrapper.length > 0) {
						var horizontal_sidebar_wrapper = horizontal_sidebar_wrapper.find('.ajax-filter-sidebar');
						var horizontal_sidebar_wrapper_style = horizontal_sidebar_wrapper.attr('style');
						var horizontal_sidebar_row = horizontal_sidebar_wrapper.find('.ajax-filter-sidebar-body .vc_row').eq(0);
						var horizontal_sidebar_row_style = horizontal_sidebar_row.attr('style');

						container_to_append.find('.ajax-filter-position-horizontal .ajax-filter-sidebar').attr('style', horizontal_sidebar_wrapper_style);
						container_to_append.find('.ajax-filter-position-horizontal .ajax-filter-sidebar-body .vc_row').eq(0).attr('style', horizontal_sidebar_row_style);
					}

					// Append container
					container.replaceWith(container_to_append);

					// Hide first thumbnail until the new srcset is loaded
					if (SiteParameters.dynamic_srcset_active === '1') {
						container_to_append.find('.tmb-woocommerce-variable-product').addClass('srcset-lazy-animations');
					}

					// Remove loading attribute to images
					container_to_append.find('img').attr('loading', '');

					// Append pagination
					if (pagination.length > 0) {
						if (pagination_to_append.length > 0) {
							pagination.html(pagination_to_append.html());
						} else {
							pagination.html('');
						}
					} else {
						if (pagination_to_append.length > 0) {
							$('.post-wrapper').append(pagination_to_append);
						}
					}

					// Update off canvas sidebar (mobile and overlay)
					var offcanvas_sidebar_wrapper = $('.ajax-filter-sidebar--offcanvas');

					if (offcanvas_sidebar_wrapper.length > 0 || UNCODE.wwidth < UNCODE.mediaQuery) {
						var sidebar_container = offcanvas_sidebar_wrapper.find('.vc_row').eq(0);
						var sidebar_to_append = $(response).find('.ajax-filter-sidebar-body').find('.vc_row').eq(0);
						container_to_append.find('.ajax-filter-sidebar-wrapper').after('<span class="ajax-sidebar-placeholder" />');
						container_to_append.find('.ajax-filter-sidebar-wrapper').remove();

						// Update widgets state
						update_widgets_state(widgets_states, sidebar_to_append);

						// Update sidebar
						sidebar_container.html(sidebar_to_append.html());
					}

					if (push) {
						UNCODE.lastURL = url;
						window.history.pushState(
							{ pageTitle: document.title },
							'',
							url
						);
					}

					if (typeof UNCODE.isotopeLayout !== 'undefined') {
						UNCODE.isotopeLayout();
					}
					if (typeof UNCODE.justifiedGallery !== 'undefined') {
						UNCODE.justifiedGallery();
					}
					if (typeof UNCODE.cssGrid !== 'undefined') {
						UNCODE.cssGrid();
					}
					if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
						UNCODE.lightbox();
					}
					if (typeof UNCODE.lightgallery !== 'undefined' && SiteParameters.lbox_enhanced) {
						UNCODE.lightgallery();
					}
					if (typeof UNCODE.carousel !== 'undefined') {
						UNCODE.carousel($('body'));
					}
					UNCODE.animations();
					if (typeof UNCODE.filters !== 'undefined') {
						UNCODE.filters();
					}
					if (typeof UNCODE.widgets !== 'undefined') {
						UNCODE.widgets();
					}

					if (SiteParameters.dynamic_srcset_active === '1') {
						UNCODE.refresh_dynamic_srcset_size();
					}

					if (typeof UNCODE.menuSmartInit !== 'undefined') {
						UNCODE.menuSmartInit();
					}

					if (typeof UNCODE.parallax !== 'undefined') {
						UNCODE.parallax();
					}

					maybe_scroll_to_top();

					var woo_select2_cats = $('.dropdown_product_cat');

					if (woo_select2_cats.length > 0) {
						woo_select2_cats.on( 'change', function() {
							if ( $(this).val() != '' ) {
								var this_page = '';
								var home_url  = UncodeWCParameters.uncode_wc_widget_product_categories_home_url;
								if ( home_url.indexOf( '?' ) > 0 ) {
									this_page = home_url + '&product_cat=' + $(this).val();
								} else {
									this_page = home_url + '?product_cat=' + $(this).val();
								}
								location.href = this_page;
							} else {
								location.href = UncodeWCParameters.uncode_wc_widget_product_categories_shop_url;
							}
						});

						if ( $().selectWoo ) {
							var wc_product_cat_select = function() {
								woo_select2_cats.selectWoo( {
									placeholder: UncodeWCParameters.uncode_wc_widget_product_categories_placeholder,
									minimumResultsForSearch: 5,
									width: '100%',
									allowClear: true,
									language: {
										noResults: function() {
											return UncodeWCParameters.uncode_wc_widget_product_categories_no_results;
										}
									}
								} );
							};
							wc_product_cat_select();
						}
					}

					$(document).trigger('uncode-ajax-filtered');
					$(document.body).trigger('init_price_filter');
					window.dispatchEvent(new CustomEvent('uncode-ajax-filtered'));
					window.document.dispatchEvent(new Event("DOMContentLoaded", {
						bubbles: true,
						cancelable: true
					}));

					isAjaxing = false;
				}
			},
			error: function() {
				container.removeClass('grid-filtering');

				isAjaxing = false;

				if (SiteParameters.enable_debug == true) {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('There was an error retrieving the products');
				}
			}
		});
	}

	// Scroll to top after filtering
	function maybe_scroll_to_top() {
		var offcanvas_sidebar_wrapper = $('.ajax-filter-sidebar--offcanvas');

		if (offcanvas_sidebar_wrapper.length > 0) {
			return;
		}

		var container = get_filters_container();
		var bound = container[0].getBoundingClientRect();

		if (bound.y < 0) {
			$(window).scrollTop(container.offset().top);
		}
	}

	// Back/forward browser buttons
	$(window).on("popstate.ajaxfilters", function(e) {
		var location = window.location;
		var url = location.href;
		var params = UNCODE.getURLParams(window.location);
		var old_params = UNCODE.getURLParams(UNCODE.lastURL, true);

		UNCODE.lastURL = url;

		if (UNCODE.hasEqualURLParams(params, old_params) || ($.isEmptyObject(params) && $.isEmptyObject(old_params)) || params.form !== undefined) {
			return;
		}

		var container = get_filters_container();

		reload_items(container, url, false);
	});

	// Destroy load more before to init a new one
	$(window).on('uncode-ajax-pre-filtered', function() {
		if ($.fn.infinitescroll) {
			$('.cssgrid-infinite, .isotope-infinite').infinitescroll('destroy');
		}
	});

	init_filters();
};


})(jQuery);
