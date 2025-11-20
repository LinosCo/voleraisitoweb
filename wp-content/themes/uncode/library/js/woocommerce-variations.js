(function($) {
	"use strict";

	var Utils = {
		/**
		 * Get first avaialble variation from an attribute
		 */
		get_single_variation_from_attribute: function(variation, attribute, attribute_value) {
			if (variation) {
				for (var attr_name in variation) {
					if (attr_name === 'attributes' && variation.hasOwnProperty(attr_name)) {
						var variation_attr = variation[attr_name];
						var attribute_name = 'attribute_' + attribute;

						if (variation_attr.hasOwnProperty(attribute_name) && variation_attr[attribute_name] === attribute_value) {
							return variation;
						}
					}
				}
			}

			return false;
		},

		/**
		 * Find an URL parameter and get its value
		 */
		get_url_parameter: function(key) {
			var url = window.location.search.substring(1);
			var url_variables = url.split('&');
			var param_key;
			var i;

			for (i = 0; i < url_variables.length; i++) {
				param_key = url_variables[i].split('=');

				if (param_key[0] === key) {
					return param_key[1] === undefined ? true : decodeURIComponent(param_key[1]);
				}
			}
			return false;
		}
	}

	var Single_Product = {
		has_variation_changed: false,
		doing_clear: false,
		first_load: true,

		/**
		 * Add variable products to the cart via AJAX
		 */
		variable_add_to_cart: function() {
			if (window.wc_add_to_cart_params != undefined && window.UncodeWCParameters != undefined && UncodeWCParameters.variations_ajax_add_to_cart === '1') {
				$('form.variations_form').on('submit', function(e) {
					var form = $(this);
					var product_wrapper = form.closest('.tmb-woocommerce')
					var is_loop = false;

					if (product_wrapper.length === 0) {
						product_wrapper = form.closest('.product-type-variable');

						if (product_wrapper.length === 0) {
							return;
						}
					} else {
						is_loop = true;
					}

					e.preventDefault();

					var form_button = form.find('.single_add_to_cart_button');
					var form_data = form.serialize();

					form_data += '&action=uncode_ajax_add_to_cart';

					if (form_button.val()) {
						form_data += '&add-to-cart=' + form_button.val();
					}

					form_button.removeClass( 'added', 'added-error' );
					form_button.addClass( 'loading' );

					if (is_loop) {
						var loop_button = product_wrapper.find('.add_to_cart_button').not(':button');

						loop_button.removeClass( 'added', 'added-error' );
						loop_button.addClass( 'loading' );
					}

					$.ajax({
						url     : wc_add_to_cart_params.ajax_url,
						data    : form_data,
						method  : 'POST',
						success : function(response) {
							if (!response) {
								return;
							}

							if (UncodeWCParameters.redirect_after_add === '1') {
								window.location = UncodeWCParameters.cart_url;
							} else {
								form_button.removeClass( 'loading' );
								if (is_loop) {
									loop_button.removeClass( 'loading' );
								}

								if (fragments) {
									$.each(fragments, function(key) {
										$(key).addClass('updating');
									});
								}

								if (fragments) {
									$.each(fragments, function(key, value) {
										$(key).replaceWith(value);
									});
								}

								var fragments = response.fragments;
								var cart_hash = response.cart_hash;

								var notices_wrapper = $('.woocommerce-notices-wrapper');

								if (notices_wrapper.length > 0) {
									notices_wrapper.empty();
								}

								if (response.notices.indexOf('error') > 0) {
									if (notices_wrapper.length > 0) {
										notices_wrapper.append(response.notices);
									}
									form_button.addClass('added-error');
									if (is_loop) {
										loop_button.addClass('added-error');
									}
								} else {
									form_button.addClass('added');
									if (is_loop) {
										loop_button.addClass('added');
									}
									$(document.body).trigger('added_to_cart', [
										fragments,
										cart_hash,
										form_button
									]);
								}
							}
						},
						error: function() {
							if (SiteParameters.enable_debug == true) {
								// This console log is disabled by default
								// So nothing is printed in a typical installation
								//
								// It can be enabled for debugging purposes setting
								// the 'uncode_enable_debug_on_js_scripts' filter to true
								console.log('There was an error when adding the product to the cart');
							}
						}
					});
				});
			}
		},

		/**
		 * Update the product gallery replacing its content
		 * with the new one (when changing variations)
		 */
		update_variation_gallery: function(event, variation, form, gallery_params, clear) {
			if (clear && !Single_Product.has_variation_changed) {
				var form = $(event.target);
				$('.product-gallery-placeholder').removeClass('product-gallery-placeholder');
				$(window).trigger('uncode_wc_variation_gallery_loaded');
				form.removeClass('is-updating-gallery');
				return;
			}

			if (clear && Single_Product.doing_clear) {
				form.removeClass('is-updating-gallery');
				return;
			}

			if (clear) {
				Single_Product.doing_clear = true;
			}

			if (!clear) {
				Single_Product.doing_clear = false;
			}

			var quick_view_container = form.closest('.quick-view-container');
			var old_gallery = quick_view_container.length > 0 ? quick_view_container.find('.uncode-single-product-gallery') : $('.uncode-single-product-gallery');

			old_gallery.addClass('product-gallery-placeholder');

			var product_id = form.attr('data-product_id');
			var parent_gallery = old_gallery.parent();

			$.ajax({
				url: UncodeWCParameters.ajax_url,
				data: {
					action: 'uncode_get_variation_gallery',
					variation: typeof variation !== 'undefined' ? variation : 0,
					product_id: product_id,
					clear: clear,
					gallery_params: gallery_params,
					is_quick_view: quick_view_container.length > 0 ? true : false,
				},
				type: 'post',
				success: function(response) {
					if (!response) {
						form.removeClass('is-updating-gallery');
						return;
					}

					if (response.data && response.data.html) {
						var new_gallery = $(response.data.html);

						if (new_gallery.length > 0) {
							new_gallery.addClass('hidden');
							parent_gallery.append(new_gallery);

							var appended_gallery = parent_gallery.find('.uncode-single-product-gallery');

							appended_gallery.imagesLoaded().done(function(instance) {
								var main_gallery = appended_gallery.find('.woocommerce-product-gallery');
								appended_gallery.removeClass('hidden');
								$('.product-gallery-placeholder').removeClass('product-gallery-placeholder');
								$(window).trigger('uncode_wc_variation_gallery_loaded');

								old_gallery.remove();

								if (typeof UNCODE_WC.product_gallery !== 'undefined') {
									UNCODE_WC.product_gallery(main_gallery);
									main_gallery.css('opacity', '1');
								}
								if (typeof UNCODE.adaptive !== 'undefined') {
									UNCODE.adaptive();
								}

								if (typeof UNCODE.lightbox !== 'undefined' && !SiteParameters.lbox_enhanced) {
									UNCODE.lightbox();
								} else if (typeof UNCODE.lightgallery !== 'undefined' && SiteParameters.lbox_enhanced) {
									UNCODE.lightgallery();
								}
								form.removeClass('is-updating-gallery');
							});
						} else {
							form.removeClass('is-updating-gallery');
						}

						Single_Product.has_variation_changed = true;
						UNCODE.stickyElements();
					}
				},
				error: function() {
					form.removeClass('is-updating-gallery');

					if (SiteParameters.enable_debug == true) {
						// This console log is disabled by default
						// So nothing is printed in a typical installation
						//
						// It can be enabled for debugging purposes setting
						// the 'uncode_enable_debug_on_js_scripts' filter to true
						console.log('There was an error retrieving the variation gallery');
					}
				}
			});
		},

		/**
		 * Init galleries for variations
		 */
		variation_gallery: function() {
			if (!$('body').hasClass('uncode-default-product-gallery')) {
				$('form.variations_form').each(function() {
					var form = $(this);
					var product_div = form.closest('div.woocommerce-product-gallery--with-variation-gallery');

					if (product_div.length > 0) {
						var original_values = form.find('select').serialize();
						var gallery_params = product_div.find('.woocommerce-product-gallery.images').data('gallery-options');
						var default_images = gallery_params.default_images;
						var original_images = default_images;

						form
						.on('found_variation.wc-variation-form', function(event, variation) {
							if (!form.hasClass('is-updating-gallery')) {
								form.addClass('is-updating-gallery');
								var new_values = form.find('select').serialize();
								var new_images = [];

								if (variation.image_id) {
									new_images.push(variation.image_id);
								}

								if (variation.variation_gallery) {
									for (var variation_gallery_id in variation.variation_gallery) {
										new_images.push(variation.variation_gallery[variation_gallery_id]);
									}
								}

								var has_new_images = Single_Product.has_new_images(original_images, new_images);

								if (new_values != original_values || Single_Product.first_load) {
									original_values = new_values;
									Single_Product.first_load = false;
									if (has_new_images) {
										Single_Product.update_variation_gallery(event, variation, form, gallery_params, false);
										original_images = new_images;
									} else {
										$('.product-gallery-placeholder').removeClass('product-gallery-placeholder');
										$(window).trigger('uncode_wc_variation_gallery_loaded');
										form.removeClass('is-updating-gallery');
									}
								} else {
									form.removeClass('is-updating-gallery');
								}
							}
						})
						.on('reset_image', function(event, variation) {
							Single_Product.update_variation_gallery(event, variation, form, gallery_params, true);
							original_images = default_images;
						});
					}
				});
			}
		},

		/**
		 * Compare two set of images
		 */
		has_new_images: function(original_images, new_images) {
			if (!original_images instanceof Array) {
				return true;
			}

			if (!new_images instanceof Array) {
				return true;
			}

			if (original_images.length !== new_images.length) {
				return true;
			}

			for (var i = 0; i < original_images.length; i++) {
				if (new_images.indexOf(original_images[i]) < 0) {
					return true;
				}
			}

			return false;
		}
	}

	var Loop_Variations = {
		/**
		 * Init default variations on loops, ie. when we are not using
		 * a single attribute visible and we have the complete form
		 */
		init_forms: function() {
			$('form.variations_form').each(function() {
				var form = $(this);
				var tmb_wrapper = form.closest('.tmb-woocommerce');

				if (tmb_wrapper.length === 0) {
					return;
				}

				// Button
				var form_button = form.find('.single_add_to_cart_button');
				var button_to_connect = tmb_wrapper.find('.add_to_cart_button').not(':button');

				button_to_connect.on('click', function(e) {
					e.preventDefault();
					form_button.trigger('click');
				});

				// Images
				var product_img = tmb_wrapper.find('img[class*=wp-image], .uncode-picture-image').last();
				var picture_el = product_img.closest('picture');
				var source_el = picture_el.find('source');
				var bg_el = tmb_wrapper.find('div.t-background-cover').last();

				// Price
				var prices = tmb_wrapper.find('span.price');

				prices = prices.filter(function() {
					if ($(this).closest('.t-entry-variations').length > 0) {
						return false;
					}
					return true;
				});

				var original_price = prices.last().clone();
				var original_price_value = original_price.children();

				// Stock
				var stock = tmb_wrapper.find('.t-entry-stock');
				var original_stock = stock.clone();
				var original_stock_value = original_stock.children();

				// Title
				var title = tmb_wrapper.find('.t-entry-title');
				var original_title = title.clone();
				var original_title_value = original_title.html();

				// URL
				var url = tmb_wrapper.find('.t-entry-visual-cont > a').attr('href');

				form
				.on('hide_variation', function() {
					button_to_connect.find('.add_to_cart_text').html(UncodeWCParameters.i18n_variation_add_to_cart_text);
					Loop_Variations.reset_variation_price(prices, original_price_value);
					Loop_Variations.reset_variation_stock(stock, original_stock_value);
					Loop_Variations.reset_variation_title(title, original_title_value);
					Loop_Variations.reset_product_urls(tmb_wrapper, url);
				})
				.on('show_variation', function(event, variation, purchasable) {
					if ( purchasable ) {
						button_to_connect.find('.add_to_cart_text').html(UncodeWCParameters.i18n_add_to_cart_text);
					} else {
						button_to_connect.find('.add_to_cart_text').html(UncodeWCParameters.i18n_variation_add_to_cart_text);
					}
					Loop_Variations.update_variation_price(prices, original_price_value, variation);
					Loop_Variations.update_variation_stock(stock, original_stock_value, variation);
					Loop_Variations.update_variation_title(title, original_title_value, variation);
					Loop_Variations.update_product_urls(tmb_wrapper, variation);
				})
				.on('found_variation.wc-variation-form', function(event, variation) {
					Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, variation);
				})
				.on('reset_image', function(event, variation) {
					Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, false);
				});
			});
		},

		/**
		 * Init single variations on loops
		 * (when we don't have the complete form)
		 */
		init_single_attributes: function() {
			$('.single-attribute-selector').each(function() {
				var selector = $(this);
				var tmb_wrapper = selector.closest('.tmb-woocommerce');
				var selector_type = '';

				if (tmb_wrapper.length === 0) {
					return;
				}

				var select_attr = selector.find('select');

				if (select_attr.length > 0) {
					var selected_attr = select_attr.val();
					selector_type = 'select';
				} else {
					var swatches = selector.find('.swatch');
					var active_swatch = selector.find('.swatch--active');
					if (swatches.length > 0) {
						selector_type = 'swatch';
					}
				}

				// Images
				var product_img = tmb_wrapper.find('img[class*=wp-image], .uncode-picture-image').last();
				var picture_el = product_img.closest('picture');
				var source_el = picture_el.find('source');
				var bg_el = tmb_wrapper.find('div.t-background-cover').last();

				// Price
				var prices = tmb_wrapper.find('span.price');

				prices = prices.filter(function() {
					if ($(this).closest('.t-entry-variations').length > 0) {
						return false;
					}
					return true;
				});

				var original_price = prices.last().clone();
				var original_price_value = original_price.children();

				// Stock
				var stock = tmb_wrapper.find('.t-entry-stock');
				var original_stock = stock.clone();
				var original_stock_value = original_stock.children();

				// Title
				var title = tmb_wrapper.find('.t-entry-title');
				var original_title = title.clone();
				var original_title_value = original_title.html();

				// URL
				var url = tmb_wrapper.find('.t-entry-visual-cont > a').attr('href');

				if (SiteParameters.dynamic_srcset_active === '1') {
					if (picture_el.length > 0) {
						picture_el.on('srcset-done', function() {
							if (!picture_el.hasClass('adaptive-fixed')) {
								if (selector_type === 'select' && selected_attr) {
									Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								} else if (selector_type === 'swatch' && active_swatch.length > 0) {
									Loop_Variations.init_single_swatch_variation(tmb_wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								}
								picture_el.addClass('adaptive-fixed');
							}
						});
					} else {
						product_img.on('srcset-done', function() {
							if (!product_img.hasClass('adaptive-fixed')) {
								if (selector_type === 'select' && selected_attr) {
									Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								} else if (selector_type === 'swatch' && active_swatch.length > 0) {
									Loop_Variations.init_single_swatch_variation(tmb_wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								}
								product_img.addClass('adaptive-fixed');
							}
						});
					}
				} else if (SiteParameters.uncode_adaptive_async === '1') {
					if (bg_el.length > 0) {
						bg_el.on('async-done', function() {
							if (!bg_el.hasClass('adaptive-fixed')) {
								if (selector_type === 'select' && selected_attr) {
									Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								} else if (selector_type === 'swatch' && active_swatch.length > 0) {
									Loop_Variations.init_single_swatch_variation(tmb_wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								}
								bg_el.addClass('adaptive-fixed');
							}
						});
					} else if (product_img.length > 0) {
						product_img.on('async-done', function() {
							if (!product_img.hasClass('adaptive-fixed')) {
								if (selector_type === 'select' && selected_attr) {
									Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								} else if (selector_type === 'swatch' && active_swatch.length > 0) {
									Loop_Variations.init_single_swatch_variation(tmb_wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
								}
								product_img.addClass('adaptive-fixed');
							}
						});
					}
				} else {
					if (selector_type === 'select' && selected_attr) {
						Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
					} else if (selector_type === 'swatch' && active_swatch.length > 0) {
						Loop_Variations.init_single_swatch_variation(tmb_wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
					}
				}

				// Selects
				if (selector_type === 'select') {
					select_attr.on('change', function() {
						var selected_attr = $(this).val();
						Loop_Variations.init_single_select_variation(tmb_wrapper, select_attr, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
					});
				}

				// Swatches
				if (selector_type === 'swatch') {
					if (selector.hasClass('single-attribute-selector--hover') && !('ontouchstart' in window)) {
						swatches.on('mouseenter', function() {
							var active_swatch = $(this);
							Loop_Variations.set_single_swatch_variation(tmb_wrapper, swatches, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
						}).on('click', function(e, from) {
							if (!(undefined !== from && from === 'select_active_attributes')) {
								window.location = $(this).attr('data-variation-link');
							}
						});
					} else {
						swatches.on('click', function() {
							var active_swatch = $(this);
							Loop_Variations.set_single_swatch_variation(tmb_wrapper, swatches, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, url);
						});
					}

				}
			});
		},

		/**
		 * Init single variation (select)
		 */
		init_single_select_variation: function(wrapper, select, selected_attr, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, original_url) {
			var option = select.find("option[value='" + selected_attr + "']");
			var variation = option.data('variation');
			var attribute = select.attr('id');

			// Check variation data
			var found_variation = Utils.get_single_variation_from_attribute(variation, attribute, selected_attr);

			// Set active variation
			if (found_variation) {
				Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, found_variation);
				Loop_Variations.update_variation_price(prices, original_price_value, found_variation);
				Loop_Variations.update_variation_stock(stock, original_stock_value, found_variation);
				Loop_Variations.update_variation_title(title, original_title_value, found_variation);
				Loop_Variations.update_product_urls(wrapper, found_variation);
			} else {
				Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, false);
				Loop_Variations.reset_variation_price(prices, original_price_value);
				Loop_Variations.reset_variation_stock(stock, original_stock_value);
				Loop_Variations.reset_variation_title(title, original_title_value);
				Loop_Variations.reset_product_urls(wrapper, original_url);
			}
		},

		/**
		 * Init single variation (swatch)
		 */
		init_single_swatch_variation: function(wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, original_url) {
			var variation = active_swatch.data('variation');
			var attribute = selector.find('.swatches-select').data('swatch-id');
			var attribute_value = active_swatch.data('swatch-value');

			// Check variation data
			var found_variation = Utils.get_single_variation_from_attribute(variation, attribute, attribute_value);

			// Set active variation
			if (found_variation) {
				Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, found_variation);
				Loop_Variations.update_variation_price(prices, original_price_value, found_variation);
				Loop_Variations.update_variation_stock(stock, original_stock_value, found_variation);
				Loop_Variations.update_variation_title(title, original_title_value, found_variation);
				Loop_Variations.update_product_urls(wrapper, found_variation);
			} else {
				Loop_Variations.update_variation_image(product_img, bg_el, picture_el, source_el, false);
				Loop_Variations.reset_variation_price(prices, original_price_value);
				Loop_Variations.reset_variation_stock(stock, original_stock_value);
				Loop_Variations.reset_variation_title(title, original_title_value);
				Loop_Variations.reset_product_urls(wrapper, original_url);
			}
		},

		/**
		 * Set single variation on clicks (swatch)
		 */
		set_single_swatch_variation: function(wrapper, swatches, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, original_url) {
			swatches.removeClass('swatch--active');
			active_swatch.addClass('swatch--active');
			Loop_Variations.init_single_swatch_variation(wrapper, selector, active_swatch, product_img, bg_el, picture_el, source_el, prices, original_price_value, stock, original_stock_value, title, original_title_value, original_url);
		},

		/**
		 * Update product price
		 */
		update_variation_price: function(prices, original_price, variation) {
			var new_price = variation && variation.price_html && prices.length > 0 ? $(variation.price_html).children() : original_price;

			prices.html(new_price);
		},

		/**
		 * Reset product price
		 */
		reset_variation_price: function(prices, original_price) {
			prices.html(original_price);
		},

		/**
		 * Update product stock
		 */
		update_variation_stock: function(stock, original_stock, variation) {
			var new_stock = variation && variation.availability_html && stock.length > 0 ? $(variation.availability_html) : original_stock;

			if (new_stock.hasClass('in-stock')) {
				stock.addClass('t-entry-stock--in-stock');
			} else {
				stock.removeClass('t-entry-stock--in-stock');
			}

			stock.html(new_stock);
		},

		/**
		 * Reset product stock
		 */
		reset_variation_stock: function(stock, original_stock) {
			if (original_stock.hasClass('in-stock')) {
				stock.addClass('t-entry-stock--in-stock');
			} else {
				stock.removeClass('t-entry-stock--in-stock');
			}

			stock.html(original_stock);
		},

		/**
		 * Update product title
		 */
		update_variation_title: function(title, original_title, variation) {
			if (title.length > 0) {
				if (title.closest('.tmb').find('.t-entry-variations').hasClass('single-attribute-selector--dynamic-title')) {
					var new_title = variation && variation.variation_name && title.length > 0 ? variation.variation_name : original_title;
					var price = title.find('.price');

					title.text(new_title);

					if (price.length > 0) {
						title.append(price);
					}
				}
			}
		},

		/**
		 * Reset product title
		 */
		reset_variation_title: function(title, original_title) {
			if (title.length > 0) {
				if (title.closest('.tmb').find('.t-entry-variations').hasClass('single-attribute-selector--dynamic-title')) {
					title.html(original_title);
				}
			}
		},

		/**
		 * Update product URLs
		 */
		update_product_urls: function(wrapper, variation) {
			if (variation.variation_selected_url) {
				var links = wrapper.find('a').not('.t-entry-category a').not('.t-entry-attribute-image__link');
				var quick_view_button = wrapper.find('.quick-view-button');

				links.attr('href', variation.variation_selected_url);
				quick_view_button.attr('data-post-url', variation.variation_selected_url);
			}
		},

		/**
		 * Reset product URLs
		 */
		reset_product_urls: function(wrapper, original_url) {
			var links = wrapper.find('a').not('.t-entry-category a').not('.t-entry-attribute-image__link');
			var quick_view_button = wrapper.find('.quick-view-button');

			links.attr('href', original_url);
			quick_view_button.attr('data-post-url', original_url);
		},

		/**
		 * Inspired by $.wc_variations_image_update()
		 */
		update_variation_image: function(img, bg, picture, source, variation) {
			var is_bg = bg.length > 0 ? true : false;
			var is_picture = picture.length > 0 ? true : false;
			var variations_imgs = '';

			if (is_bg) {
				variations_imgs = bg.data('product_variations');
			} else if (is_picture) {
				variations_imgs = picture.data('product_variations');
			} else {
				variations_imgs = img.data('product_variations');
			}

			if (variations_imgs && variation && variation.image_id && variation.image) {
				for (var variations_img_key in variations_imgs) {
					var variations_img = variations_imgs[variations_img_key];

					if (parseInt(variations_img_key, 10) === variation.image_id) {
						if (is_bg) {
							Loop_Variations.update_bg_attributes(bg, variations_img, variation);
						} else if (is_picture) {
							Loop_Variations.update_picture_attributes(img, picture, source, variations_img, variation)
						} else {
							Loop_Variations.update_img_attributes(img, variations_img, variation);
						}
					}
				}
			} else {
				if (is_bg) {
					Loop_Variations.reset_variation_bg(bg);
				} else if (is_picture) {
					Loop_Variations.reset_variation_picture(img, picture, source);
				} else {
					Loop_Variations.reset_variation_img(img);
				}
			}
		},

		/**
		 * Inspired by $.wc_set_variation_attr()
		 */
		set_variation_attr: function(el, attr, value) {
			if (undefined === el.attr('data-o_' + attr)) {
				el.attr('data-o_' + attr, (!el.attr(attr)) ? '' : el.attr(attr));
			}
			if (false === value) {
				el.removeAttr(attr);
			} else {
				el.attr(attr, value);
			}
		},

		/**
		 * Inspired by $.wc_reset_variation_attr()
		 */
		reset_variation_attr: function(el, attr, value) {
			if (undefined !== el.attr('data-o_' + attr)) {
				el.attr(attr, el.attr('data-o_' + attr));
			}
		},

		/**
		 * Update attributes of the IMG tag
		 */
		update_img_attributes: function(img, variations_img, variation) {
			if (SiteParameters.dynamic_srcset_active === '1') {
				img.removeClass('srcset-sizes-done');
				img.addClass('srcset-async');
			} else if (SiteParameters.uncode_adaptive_async === '1') {
				img.removeClass('async-done');
				img.removeClass('adaptive-fetching');
				img.addClass('adaptive-async');
			}

			Loop_Variations.set_variation_attr(img, 'src', variations_img.src);
			Loop_Variations.set_variation_attr(img, 'alt', variation.image.alt);
			Loop_Variations.set_variation_attr(img, 'width', variations_img.width);
			Loop_Variations.set_variation_attr(img, 'height', variations_img.height);
			Loop_Variations.set_variation_attr(img, 'srcset', variations_img.srcset);
			Loop_Variations.set_variation_attr(img, 'data-uniqueid', variations_img.uniqueid);
			Loop_Variations.set_variation_attr(img, 'data-guid', variations_img.guid);
			Loop_Variations.set_variation_attr(img, 'data-path', variations_img.path);
			Loop_Variations.set_variation_attr(img, 'data-no-bp', variations_img.no_bp);
			Loop_Variations.set_variation_attr(img, 'data-bp', variations_img.bp);
			Loop_Variations.set_variation_attr(img, 'data-width', variations_img.orig_w);
			Loop_Variations.set_variation_attr(img, 'data-height', variations_img.orig_h);
			Loop_Variations.set_variation_attr(img, 'data-singlew', variations_img.singlew);
			Loop_Variations.set_variation_attr(img, 'data-singleh', variations_img.singleh);

			if (SiteParameters.dynamic_srcset_active === '1') {
				UNCODE.adaptive_srcset(img.closest('.tmb'));
			} else if (SiteParameters.uncode_adaptive_async === '1') {
				UNCODE.adaptive();
			}
		},

		/**
		 * Reset attributes of the IMG tag
		 */
		reset_variation_img: function(img) {
			Loop_Variations.reset_variation_attr(img, 'src');
			Loop_Variations.reset_variation_attr(img, 'srcset');
			Loop_Variations.reset_variation_attr(img, 'alt');
			Loop_Variations.reset_variation_attr(img, 'width');
			Loop_Variations.reset_variation_attr(img, 'height');
			Loop_Variations.reset_variation_attr(img, 'data-uniqueid');
			Loop_Variations.reset_variation_attr(img, 'data-guid');
			Loop_Variations.reset_variation_attr(img, 'data-path');
			Loop_Variations.reset_variation_attr(img, 'data-no-bp');
			Loop_Variations.reset_variation_attr(img, 'data-bp');
			Loop_Variations.reset_variation_attr(img, 'data-width');
			Loop_Variations.reset_variation_attr(img, 'data-height');
			Loop_Variations.reset_variation_attr(img, 'data-singlew');
			Loop_Variations.reset_variation_attr(img, 'data-singleh');
		},

		/**
		 * Update attributes of the PICTURE tag (and descendants)
		 */
		update_picture_attributes: function(img, picture, source, variations_img, variation) {
			if (SiteParameters.dynamic_srcset_active === '1') {
				picture.addClass('srcset-async');
				source.removeClass('srcset-sizes-done');
			}

			Loop_Variations.set_variation_attr(img, 'src', variations_img.src);
			Loop_Variations.set_variation_attr(source, 'srcset', variations_img.srcset);
			Loop_Variations.set_variation_attr(img, 'alt', variation.image.alt);
			Loop_Variations.set_variation_attr(img, 'width', variations_img.width);
			Loop_Variations.set_variation_attr(img, 'height', variations_img.height);
			Loop_Variations.set_variation_attr(picture, 'data-uniqueid', variations_img.uniqueid);
			Loop_Variations.set_variation_attr(picture, 'data-guid', variations_img.guid);
			Loop_Variations.set_variation_attr(picture, 'data-path', variations_img.path);
			Loop_Variations.set_variation_attr(picture, 'data-no-bp', variations_img.no_bp);
			Loop_Variations.set_variation_attr(picture, 'data-bp', variations_img.bp);
			Loop_Variations.set_variation_attr(picture, 'data-width', variations_img.orig_w);
			Loop_Variations.set_variation_attr(picture, 'data-height', variations_img.orig_h);

			if (SiteParameters.dynamic_srcset_active === '1') {
				UNCODE.adaptive_srcset(img.closest('.tmb'));
			}
		},

		/**
		 * Reset attributes of the PICTURE tag (and descendants)
		 */
		reset_variation_picture: function(img, picture, source) {
			Loop_Variations.reset_variation_attr(img, 'src');
			Loop_Variations.reset_variation_attr(source, 'srcset');
			Loop_Variations.reset_variation_attr(img, 'alt');
			Loop_Variations.reset_variation_attr(img, 'width');
			Loop_Variations.reset_variation_attr(img, 'height');
			Loop_Variations.reset_variation_attr(picture, 'data-uniqueid');
			Loop_Variations.reset_variation_attr(picture, 'data-guid');
			Loop_Variations.reset_variation_attr(picture, 'data-path');
			Loop_Variations.reset_variation_attr(picture, 'data-no-bp');
			Loop_Variations.reset_variation_attr(picture, 'data-bp');
			Loop_Variations.reset_variation_attr(picture, 'data-width');
			Loop_Variations.reset_variation_attr(picture, 'data-height');
		},

		/**
		 * Update attributes of the div tag (background image)
		 */
		update_bg_attributes: function(bg, variations_img, variation) {
			if (SiteParameters.uncode_adaptive_async === '1') {
				bg.removeClass('async-done');
				bg.addClass('adaptive-async');
			}

			var new_style = "background-image:url('" + variations_img.src + "')";

			Loop_Variations.set_variation_attr(bg, 'style', new_style);
			Loop_Variations.set_variation_attr(bg, 'data-uniqueid', variations_img.uniqueid);
			Loop_Variations.set_variation_attr(bg, 'data-guid', variations_img.guid);
			Loop_Variations.set_variation_attr(bg, 'data-path', variations_img.path);
			Loop_Variations.set_variation_attr(bg, 'data-width', variations_img['data-width']);
			Loop_Variations.set_variation_attr(bg, 'data-height', variations_img['data-height']);
			Loop_Variations.set_variation_attr(bg, 'data-singlew', variations_img.singlew);
			Loop_Variations.set_variation_attr(bg, 'data-singleh', variations_img.singleh);

			if (SiteParameters.uncode_adaptive_async === '1') {
				UNCODE.adaptive();
			}
		},

		/**
		 * Reset attributes of the div tag (background image)
		 */
		reset_variation_bg: function(bg) {
			Loop_Variations.reset_variation_attr(bg, 'style');
			Loop_Variations.reset_variation_attr(bg, 'data-uniqueid');
			Loop_Variations.reset_variation_attr(bg, 'data-guid');
			Loop_Variations.reset_variation_attr(bg, 'data-path');
			Loop_Variations.reset_variation_attr(bg, 'data-width');
			Loop_Variations.reset_variation_attr(bg, 'data-height');
			Loop_Variations.reset_variation_attr(bg, 'data-singlew');
			Loop_Variations.reset_variation_attr(bg, 'data-singleh');
		},

		/**
		 * Select active attribute after filtering
		 */
		select_active_attributes: function() {
			$('.single-attribute-selector').each(function() {
				var selector = $(this);
				var tmb_wrapper = selector.closest('.tmb-woocommerce');
				var selector_type = '';

				if (tmb_wrapper.length === 0) {
					return;
				}

				var select_attr = selector.find('select');

				if (select_attr.length > 0) {
					var selected_attr = select_attr.val();
					selector_type = 'select';
				} else {
					var swatches = selector.find('.swatch');
					var active_swatch = selector.find('.swatch--active');
					if (swatches.length > 0) {
						selector_type = 'swatch';
					}
				}

				// Selects
				if (selector_type === 'select') {
					var attribute = select_attr.attr('data-attribute_name');
					var filter_attribute_key = UncodeWCParameters.pa_filter_prefix + attribute.replace('attribute_pa_', '');
					var selected_atts = Utils.get_url_parameter(filter_attribute_key);

					if (typeof selected_atts === 'string') {
						var selected_atts_arr = selected_atts.split(',');
						var selected_att = false;

						if (selected_atts_arr) {
							selected_att = selected_atts_arr[selected_atts_arr.length - 1];
						}

						if (selected_att) {
							select_attr.find('option').each(function() {
								var _this = $(this);
								var _val = _this.val();
								if (_val === selected_att) {
									select_attr.val(_val).trigger('change');
									return false;
								}
							})
						}
					}
				}

				// Swatches
				if (selector_type === 'swatch') {
					var attribute = selector.find('.swatches-select').attr('data-swatch-id');
					var filter_attribute_key = UncodeWCParameters.pa_filter_prefix + attribute.replace('pa_', '');
					var selected_atts = Utils.get_url_parameter(filter_attribute_key);

					if (typeof selected_atts === 'string') {
						var selected_atts_arr = selected_atts.split(',');
						var selected_att = false;

						if (selected_atts_arr) {
							selected_att = selected_atts_arr[selected_atts_arr.length - 1];
						}

						if (selected_att) {
							swatches.each(function() {
								var _this = $(this);
								if (_this.attr('data-swatch-value') === selected_att) {
									if (selector.hasClass('single-attribute-selector--hover') && !('ontouchstart' in window)) {
										_this.trigger('mouseenter', 'select_active_attributes');
									} else {
										_this.trigger('click', 'select_active_attributes');
									}

									return false;
								}
							})
						}
					}
				}
			});
		}
	}

	$(document).ready(function() {
		Single_Product.variable_add_to_cart();
		Single_Product.variation_gallery();
		Loop_Variations.init_forms();
		Loop_Variations.init_single_attributes();
		Loop_Variations.select_active_attributes();
	});

	$(document).on('uncode-quick-view-loaded', function() {
		Single_Product.has_variation_changed = false;
		Single_Product.doing_clear = false;
		Single_Product.first_load = true;
		Single_Product.variable_add_to_cart();
		Single_Product.variation_gallery();
		Loop_Variations.init_forms();
		Loop_Variations.init_single_attributes();
	});

	$(document).on('uncode-ajax-filtered more-items-loaded', function() {
		Loop_Variations.init_forms();
		Loop_Variations.init_single_attributes();
		Loop_Variations.select_active_attributes();
	});
})(jQuery);
