jQuery(function ($) {
	'use strict';
	/* global FeaturedImagesParameters, ajaxurl */

	var Uncode_Featured_Images = {
		init: function () {
			this.add_secondary_image();
		},

		add_secondary_image: function () {
			var add_secondary_featured_image_link = $('#set-secondary-post-thumbnail');
			var remove_secondary_featured_image_link = $('#remove-secondary-post-thumbnail');
			var secondary_image_frame;
			var secondary_image_input = $('#_uncode_secondary_thumbnail_id');

			add_secondary_featured_image_link.on('click', function (e) {
				e.preventDefault();

				var _this = $(this);

				// If the media frame already exists, reopen it.
				if (secondary_image_frame) {
					secondary_image_frame.open();
					return;
				}

				// Create the media frame.
				secondary_image_frame = wp.media.frames.secondary_image = wp.media({
					library: {type: 'image'},
					title: _this.data('modal-title'),
					multiple: false,
					filterable: 'all',
					className: 'media-frame foundation-image-frame secondary-image-frame',
					button: {
						text: _this.data('choose')
					},
				});

				// When an image is selected, run a callback.
				secondary_image_frame.on('select', function () {
					var selection = secondary_image_frame.state().get('selection');
					var attachment_id;


					selection.map(function (attachment) {
						attachment = attachment.toJSON();

						if (attachment.id) {
							attachment_id = attachment.id;

							// Get img markup via AJAX
							$.post(ajaxurl, {
								action: 'uncode_core_get_secondary_thumbnail_markup',
								post_id: FeaturedImagesParameters.post_id,
								thumbnail_id: attachment_id,
								get_secondary_thumbnail_markup_nonce: FeaturedImagesParameters.nonce
							}, function (response) {
								if (response && response.success === true) {
									var img = response.data.html;

									add_secondary_featured_image_link.html(img);
									$('.no-thumbnail-elements').removeClass('hidden');

									secondary_image_input.val(attachment_id)
								}
							});
						}
					});

					secondary_image_input.val(attachment_id);
				});

				// Finally, open the modal.
				secondary_image_frame.open();
			});

			remove_secondary_featured_image_link.on('click', function (e) {
				e.preventDefault();

				var link_text = add_secondary_featured_image_link.data('link-text')

				add_secondary_featured_image_link.html(link_text);
				secondary_image_input.val('');
				$('.no-thumbnail-elements').addClass('hidden');
			});
		}
	}

	$(document).ready(function () {
		Uncode_Featured_Images.init();
	});
});
