(function($) {
	"use strict";
	/* global jQuery, UncodeAdminProductParams */

	var Uncode_Variation_Gallery = {
		init: function() {
			var variation_ids = Uncode_Variation_Gallery.get_variation_ids();

			if (window.UncodeAdminProductParams == undefined) {
				return;
			}

			if (variation_ids.length) {
				$.ajax({
					url: ajaxurl,
					data: {
						action: 'uncode_wc_get_variation_gallery_html',
						nonce_uncode_wc_variation_gallery_html: UncodeAdminProductParams.variation_gallery_nonce,
						variation_ids: variation_ids
					},
					method: 'post',
					success: function(response) {
						if (response.success === false || !(response.data && response.data.images)) {
							if (UncodeAdminProductParams.enable_debug == true) {
								// This console log is disabled by default
								// So nothing is printed in a typical installation
								//
								// It can be enabled for debugging purposes setting
								// the 'uncode_enable_debug_on_js_scripts' filter to true
								if (response.data && response.data.error) {
									console.log(response.data.error);
								} else {
									console.log('There was an error when loading the variation gallery');
								}
							}

							return;
						}

						if (response.data.images) {
							var images = response.data.images;

							var variation_inputs = $('#variable_product_options .woocommerce_variation').find('input.variable_post_id');

							variation_inputs.each(function() {
								var _this = $(this);
								var variation_id = _this.val();

								var container = _this.closest('.woocommerce_variation');

								if (images.hasOwnProperty(variation_id)) {
									var html = '<h4 class="uncode-variation-gallery-title">' + UncodeAdminProductParams.i18n_variation_gallery_title + '</h4>' + images[variation_id] + '<a href="#" class="uncode-variation-gallery-add button button-primary button-large">' + UncodeAdminProductParams.i18n_variation_gallery_media_add + '</a>';

									if (!(container.find('ul.uncode-variation-gallery-list').length > 0)) {
										container.find('.form-row.options').eq(0).before(html);
									}
								}
							});

							Uncode_Variation_Gallery.sortable();
						}
					},
					error: function() {
						if (UncodeAdminProductParams.enable_debug == true) {
							// This console log is disabled by default
							// So nothing is printed in a typical installation
							//
							// It can be enabled for debugging purposes setting
							// the 'uncode_enable_debug_on_js_scripts' filter to true
							console.log('There was an error when loading the variation gallery');
						}
					}
				});
			}

			// Add images
			$('#variable_product_options .woocommerce_variation').on('click', '.uncode-variation-gallery-add', function(e) {
				e.preventDefault();

				var _this = $(this);
				// var link = $(e.target);
				var container = _this.closest('.woocommerce_variation');
				var variation_id = container.find('input.variable_post_id').val();
				var list = container.find('ul.uncode-variation-gallery-list');
				var variations_gallery_frame;

				// Create the media frame.
				variations_gallery_frame = wp.media.frames.variations_gallery = wp.media({
					title: UncodeAdminProductParams.i18n_variation_gallery_title,
					button: {
						text: UncodeAdminProductParams.i18n_variation_gallery_add
					},
					states: [
						new wp.media.controller.Library({
							title: _this.data('choose'),
							filterable: 'all',
							multiple: true
						})
					]
				});

				// When an image is selected, run a callback.
				variations_gallery_frame.on('select', function() {
					var selection = variations_gallery_frame.state().get('selection');

					selection.map( function( attachment ) {
						attachment = attachment.toJSON();

						if (attachment.id && attachment.type && attachment.type === 'image') {
							var attachment_image = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;

							list.append( '<li><a href="#" class="uncode-variation-gallery-thumb remove" rel="' + attachment.id + '"><img src="' + attachment_image + '"></a></li>' );
						}
					});

					wp.media.model.settings.post.id = variation_id;

					Uncode_Variation_Gallery.sortable();
					Uncode_Variation_Gallery.update_thumbs(variation_id);
				});

				// Finally, open the modal.
				variations_gallery_frame.open();
			});

			// Delete images
			$('#variable_product_options .woocommerce_variation').on('click', '.uncode-variation-gallery-thumb', function(e) {
				e.preventDefault();

				var _this = $(this);
				var container = _this.closest('.woocommerce_variation');
				var variation_id = container.find('input.variable_post_id').val();
				_this.parent( 'li' ).remove();

				Uncode_Variation_Gallery.update_thumbs(variation_id);
			});
		},

		get_variation_ids: function() {
			var ids = [];

			$('#variable_product_options .woocommerce_variation').each(function() {
				ids.push($(this).find('input.variable_post_id').val());
			});

			return ids;
		},

		sortable: function() {
			$('#variable_product_options .woocommerce_variation').each(function() {
				var _this = $(this);
				var variation_id = _this.find('input.variable_post_id').val();

				_this.find('ul.uncode-variation-gallery-list').sortable({
					update: function() {
						Uncode_Variation_Gallery.update_thumbs(variation_id);
					},
					placeholder: 'sortable-placeholder',
					cursor: 'move'
				});
			});
		},

		update_thumbs: function(variation_id) {
			if (!(variation_id.length > 0)) {
				return;
			}

			var thumbs_order = [];
			var variation_inputs = $('#variable_product_options .woocommerce_variation').find('input.variable_post_id');

			variation_inputs.each(function() {
				var _this = $(this);
				var current_variation_id = _this.val();
				container = _this.closest('.woocommerce_variation');

				if (variation_id === current_variation_id) {
					var container = _this.closest('.woocommerce_variation');
					var list = container.find('ul.uncode-variation-gallery-list');

					if (list.length > 0) {
						list.find('li').each(function() {
							thumbs_order.push($(this).find('.uncode-variation-gallery-thumb').attr('rel'));
						});
						container.find( 'input.uncode-variation-gallery-ids' ).val(thumbs_order);
					} else {
						container.find( 'input.uncode-variation-gallery-ids' ).val('');
					}

					// Trigger update
					$('#variable_product_options').find('input').eq(0).change();
					container.addClass('variation-needs-update');

					return false;
				}
			});
		}
	}

	if (UncodeAdminProductParams.default_gallery_enabled != true) {
		$('body').on('woocommerce_variations_added woocommerce_variations_loaded', function() {
			Uncode_Variation_Gallery.init();
		});
	}
})(jQuery);
