! function($) {
	"use strict";
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2011                          */
	/*    note: depends on Utf8 class                                                                 */
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	var Base64 = {}; // Base64 namespace
	Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	/**
	 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
	 * (instance method extending String object). As per RFC 4648, no newlines are added.
	 *
	 * @param {String} str The string to be encoded as base-64
	 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded
	 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
	 * @returns {String} Base64-encoded string
	 */
	Base64.encode = function(str, utf8encode) { // http://tools.ietf.org/html/rfc4648
			utf8encode = (typeof utf8encode == 'undefined') ? false : utf8encode;
			var o1, o2, o3, bits, h1, h2, h3, h4, e = [],
				pad = '',
				c, plain, coded;
			var b64 = Base64.code;
			plain = utf8encode ? Utf8.encode(str) : str;
			c = plain.length % 3; // pad string to length of multiple of 3
			if (c > 0) {
				while (c++ < 3) {
					pad += '=';
					plain += '\0';
				}
			}
			// note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
			for (c = 0; c < plain.length; c += 3) { // pack three octets into four hexets
				o1 = plain.charCodeAt(c);
				o2 = plain.charCodeAt(c + 1);
				o3 = plain.charCodeAt(c + 2);
				bits = o1 << 16 | o2 << 8 | o3;
				h1 = bits >> 18 & 0x3f;
				h2 = bits >> 12 & 0x3f;
				h3 = bits >> 6 & 0x3f;
				h4 = bits & 0x3f;
				// use hextets to index into code string
				e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
			}
			coded = e.join(''); // join() is far faster than repeated string concatenation in IE
			// replace 'A's from padded nulls with '='s
			coded = coded.slice(0, coded.length - pad.length) + pad;
			return coded;
		}
		/**
		 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
		 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
		 *
		 * @param {String} str The string to be decoded from base-64
		 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded
		 *   from UTF8 after conversion from base64
		 * @returns {String} decoded string
		 */
	Base64.decode = function(str, utf8decode) {
			utf8decode = (typeof utf8decode == 'undefined') ? false : utf8decode;
			var o1, o2, o3, h1, h2, h3, h4, bits, d = [],
				plain, coded;
			var b64 = Base64.code;
			coded = utf8decode ? Utf8.decode(str) : str;
			for (var c = 0; c < coded.length; c += 4) { // unpack four hexets into three octets
				h1 = b64.indexOf(coded.charAt(c));
				h2 = b64.indexOf(coded.charAt(c + 1));
				h3 = b64.indexOf(coded.charAt(c + 2));
				h4 = b64.indexOf(coded.charAt(c + 3));
				bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
				o1 = bits >>> 16 & 0xff;
				o2 = bits >>> 8 & 0xff;
				o3 = bits & 0xff;
				d[c / 4] = String.fromCharCode(o1, o2, o3);
				// check for padding
				if (h4 == 0x40) d[c / 4] = String.fromCharCode(o1, o2);
				if (h3 == 0x40) d[c / 4] = String.fromCharCode(o1);
			}
			plain = d.join(''); // join() is far faster than repeated string concatenation in IE
			return utf8decode ? Utf8.decode(plain) : plain;
		}
		/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
	window.itemIndex = function() {

		var sortedListStyle = function(){
			$.each($('.vc_sorted-list-container select'), function(index, val) {
				wrapSelect($(val));
			});
		}
		sortedListStyle();
		$('.vc_sorted-list-checkbox input').on('change', function(){
			setTimeout( sortedListStyle, 100 );
		});

		var $checkIfLoop = $('.wpb_el_type_loop .loop_field').length,
			$checkIfGallery = $('.uncode_gallery').length,
			$checkifSlider = $('[data-vc-shortcode="uncode_slider"]').length,
			$checkIfSingleMedia = $('.uncode_single_media').length;

		/**
		 * Single image
		 */
		if ($checkIfSingleMedia == 1) {
			var initSmediaEles = function(){
				$.each($('.vc_sorted-list-container select'), function(index, val) {
					wrapSelect($(val));
				});
			}
			$('li[data-tab-index="2"]').on('click', initSmediaEles );
			setTimeout(initSmediaEles, 2000);
		}

		if ($checkIfLoop == 0) {
			if ($checkIfGallery == 0 && !$checkifSlider) return;
		}
		if ($checkIfGallery == 0 && !$checkifSlider) {
			if ($checkIfLoop == 0) return;
		}
		/** fix el id field */
		var elId = $('input[name="el_id"]').val(),
			elId1 = $('input[name="el_id1"]').val();
		if (typeof elId === 'undefined' || elId == '') {
			elId = Math.floor(Math.random() * 90000) + 10000;
			if ($checkIfGallery == 1) {
				$('input[name="el_id"]').val('gallery-' + elId);
			} else if ( $checkifSlider ) {
				$('input[name="el_id"]').val('slider-' + elId);
				if (typeof elId1 === 'undefined' || elId1 == '') {
					$('input[name="el_id1"]').val('slider-' + elId);
				}
			} else {
				$('input[name="el_id"]').val('index-' + elId);
			}
		} else {
			if (typeof elId !== 'undefined' && elId.match(/^\d+$/)) {
				if ($checkIfGallery == 1) {
					$('input[name="el_id"]').val('gallery-' + elId);
				} else if ( $checkifSlider ) {
					$('input[name="el_id"]').val('slider-' + elId);
					if (typeof elId1 === 'undefined' || elId1 == '') {
						$('input[name="el_id1"]').val('slider-' + elId);
					}
				} else {
					$('input[name="el_id"]').val('index-' + elId);
				}
			}
		}
		/** fix sliders */

		/**
		 * Index specific
		 */
		if ($checkIfLoop == 1) {
			var $mainLoop = $('.wpb_el_type_loop .loop_field').val().split('|');
			var $typeFound = false;
			var $taxType = false;

			for (var $loop in $mainLoop) {
				if ($mainLoop[$loop].indexOf('taxonomy_query:') != -1) {
					$taxType = $mainLoop[$loop];
					$taxType = $taxType.replace('taxonomy_query:', '');
				}
			}

			if (!$taxType) {
				for (var $loop in $mainLoop) {
					if ($mainLoop[$loop].indexOf('post_type:') != -1) {
						$typeFound = $mainLoop[$loop];
					}
				}

				if ($typeFound) {
					var $typeFound = $typeFound.replace('post_type:', '');
					showHideSection($typeFound.split(','));
				} else {
					showHideSection(new Array('post'));
				}
			}

			showHideNavOption();

			$('select.index_type').on('change', function() {
				showHideNavOption();
			});

			$('.vc_loop-build').bind('click', function() {
				setTimeout(function() {
					$.each($('.loop_params_holder select'), function(index, val) {
						if (!$(this).parent().hasClass('select-wrapper')) $(this).wrap('<div class="select-wrapper"></div>');
					});
				}, 2000);
			});
			var initPostElements = function(){
				$.each($('.vc_sorted-list-container select'), function(index, val) {
					wrapSelect($(val));
					$(val).bind('change', function(event) {
						var el = event.currentTarget;
						setTimeout(function() {
							fixSortableListCallback($(el).closest('.vc_sorted-list').find('input.text_length'));
							fixSortableListCallbackLink($(el).closest('.vc_sorted-list').find('input.read_more_text'));
						}, 500);
					});
				});

				$(document).on('change', '.vc_sorted-list-container select', function() {
					wrapSelect($(this));
					$(this).bind('change', function(event) {
						var el = event.currentTarget;
						setTimeout(function() {
							fixSortableListCallback($(el).closest('.vc_sorted-list').find('input.text_length'));
							fixSortableListCallbackLink($(el).closest('.vc_sorted-list').find('input.read_more_text'));
						}, 500);
					});
				});

				$(document).on('change input paste', '.vc_sorted-list-container input[type="text"]', function(event) {
					var el = event.currentTarget;
					setTimeout(function() {
						$(el).closest('.vc_sorted-list').find('select').trigger('change')
					}, 500);
				});

				$('#vc_edit-form-tab-1 .vc_sorted-list-checkbox input').bind('change', function() {
					setTimeout(function() {
						$.each($('.vc_sorted-list-container select'), function(index, val) {
							wrapSelect($(val));
						});
						$.each($('.vc_sorted-list-container .vc_control-text'), function(index, val) {
							fixSortableListEvents($(val));
						});
						$.each($('.vc_sorted-list-container .vc_control-link'), function(index, val) {
							fixSortableListEventsLink($(val));
						});
					}, 500);
				});
				$('#vc_edit-form-tab-1 .vc_sorted-list-container').on("sortupdate", function(event, ui) {
					setTimeout(function() {
						$.each($('.vc_control-text', event.currentTarget), function(index, val) {
							fixSortableListEvents($(val));
						});
						$.each($('.vc_control-link', event.currentTarget), function(index, val) {
							fixSortableListEventsLink($(val));
						});
					}, 500);
				});
				$.each($('#vc_edit-form-tab-1 .vc_control-text'), function(index, val) {
					fixSortableListEvents($(val));
				});
				$.each($('#vc_edit-form-tab-1 .vc_control-link'), function(index, val) {
					fixSortableListEventsLink($(val));
				});
			};

			$('li[data-tab-index="1"]').on('click', function(){
				setTimeout(initPostElements, 1000);
			});
			setTimeout(initPostElements, 2000);

			$('#uncode_items_container, #uncode_matrix_items_container').sortable({
				axis: "y"
			});

			$('#uncode_items_container, #uncode_matrix_items_container').on("sortupdate", function(event, ui) {

				var $newIds = new Array(),
					newBundle = {},
					$ulThis = $(this),
					$containerUl = $ulThis.parent(),
					$bundleInput = $containerUl.find('.uncode_bundle_items'),
					$tab_block = $ulThis.closest('.vc_edit-form-tab'),
					$retrieveBundle;

				if ($ulThis.is('#uncode_matrix_items_container')) {

					ui.item.add(ui.item.siblings()).each(function(){
						var $uiItem = $(this),
							newIndex = $uiItem.index(),
							oldIndex = $uiItem.attr('data-id');

						if ( $bundleInput.val() != '' ) {
							$retrieveBundle = JSON.parse(Base64.decode($bundleInput.val()));
							if ( oldIndex + '_i' in $retrieveBundle ) {
								var bundleIndexVal = $retrieveBundle[oldIndex + '_i'];
								newBundle[newIndex + '_i'] = bundleIndexVal;
							}
						}
						$uiItem.attr('data-id', newIndex).find('.matrix-item-no').html(newIndex+1);
					});
					$bundleInput.val(Base64.encode(JSON.stringify(newBundle)));

				} else {
					$.each($('li', $ulThis), function(index, val) {
						if ($(val).attr('data-id') !== undefined) $newIds.push($(val).attr('data-id'));
					});
					$tab_block.find('.order_ids').val($newIds.join());
				}

			});
			$(document).on('change', $('.loop_params_holder input[name="post_type"]'), function() {
				var $taxType = $('.loop_params_holder select[name="taxonomy_query"]').val();

				if ($taxType === '') {
					if ($('.loop_params_holder input[name="post_type"]').length) {
						var $types = $('.loop_params_holder input[name="post_type"]').val().split(',');
						showHideSection($types);
					}
				}
			});
			$(document).on('change', '.loop_params_holder select[name="taxonomy_query"]', function() {
				window.showHideQueryBuilderOptions();
			});
			/** update query when some changes are made **/
			$('[data-vc-shortcode="vc_gallery"] li[data-tab-index="3"], [data-vc-shortcode="uncode_index"] li[data-tab-index="5"]').on('click', function(event) {
				$('select[name="post_matrix"]').trigger('change');
			});

			$('select[name="post_matrix"]').on('change', function(event){
				if ( $( ':selected', this ).val()=='' ) {
					load_item($('input.loop_field[name="loop"]').val());
				}
				if ( $( ':selected', this ).val()=='matrix' ) {
					load_item($('input.loop_field[name="loop"]').val(), $('#uncode_matrix_items_container'));
				}
			});

			$('.wpb_el_type_uncode_matrix_set_amount .matrix_amount').on('keyup', function(){
				$('.wpb_el_type_uncode_matrix_set_amount button').prop('disabled', false);
			});

			$('.wpb_el_type_uncode_matrix_set_amount button').on('click', function(){
				load_item($('input.loop_field[name="loop"]').val(), $('#uncode_matrix_items_container'));
				$(this).prop('disabled', true);
			});
		}
		/**
		 * Gallery specific
		 */
		if ($checkIfGallery == 1) {
			var $mainLoop = $('.uncode_gallery .uncode_gallery_attached_images_ids'),
				media = wp.media,
				Attachment = media.model.Attachment,
				$is_exploded_album = $('#explode_albums-yes').is(':checked') ? true : false,
				$is_custom_grid = $('select[name="type"]').val() === 'custom_grid' ? true : false;

			var initGaleryEles = function(){
				$.each($('.vc_sorted-list-container select'), function(index, val) {
					wrapSelect($(val));
				});
			}
			$('[data-vc-shortcode="vc_gallery"] li[data-tab-index="3"], [data-vc-shortcode="uncode_index"] li[data-tab-index="5"]').on('click', function(event) {
				$('select[name="post_matrix"]').trigger('change');
			});

			$('li[data-tab-index="1"]').on('click', function(){
				setTimeout(initGaleryEles, 1000);
			});
			setTimeout(initGaleryEles, 2000);

			$('#uncode_matrix_items_container').sortable({
				axis: "y"
			});

			$('#uncode_matrix_items_container').on("sortupdate", function(event, ui) {

				var $newIds = new Array(),
					newBundle = {},
					$ulThis = $(this),
					$containerUl = $ulThis.parent(),
					$bundleInput = $containerUl.find('.uncode_bundle_items'),
					$tab_block = $ulThis.closest('.vc_edit-form-tab'),
					$retrieveBundle;

				ui.item.add(ui.item.siblings()).each(function(){
					var $uiItem = $(this),
						newIndex = $uiItem.index(),
						oldIndex = $uiItem.attr('data-id');

					if ( $bundleInput.val() != '' ) {
						$retrieveBundle = JSON.parse(Base64.decode($bundleInput.val()));
						if ( oldIndex + '_i' in $retrieveBundle ) {
							var bundleIndexVal = $retrieveBundle[oldIndex + '_i'];
							newBundle[newIndex + '_i'] = bundleIndexVal;
						}
					}
					$uiItem.attr('data-id', newIndex).find('.matrix-item-no').html(newIndex+1);
				});
				$bundleInput.val(Base64.encode(JSON.stringify(newBundle)));
			});

			$('select[name="post_matrix"]').on('change', function(event){
				if ( $( ':selected', this ).val()=='' ) {
					if (!$is_exploded_album) {
						load_media($mainLoop.val().split(','));
					}
				}
				if ( $( ':selected', this ).val()=='matrix' ) {
					load_media($mainLoop.val().split(','), $('#uncode_matrix_items_container'));
				}
			});

			$('.wpb_el_type_uncode_matrix_set_amount .matrix_amount').on('keyup', function(){
				$('.wpb_el_type_uncode_matrix_set_amount button').prop('disabled', false);
			});

			$('.wpb_el_type_uncode_matrix_set_amount button').on('click', function(){
				load_media($mainLoop.val().split(','), $('#uncode_matrix_items_container'));
				$(this).prop('disabled', true);
			});

			showHideByIdItems($is_exploded_album);
			$('#explode_albums-yes').on('change', function() {
				$is_exploded_album = $(this).is(':checked') ? true : false;
				showHideByIdItems($is_exploded_album);
			});

			toggleCustomGridClass($is_custom_grid);
			$('select[name="type"]').on('change', function() {
				$is_custom_grid = $(this).val() === 'custom_grid' ? true : false;
				toggleCustomGridClass($is_custom_grid);
			});
		}

		function showHideByIdItems($exploded) {
			if ($exploded) {
				$('.wpb_el_type_uncode_items').hide();
				$('.by-id-dependent-field').show();
			} else {
				$('.wpb_el_type_uncode_items').show();
				$('.by-id-dependent-field').hide();
			}
		}

		function toggleCustomGridClass($is_custom_grid) {
			$('#uncode_items_container, #uncode_matrix_items_container').toggleClass('is-custom-grid', $is_custom_grid);
		}

		function fixSortableListEvents(el) {
			var $this = el,
				$list = $this.closest('.vc_sorted-list'),
				$listInput = $list.find('.sorted_list_field'),
				$inputVal = $listInput.val().split(','),
				$textLength = '',
				$textFound = false;
			for (var $index in $inputVal) {
				if ($inputVal[$index].indexOf('text|') != -1) {
					var $values = $inputVal[$index].split('|');
					for (var $i in $values) {
						if (/^\d+$/.test($values[$i])) {
							$textLength = $values[$i];
							$textFound = true;
						}
					}
				}
			}
			if ($list.find('input.text_length').length == 0) {
				if ($textFound) {
					$this.append('<div class="sorted-list-custom-text edit_form_line"><input type="text" class="wpb_vc_param_value text_length" name="text_length" value="' + $textLength + '" placeholder="Chars number…"></div>');
				} else {
					$this.append('<div class="sorted-list-custom-text edit_form_line"><input type="text" class="wpb_vc_param_value text_length" name="text_length" value="" placeholder="Chars number…"></div>');
				}
				$('input', $this).on('change input paste', function() {
					fixSortableListCallback(this);
				});
			} else {
				$.each($('input', $this), function(index, val) {
					fixSortableListCallback(val);
				});
			}
		}

		function fixSortableListCallback(el) {
			var $this = $(el),
				$list = $this.closest('.vc_sorted-list'),
				$listInput = $list.find('.sorted_list_field'),
				$textFound = false;
			if (/^\d+$/.test($this.val()))  {
				var $inputVal = $listInput.val().split(',');
				for (var $index in $inputVal) {
					if ($inputVal[$index].indexOf('text') != -1) {
						var $values = $inputVal[$index].split('|');
						for (var $i in $values) {
							if (/^\d+$/.test($values[$i])) {
								$inputVal[$index] = $inputVal[$index].replace($values[$i], $this.val());
								$textFound = true;
							}
						}
						if (!$textFound) $inputVal[$index] = $inputVal[$index] + '|' + $this.val();
						$inputVal[$index] = $inputVal[$index].replace(/\|$/, "");
					}
				}
				$listInput.val($inputVal.join(',')).change();
			}
		}

		function fixSortableListEventsLink(el) {
			var $this = el,
				$list = $this.closest('.vc_sorted-list'),
				$listInput = $list.find('.sorted_list_field'),
				$inputVal = $listInput.val().split(','),
				$textLength = '',
				$textFound = false;
			for (var $index in $inputVal) {
				if ($inputVal[$index].indexOf('link|') != -1) {
					var $values = $inputVal[$index].split('|');
					if (typeof $values[6] != 'undefined') {
						$textLength = $values[6];
						$textFound = true;
					} else if (typeof $values[4] != 'undefined' && $values[4] != 'default_width' && $values[4] != 'fluid_width') {
						$textLength = $values[4];
						$textFound = true;
					} else if (typeof $values[2] != 'undefined' && $values[2] != 'default_size' && $values[2] != 'small_size') {
						$textLength = $values[2];
						$textFound = true;
					}
				}
			}
			if ($list.find('input.read_more_text').length == 0) {
				if ($textFound) {
					$this.append('<div class="sorted-list-custom-link edit_form_line"><input type="text" class="wpb_vc_param_value read_more_text" name="read_more_text" value="' + $textLength + '" placeholder="' + SiteParameters.loc_strings.read_more + '"></div>');
				} else {
					$this.append('<div class="sorted-list-custom-link edit_form_line"><input type="text" class="wpb_vc_param_value read_more_text" name="read_more_text" value="" placeholder="' + SiteParameters.loc_strings.read_more + '"></div>');
				}
				$('input', $this).on('change input paste', function() {
					fixSortableListCallbackLink(this);
				});
			} else {
				$.each($('input', $this), function(index, val) {
					fixSortableListCallbackLink(val);
				});
			}
		}

		function fixSortableListCallbackLink(el) {
			var $this = $(el),
				$list = $this.closest('.vc_sorted-list'),
				$listInput = $list.find('.sorted_list_field'),
				$textFound = false;
			if ( typeof $listInput.val() !== 'undefined' && $this.val() != '')  {
				var $inputVal = $listInput.val().split(',');
				for (var $index in $inputVal) {
					if ($inputVal[$index].indexOf('ink') != -1) {
						var $values = $inputVal[$index].split('|');
						if (typeof $values[6] != 'undefined') {
							$inputVal[$index] = $inputVal[$index].replace($values[6], $this.val());
							$textFound = true;
						} else if (typeof $values[4] != 'undefined' && $values[4] != 'default_width' && $values[4] != 'fluid_width') {
							$inputVal[$index] = $inputVal[$index].replace($values[4], $this.val());
							$textFound = true;
						} else if (typeof $values[2] != 'undefined' && $values[2] != 'default_size' && $values[2] != 'small_size' && $values[2].indexOf('scale_') != -1 ) {
							$inputVal[$index] = $inputVal[$index].replace($values[3], $this.val());
							$textFound = true;
						}
						if (!$textFound) $inputVal[$index] = $inputVal[$index] + '|' + $this.val();
						$inputVal[$index] = $inputVal[$index].replace(/\|$/, "");
					}
				}
				$listInput.val($inputVal.join(',')).change();
			}
		}

		function wrapSelect($this) {
			if (!$this.parent().hasClass('select-wrapper')) $this.wrap('<div class="select-wrapper"></div>');
		}

		function showHideSection($types) {
			if ($types == '') $types = new Array('post');
			showHideWooFields($types);
			showHideSingleVariationsFields($types);
			$.each($('#vc_edit-form-tab-1 .sorted_list_field'), function(index, val) {
				var $found = false;
				for (var $type in $types) {
					if ($(this).hasClass($types[$type] + '_items') || $(this).hasClass($types[$type] + '_table_items')) {
						$found = true;
					}
				}
				if (!$found) {
					$(this).closest('.wpb_el_type_sorted_list').hide();
				} else {
					$(this).closest('.wpb_el_type_sorted_list').show();
				}
			});
		}

		function showHideSingleVariationsFields($types) {
			if ($types == '') {
				return false;
			}

			var fields = $('#vc_edit-form-tab-0 .woo-single-variations-field');

			fields.hide();

			for (var i = $types.length - 1; i >= 0; i--) {
				if ($types[i] === 'product') {
					fields.show();
					return true;
				}
			}
		}

		function showHideWooFields($types) {
			if ($types == '') {
				return false;
			}

			var woo_fields = $('#vc_edit-form-tab-2 .woo-dependent-field');

			woo_fields.hide();

			var auto_query_type_select = $('select.auto_query_type');
			var upsells_option = auto_query_type_select.find('option.up-sells-products');

			upsells_option.prop('disabled', true);

			for (var i = $types.length - 1; i >= 0; i--) {
				if ($types[i] === 'product') {
					woo_fields.show();
					upsells_option.prop('disabled', false);
					return true;
				}
			}
		}

		function showHideNavOption() {
			var layout = $('select.index_type');
			var auto_query_type_select = $('select.auto_query_type');
			var nav_option = auto_query_type_select.find('option.navigation');

			nav_option.prop('disabled', true);

			if (layout.val() === 'isotope' || layout.val() === 'css_grid' || layout.val() === 'titles') {
				nav_option.prop('disabled', false);
			} else {
				if (auto_query_type_select.val() === 'navigation') {
					auto_query_type_select.val('').trigger('change');
				}
			}
		}

		/**
		 * Horizontal scroll dependencies
		**/
		$('select[name="sticky_thumb_size"]').on('change check', function(){
			var $sticky_thumb_size = $(this),
				$single_text = $('select[name="single_text"]'),
				val_size = $sticky_thumb_size.val();
			if ( val_size === 'relative' || val_size === 'fluid' ) {
				$('option[value="under"]', $single_text).prop('disabled', true);
				$('option[value="lateral"]', $single_text).prop('disabled', true);
				$('option[value="overlay"]', $single_text).prop('selected', true);
			} else {
				$('option[value="under"]', $single_text).prop('disabled', false);
				$('option[value="lateral"]', $single_text).prop('disabled', false);
			}
			$single_text.trigger('change');
		});

		$('select[name="index_type"]').on('change check', function(){
			var $index_type = $(this),
				$single_text = $('select[name="single_text"]'),
				val_type = $index_type.val();
			if ( val_type !== 'horizontal-scroll' ) {
				$('option[value="under"]', $single_text).prop('disabled', false);
				$('option[value="lateral"]', $single_text).prop('disabled', false);
			}
			$single_text.trigger('change');
		});

		$('select[name="sticky_thumb_size"], select[name="index_type"]').trigger('check');

		var dependent_elements,
			mapped_params,
			$container,
			$containerParent,
			$bundleInput,
			$templateSingle,
			$templateCatEl,
			$templatePostObj,
			$templateMedia,
			$allItems,
			$custom_order,
			$order_ids,
			$matrix_amount;

		function load_media($media, $container) {
			if ( typeof $container === 'undefined' ) {
				$container = $('#uncode_items_container');
				$matrix_amount = false;
			} else {
				$matrix_amount = $container.closest('.vc_edit-form-tab').find('.matrix_amount').val();
			}
			var is_css_grid = $('select.type').val() === 'css_grid' ? true : false;
			$container.empty();
			$containerParent = $container.parent();
			$templateSingle = $('#vc_edit-form-tab-2').clone();
			$templateSingle.find('.simple-single-tab-disabled').remove();
			if (is_css_grid) {
				$templateSingle.find('.vc_shortcode-param:not(.wpb_el_type_vc_link)').remove();
			}
			$templateCatEl = $('#vc_edit-form-tab-1 .wpb_el_type_sorted_list');
			var has_media_elements = $templateCatEl.hasClass('simple-single-tab-disabled') ? false : true;
			$templateMedia = $('<div />');
			$bundleInput = $containerParent.find('.uncode_bundle_items');
			$('.spinner', $containerParent).css('visibility', 'visible').show();

			var $retrieveBundle;
			mapped_params = {};
			dependent_elements = {};
			/** prepare sort lit templates **/
			if (has_media_elements) {
				$.each($templateCatEl, function(index, val) {
					var $type = $(this).find('.sorted_list_field').attr('name');
					$type = $type.split('_');
					switch (String($type[0])) {
						case ('media'):
							$templateMedia.append($(this).clone());
							break;
					}
				});
			}
			/** reset sort list **/
			$('.vc_sorted-list-container', $templateMedia).html('');
			/** load sort list **/
			$.ajax({
				type: 'POST',
				url: window.ajaxurl,
				data: {
					action: 'uncode_get_medias',
					content: $media,
					matrix_amount: $matrix_amount,
					templateSingle: $templateSingle.html(),
					templateMedia: $templateMedia.html(),
				},
				dataType: 'html',
			}).done(function(html) {
				init_single_item_list(html, $container);
			});
		}

		function load_item($query, $container) {
			if ( typeof $container === 'undefined' ) {
				$container = $('#uncode_items_container');
				$matrix_amount = false;
			} else {
				$matrix_amount = $container.closest('.vc_edit-form-tab').find('.matrix_amount').val();
			}
			var is_css_grid = $('select.index_type').val() === 'css_grid' ? true : false;
			$container.empty();
			$containerParent = $container.parent();
			$bundleInput = $containerParent.find('.uncode_bundle_items');
			if (is_css_grid) {
				$templateSingle = false;
			} else {
				$templateSingle = $('#vc_edit-form-tab-3').clone();
			}
			$templateCatEl = $('#vc_edit-form-tab-1 .wpb_el_type_sorted_list');
			var has_post_elements = $templateCatEl.hasClass('simple-single-tab-disabled') ? false : true;
			$templatePostObj = {};
			$allItems = (($('#pagination-yes')[0].checked || $('#infinite-yes')[0].checked) ? true : false);
			$custom_order = (($('#custom_order-yes')[0].checked) ? true : false);
			$order_ids = $container.closest('.vc_edit-form-tab').find('.order_ids').val();

			if (!is_css_grid) {
				$($templateSingle).find('.vc-iconpicker, .vc-icons-selector').remove();
				$templateSingle.find('.simple-single-tab-disabled').remove();
			}
			$('.spinner', $containerParent).css('visibility', 'visible').show();
			$('button', $containerParent).attr('disabled');
			$('button', $containerParent).css('opacity', 0.5);
			/** prepare sort list templates **/
			if (has_post_elements) {
				$.each($templateCatEl, function(index, val) {
					var $type = $(this).find('.sorted_list_field').attr('name'),
					$templatePostType = $('<div />');
					var templateName = '';

					if ($type === 'uncode_taxonomy_items') {
						templateName = 'templateUncodeTaxonomy';
					} else if ($type === 'uncode_taxonomy_table_items') {
						templateName = 'templateUncodeTableTaxonomy';
					} else {
						if ( $type.indexOf('_table') != -1 ) {
							$type = $type.split('_');
							templateName = 'template' + $type[0].charAt(0).toUpperCase() + $type[0].slice(1) + 'Table';
						} else {
							$type = $type.split('_');
							templateName = 'template' + $type[0].charAt(0).toUpperCase() + $type[0].slice(1);
						}
					}

					$templatePostObj[String(templateName)] = $templatePostType.append($(this).clone()).html();
					/** reset sort list **/
					$('.vc_sorted-list-container', $templatePostObj[String(templateName)]).html('');
				});
			}
			$templatePostObj['action'] = 'uncode_get_query';
			$templatePostObj['content'] = $query;
			$templatePostObj['allItems'] = $allItems;
			$templatePostObj['templateSingle'] = $templateSingle ? $templateSingle.html() : false;
			$templatePostObj['custom_order'] = $custom_order;
			$templatePostObj['order_ids'] = $order_ids;
			$templatePostObj['matrix_amount'] = $matrix_amount;
			$templatePostObj['postid'] = $bundleInput.attr('data-post');

			/** load sort list **/
			$.ajax({
				type: 'POST',
				url: SiteParameters.admin_ajax,
				data: $templatePostObj,
				dataType: 'html',
			}).done(function(html) {
				init_single_item_list(html, $container);
			});
		}

		function sorted_list_callback(list) {
			var value = _.map(list.find('[data-name]'), function(element) {
				var return_string = encodeURIComponent($(element).data('name'));
				$(element).find('select').each(function() {
					var $sub_control = $(this);
					if ($sub_control.is('select') && $sub_control.val() !== '') {
						return_string += '|' + encodeURIComponent($sub_control.val());
					}
				});
				return return_string;
			}).join(',');
			var getList = list.closest('.vc_sorted-list').find('.sorted_list_field');
			getList.val(value);
			getList.trigger('change');
		}

		function init_single_item_list(html, $container) {
			var $retrieveBundle;
			mapped_params = {};
			dependent_elements = {};
			if (html == '') $container.html('<span class="vc_btn vc_btn-danger">Empty query</span>');
			else $container.html(html);
			$containerParent = $container.parent();
			$bundleInput = $containerParent.find('.uncode_bundle_items');
			$('.spinner', $containerParent).css('visibility', 'hidden').hide();
			$('button', $containerParent).removeAttr('disabled');
			$('button', $containerParent).css('opacity', 1);
			if ($bundleInput.val() != '') {
				$retrieveBundle = JSON.parse(Base64.decode($bundleInput.val()));
				for (var $index in $retrieveBundle) {
					var $item = $('li[data-id="' + parseInt($index) + '"]', $container);
					if ($item.length != 0) {
						$item.addClass('modified');
						$('.option-tree-setting-reset', $item).unbind('*').on('click', function() {
							$("body").addClass('wait');
							var $resetItem = $(this).closest('li'),
								$delIndex = $resetItem.attr('data-id');
							delete $retrieveBundle[$delIndex + '_i'];
							$('.uncode_bundle_items', $containerParent).val(Base64.encode(JSON.stringify($retrieveBundle)));
							$resetItem.removeClass('modified');
							$("body").removeClass('wait');
						});
						for (var $prop in $retrieveBundle[$index]) {
							var $itemProp, $propClass;
							if ( $prop.indexOf('single_layout_') != -1 ) {
								$propClass = $prop.replace('single_layout_','');
								$itemProp = $item.find('.sorted_list_field.' + $propClass);
							} else {
								$itemProp = $item.find('[name="' + $prop + '"]');
							}
							if (!$itemProp.is('input[type="checkbox"]')) {
								if ($itemProp.hasClass('type_numeric_slider')) {
									var getSlider = $itemProp.closest('.ot-numeric-slider-wrap').find('.ot-numeric-slider');
									getSlider.attr('data-value', $retrieveBundle[$index][$prop]);
								} else {
									$itemProp.val($retrieveBundle[$index][$prop]);
								}
							}
							$itemProp.trigger('change');
							$('span.' + $prop + '_factor', $item).html($retrieveBundle[$index][$prop]);
						}
					}
				}
			} else $retrieveBundle = new Object();
			$('.vc_sorted-list').each(function(){
				var $data_container = $(this).closest('[data-container]');
				if ( $data_container.length )
					$(this).find('li').hide();
				$(this).VcSortedList();
				$( document ).trigger( 'vc.display.lists')
			});
			$('.vc_sorted-list-container').on('sortupdate', function() {
				sorted_list_callback($(this));
			});
			/** fix sliders */
			window.initAllSliders();
			/** fix custom link */
			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('.wpb_el_type_vc_link'), function(index, val) {
				var $input = $('input', val),
					$val = $input.val(),
					value_object = $input.data('json'),
					$params_pairs = $val.split('|'),
					$url_label = $(val).find('.url-label'),
					$title_label = $(val).find('.title-label'),
					$result = Object();
				$.each($params_pairs, function(index, val) {
					var $param = val.split(':');
					if ($param[0] != '' && $param[1]) {
						$result[$param[0]] = unescape($param[1]);
					}
				});
				var json = String(JSON.stringify($result)).replace(/\//g, "\\/");
				$input.data('json', $result);
				$input.attr('data-json', json);
				$url_label.html($result.url + (($result.target != undefined) ? $result.target : ''));
				$title_label.html($result.title);
				vc.atts.vc_link.init('vc_link', $(val));
				$url_label.bind('DOMSubtreeModified', function() {
					$input.trigger('change');
				});
			});
			$.each($('.wpb_el_type_dropdown select'), function(index, val) {
				var $select = $(this),
					$container = $select.closest('.wpb_el_type_dropdown');
				$select.on('change', function() {
					var selected = $select.val();
					if (selected != '') {
						$('option', $select).removeAttr('selected');
						$('option[value="' + selected + '"]', $select).prop("selected", true);
					}
					if (selected == 'light' || selected == 'dark') {
						var $nextCont = $container.next(),
							$targetEl = $nextCont.find('.dropdown-colors-list li span');
						$.each($targetEl, function(index, val) {
							if ($(val).hasClass('style-light-bg') && selected == 'dark') {
								$(val).attr('class', String($(val).attr('class')).replace('style-light-bg', 'style-dark-bg'));
							}
							if ($(val).hasClass('style-dark-bg') && selected == 'light') {
								$(val).attr('class', String($(val).attr('class')).replace('style-dark-bg', 'style-light-bg'));
							}
						});
					}
				});
				if ($select.hasClass('single_width') || $select.hasClass('single_height')) {
					$select.closest('li').find($('span.' + $select.attr('name') + '_factor')).html($select.val());
				}
				if ($select.is('[name$=_color]')) {
					var $prevCont = $container.prev(),
						$prevSelect = $prevCont.find('.wpb-select'),
						$dropdownContainer = $select.closest('.colors-dropdown');
					if (window.navigator.userAgent.indexOf("Windows NT 10.0") == -1) {
						$('.selected', $dropdownContainer).remove();
						$('.carat', $dropdownContainer).remove();
						$('> div', $dropdownContainer).remove();
						$select.unwrap('.old');
						$select.unwrap('.colors-dropdown');
						$select.removeAttr('id');
						$select.easyDropDown({
							cutOff: 10,
						});
					}
					if ($prevSelect.length && ($prevSelect.val() == 'light' || $prevSelect.val() == 'dark')) $prevSelect.trigger('change');
				}
			});
			$.each($('.vc_sorted-list-container select'), function(index, val) {
				if (!$(this).parent().hasClass('select-wrapper')) $(this).wrap('<div class="select-wrapper"></div>');
			});
			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('.vc_control-media'), function(index, val) {
				refreshControlMedia(this, $retrieveBundle);
			});
			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('.vc_control-text'), function(index, val) {
				refreshControlText(this, $retrieveBundle);
			});
			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('.vc_control-link'), function(index, val) {
				refreshControlLink(this, $retrieveBundle);
			});
			$('input.text_length', $container).not('[bindset]').attr('bindset','true').on('change input paste', function(e){
				var $container = $(e.target).parents('ul.option-tree-setting-wrap').eq(0),
					dataContainer = $container.data('container'),
					$containerParent = $container.parent(),
					$bundleInput = $containerParent.find('.uncode_bundle_items'),
					$retrieveBundle = $bundleInput.val() != '' ? JSON.parse(Base64.decode($bundleInput.val())) : new Object(),

					data = {
						bundle: $retrieveBundle,
						bundleInput: $bundleInput,
						originOpt: dataContainer
					},
					buildObj = {target: e.target, data: data };
				buildBundle(buildObj);
			});
			$('input.read_more_text', $container).not('[bindset]').attr('bindset','true').on('change input paste', function(e){
				var $container = $(e.target).parents('ul.option-tree-setting-wrap').eq(0),
					dataContainer = $container.data('container'),
					$containerParent = $container.parent(),
					$bundleInput = $containerParent.find('.uncode_bundle_items'),
					$retrieveBundle = $bundleInput.val() != '' ? JSON.parse(Base64.decode($bundleInput.val())) : new Object(),

					data = {
						bundle: $retrieveBundle,
						bundleInput: $bundleInput,
						originOpt: dataContainer
					},
					buildObj = {target: e.target, data: data };
				buildBundle(buildObj);
			});
			$('input.type_numeric_slider', $container).not('[bindset]').attr('bindset','true').each(function(){
				var inputSlider = $(this),
					getSlider = inputSlider.closest('.ot-numeric-slider-wrap').find('.ot-numeric-slider');

				getSlider.on( "slidechange", function( e, ui ){
					var $container = $(e.target).parents('ul.option-tree-setting-wrap').eq(0),
						dataContainer = $container.data('container'),
						$containerParent = $container.parent(),
						$bundleInput = $containerParent.find('.uncode_bundle_items'),
						$retrieveBundle = $bundleInput.val() != '' ? JSON.parse(Base64.decode($bundleInput.val())) : new Object(),

						data = {
							bundle: $retrieveBundle,
							bundleInput: $bundleInput,
							originOpt: dataContainer
						},
						buildObj = {target: inputSlider, data: data };
					buildBundle(buildObj);
				});
			});
			$('input, select', $container).not('.type_numeric_slider').not('.text_length').not('.read_more_text').not('[bindset]').attr('bindset','true').on('change', function(e){
				var $container = $(e.target).parents('ul.option-tree-setting-wrap').eq(0),
					dataContainer = $container.data('container'),
					$containerParent = $container.parent(),
					$bundleInput = $containerParent.find('.uncode_bundle_items'),
					$retrieveBundle = $bundleInput.val() != '' ? JSON.parse(Base64.decode($bundleInput.val())) : new Object(),

					data = {
						bundle: $retrieveBundle,
						bundleInput: $bundleInput,
						originOpt: dataContainer
					},
					buildObj = {target: e.target, data: data };
				buildBundle(buildObj);
			});

			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('input.checkbox'), function(index, val) {
				$(this).removeAttr('id');
				var name = $(this).attr('name'),
					itemId = $(this).closest('.list-list-item').attr('data-id');
				if ($retrieveBundle.hasOwnProperty(String(itemId) + '_i')) {
					if ($retrieveBundle[String(itemId) + '_i'][name] != undefined) {
						if ($retrieveBundle[String(itemId) + '_i'][name] == 'yes') $(this).attr("checked", true);
						else $(this).attr("checked", false);
					}
				}
				$(this).removeAttr('name');
				$(this).attr('name', name + '_' + String(itemId));
			});
			/** fix iconpicker and init functions  **/
			$('#uncode_items_container, #uncode_matrix_items_container').find('> li .option-tree-setting-edit').bind('click', function() {
				var $container = $(this).closest('li'),
					$containerUl = $(this).parents('ul').eq(0),
					$iconContainer = $container.find('.wpb_el_type_iconpicker');
				if ($iconContainer.length == 1) {
					$('.vc-iconpicker, .vc-icons-selector', $containerUl).remove();
					if (!$(this).hasClass('active')) {
						$("body").addClass('wait');
						setTimeout(function() {
							var $vc_shortcode_type = $container.closest('.vc_ui-panel-window').attr('data-vc-shortcode');
							var $tab_index = $vc_shortcode_type ==='vc_gallery' ? 2 : 3;
							$('.vc-iconpicker-wrapper', $iconContainer).append($('#vc_edit-form-tab-' + $tab_index + ' .vc-iconpicker').clone());
							var $el = $iconContainer.find('.wpb_vc_param_value');
							var settings = $.extend({
								iconsPerPage: 100, // default icons per page for iconpicker
								iconDownClass: 'fa fa-arrow-down',
								iconUpClass: 'fa fa-arrow-up',
								iconLeftClass: 'fa fa-arrow-left',
								iconRightClass: 'fa fa-arrow-right',
								iconSearchClass: 'fa fa-search',
								iconCancelClass: 'fa fa-remove',
								iconBlockClass: 'fa fa-minus-circle'
							}, $el.data('settings'));
							$iconContainer.find('.vc-iconpicker').vcFontIconPicker(settings).on('change', function(e) {
								var $select = $(this);
								if (!$select.data('vc-no-check')) {
										$el.data('vc-no-check', true).val(this.value).trigger('change');
								}
								$select.data('vc-no-check', false);
							});
							var $select = $iconContainer.find('.vc-iconpicker');
							$select.val($el.val());
							$select.data('vc-no-check', true);
							$select.find('[value="' + $el.val() + '"]').prop("selected", true);
							$select.data('vcFontIconPicker').loadIcons(); // this methods actualy reload "active icon" and triggers event change
							$("body").removeClass('wait');
						}, 100);
					}
				}
			});
			$.each($('#uncode_items_container, #uncode_matrix_items_container').find('> li'), function(index, val) {
				var $liContent = $(val),
					callDependencies = {};
				$.each(vc_user_mapper['uncode_index']['params'], function() {
					var param = this;
					if ($.isPlainObject(param) && $.isPlainObject(param.dependency) && $.type(param.dependency.element)) {
						mapped_params[param.param_name] = param;
						var $masters = $('[name=' + ((_.isBoolean(param.dependency.is_empty) || param.dependency.value == 'yes') ? param.dependency.element + '_' + $liContent.attr('data-id') : param.dependency.element) + '].wpb_vc_param_value', $liContent),
							$slave = $('[name= ' + ((param.type == 'checkbox') ? param.param_name + '_' + $liContent.attr('data-id') : param.param_name) + '].wpb_vc_param_value', $liContent);
						$.each($masters, function() {
							var $master = $(this),
								name = $master.attr('name'),
								rules = param.dependency;
							if (!_.isArray(dependent_elements[$master.attr('name')])) dependent_elements[$master.attr('name')] = [];
							dependent_elements[$master.attr('name')].push($slave);
							if (!$master.attr('dependentSetted')) {
								$master.data('dependentSet') && $master.attr('dependentSetted', 'true') && $master.attr('data-dependent-set', 'true') && $master.bind('keyup change', hookDependent);
							}
							if (!callDependencies[name]) {
								callDependencies[name] = $master;
							}
						});
					}
				});
				$.each(callDependencies, function() {
					hookDependent({
						currentTarget: $(this)
					});
				});
				callDependencies = null;
			});
		}

		function hookDependent(e) {
			var $master = $(e.currentTarget),
				$master_container = $master.closest('.vc_column'),
				$list_container = $master.closest('.list-list-item'),
				$list_id = $list_container.attr('data-id'),
				is_empty,
				dependent_elements_hook = _.isArray(dependent_elements) ? dependent_elements_hook : dependent_elements[$master.attr('name')],
				master_value = $master.is(':checkbox') ? _.map($master_container.find('[name=' + $(e.currentTarget).attr('name') + '].wpb_vc_param_value:checked'), function(element) {
					return $(element).val();
				}) : $master.val();
			is_empty = $master.is(':checkbox') ? !$master_container.find('[name=' + $master.attr('name') + '].wpb_vc_param_value:checked').length : !master_value.length;
			if ($master_container.hasClass('vc_dependent-hidden')) {
				_.each(dependent_elements, function($element) {
					$(this).closest('.vc_column').addClass('vc_dependent-hidden');
				});
			} else {

				_.each(dependent_elements_hook, function($element) {
					var $li_element = $element.closest('.list-list-item');
					if ($li_element.attr('data-id') == $list_id) {
						var param_name = $element.attr('name');
						if (/\d/.test(param_name)) {
							param_name = param_name.replace(/\d+/g, '');
							param_name = param_name.substring(0, param_name.length - 1)
						}
						var rules = _.isObject(mapped_params[param_name]) && _.isObject(mapped_params[param_name].dependency) ? mapped_params[param_name].dependency : {},
							$param_block = $element.closest('.vc_column');
						if (_.isBoolean(rules.not_empty) && rules.not_empty === true && !is_empty) { // Check is not empty show dependent Element.
							$param_block.removeClass('vc_dependent-hidden');
						} else if (_.isBoolean(rules.is_empty) && rules.is_empty === true && is_empty) {
							$param_block.removeClass('vc_dependent-hidden');
						} else if (rules.value && _.intersection((_.isArray(rules.value) ? rules.value : [rules.value]), (_.isArray(master_value) ? master_value : [master_value])).length) {
							$param_block.removeClass('vc_dependent-hidden');
						} else if (rules.value_not_equal_to && !_.intersection((_.isArray(rules.value_not_equal_to) ? rules.value_not_equal_to : [rules.value_not_equal_to]), (_.isArray(master_value) ? master_value : [master_value])).length) {
							$param_block.removeClass('vc_dependent-hidden');
						} else {
							$param_block.addClass('vc_dependent-hidden');
						}
						var event = jQuery.Event('change');
						event.extra_type = 'vcHookDepended';
					}
				}, this);
			}
		};

		function buildBundle(e) {
			var $this = $(e.target),
				$retrieveBundle = e.data.bundle,
				$bundleInput = e.data.bundleInput,
				originOpt = e.data.originOpt,
				post_items = $this.parents('.vc_shortcode-param').eq(0).attr('data-vc-shortcode-param-name'),
				$select = $('select[name="post_matrix"]'),
				selectedOpt;
			setTimeout(function() {
				var itemId = $this.closest('.list-list-item').attr('data-id'),
					itemVal = $this.val(),
					itemKey = $this.attr('name');

				if ($this.hasClass('sorted_list_field')) itemKey = 'single_layout_' + post_items;
				/** fix for checkbox **/
				if ($this.is("input") && itemKey.indexOf('_' + itemId) > 0) {
					itemKey = itemKey.replace('_' + itemId, '');
					if (!$this[0].checked) itemVal = 'no';
				}
				if (itemKey == undefined) {
					if ($this.closest('.vc_sorted-list').length) itemKey = 'vc_sorted_list_element';
				}
				/** fix for sorted list elements **/
				if (itemKey == 'vc_sorted_list_element') {
					$.each($('.vc_sorted-list-container select', $this.closest('.vc_sorted-list')), function(index, val) {
						if (!$(this).parent().hasClass('select-wrapper')) $(this).wrap('<div class="select-wrapper"></div>');
					});
					if (itemVal == 'media') {
						if ($this.is(':checked')) refreshControlMedia($this.closest('.vc_sorted-list').find('.vc_control-media'), $retrieveBundle);
					}
					if (itemVal == 'text') {
						if ($this.is(':checked')) refreshControlText($this.closest('.vc_sorted-list').find('.vc_control-text'), $retrieveBundle);
					}
					if (itemVal == 'link') {
						if ($this.is(':checked')) refreshControlLink($this.closest('.vc_sorted-list').find('.vc_control-link'), $retrieveBundle);
					}
					setTimeout(function() {
						var $listContainer = $this.closest('.vc_sorted-list').find('li[data-name=' + itemVal + ']');
						$.each($('input,select', $listContainer), function(index, val) {
							if (!$(val).attr('bindset')) {
								if ($(this).hasClass('text_length') || $(this).hasClass('read_more_text')) $(val).attr('bindset', 'true').bind('change input paste', {
									bundle: $retrieveBundle,
									bundleInput: $bundleInput,
								}, buildBundle);
								else $(val).attr('bindset', 'true').bind('change', {
									bundle: $retrieveBundle,
									bundleInput: $bundleInput
								}, buildBundle);
							}
						});
					}, 250);
				}
				/** change visual values **/
				if (itemKey == 'single_width' || itemKey == 'single_height') {
					$this.closest('li').find($('span.' + itemKey + '_factor')).html(itemVal);
				}

				/** change bundle values **/
				if ($retrieveBundle.hasOwnProperty(String(itemId) + '_i')) {
					if (itemKey == 'vc_sorted_list_element' || itemKey == undefined || itemKey == 'back_image') {
						var $listProp = $this.closest('.vc_sorted-list').find('.sorted_list_field').val();
						if (itemKey == 'back_image') $retrieveBundle[String(itemId) + '_i']['back_image'] = itemVal;
						itemKey = 'single_layout_' + post_items;
						if ($listProp != '') $retrieveBundle[String(itemId) + '_i'][itemKey] = $listProp;
						else delete $retrieveBundle[String(itemId) + '_i'][itemKey];
					} else $retrieveBundle[String(itemId) + '_i'][itemKey] = itemVal;
				} else {
					var obj = new Object();
					if (itemKey == 'vc_sorted_list_element' || itemKey == undefined || itemKey == 'back_image') {
						var $listProp = $this.closest('.vc_sorted-list').find('.sorted_list_field').val();
						if (itemKey == 'back_image') obj['back_image'] = itemVal;

						itemKey = 'single_layout_' + post_items;
						if ($listProp != '') obj[itemKey] = $this.closest('.vc_sorted-list').find('.sorted_list_field').val();
					} else obj[itemKey] = itemVal;
					$retrieveBundle[String(itemId) + '_i'] = obj;
				}

				selectedOpt = $('option:selected', $select).val();
				if ( selectedOpt === originOpt || !$select.length )
					$bundleInput.val(Base64.encode(JSON.stringify($retrieveBundle)));
			}, 250);
		};

		function refreshControlMedia(el, $retrieveBundle) {
			var $this = $(el),
				$list = $this.closest('.vc_sorted-list'),
				$listParentId = $this.closest('.list-list-item').attr('data-id'),
				$listInput = $list.find('.sorted_list_field'),
				$inputVal = $listInput.val().split(','),
				$mediaId = '',
				$mediaFound = false;
			for (var $index in $inputVal) {
				if ($inputVal[$index].indexOf('media|') != -1) $mediaFound = true;
			}
			try {
				$mediaId = $retrieveBundle[$listParentId + '_i']['back_image'];
			} catch (e) {}
			if ($mediaFound && $mediaFound != '') {
				var $div = '<div class="sorted-list-custom-media edit_form_line"><input type="hidden" class="wpb_vc_param_value uncode_gallery_attached_images_ids back_image media_element" name="back_image" value=""><div class="uncode_widget_attached_images"><ul class="uncode_widget_attached_images_list"></ul></div><div class="gallery_widget_site_images"></div><a class="add_media_widget button" href="#" use-single="true" title="Add media">Add media</a></div>';
				if ($mediaId != '' && $mediaId != undefined && $mediaFound) {
					$.ajax({
						type: 'POST',
						url: window.ajaxurl,
						data: {
							action: 'fieldAttachedMedia',
							mediaid: $mediaId
						},
						dataType: 'html',
					}).done(function(html) {
						$mediaId = html;
						$this.append('<div class="sorted-list-custom-media edit_form_line"><input type="hidden" class="wpb_vc_param_value uncode_gallery_attached_images_ids back_image media_element" name="back_image" value=""><div class="uncode_widget_attached_images"><ul class="uncode_widget_attached_images_list">' + $mediaId + '</ul></div><div class="gallery_widget_site_images"></div><a class="add_media_widget button" href="#" use-single="true" title="Add media">Add media</a></div>');
					});
				} else $this.append($div);
			} else $this.append($div);
		}

		function refreshControlText(el, $retrieveBundle) {
			var $this = $(el),
				$list = $this.closest('.vc_sorted-list'),
				$listParentId = $this.closest('.list-list-item').attr('data-id'),
				$listInput = $list.find('.sorted_list_field'),
				$inputVal = $listInput.val().split(','),
				$textLength = '',
				$textFound = false;
			for (var $index in $inputVal) {
				if ($inputVal[$index].indexOf('text|') != -1) $textFound = true;
			}
			try {
				$textLength = $retrieveBundle[$listParentId + '_i']['text_length'];
			} catch (e) {}
			if ($textFound && $textFound != '' && !$('.text_length', $this).length) {
				var $div = '<div class="sorted-list-custom-text edit_form_line"><input type="text" class="wpb_vc_param_value text_length" name="text_length" value="" placeholder="Chars number…"></div>';
				if ($textLength != '' && $textLength != undefined && $textFound) {
					$this.append('<div class="sorted-list-custom-text edit_form_line"><input type="text" class="wpb_vc_param_value text_length" name="text_length" value="' + $textLength + '" placeholder="Chars number…"></div>');
				} else $this.append($div);
			} else $this.append($div);
		}

		function refreshControlLink(el, $retrieveBundle) {
			var $this = $(el),
				$list = $this.closest('.vc_sorted-list'),
				$listParentId = $this.closest('.list-list-item').attr('data-id'),
				$listInput = $list.find('.sorted_list_field'),
				$inputVal = $listInput.val().split(','),
				$textLength = '',
				$textFound = false;
			for (var $index in $inputVal) {
				if ($inputVal[$index].indexOf('link|') != -1) {
					$textFound = true;
				}
			}
			try {
				$textLength = $retrieveBundle[$listParentId + '_i']['read_more_text'];
			} catch (e) {}
			if ($textFound && $textFound != '' && !$('.read_more_text', $this).length) {
				var $div = '<div class="sorted-list-custom-link edit_form_line"><input type="text" class="wpb_vc_param_value read_more_text" name="read_more_text" value="" placeholder="' + SiteParameters.loc_strings.read_more + '"></div>';
				if ($textLength != '' && $textLength != undefined && $textFound) {
					$this.append('<div class="sorted-list-custom-link edit_form_line"><input type="text" class="wpb_vc_param_value read_more_text" name="read_more_text" value="' + $textLength + '" placeholder="' + SiteParameters.loc_strings.read_more + '"></div>');
				} else $this.append($div);
			} else $this.append($div);
		}
	}
	if ( typeof window.vc !== 'undefined' ) {
		window.vc.events.on('backend.shortcodeViewChangeParams:uncode_index', function() {
			$('.admin_label_loop').each(function() {
				var _this = $(this);
				var text = _this.text();

				var chunks = text.split(': ');

				if (chunks[1]) {
					var new_value = '';
					var values = chunks[1];
					var is_tax = false;

					values = values.split('|');

					for (var i = values.length - 1; i >= 0; i--) {
						if (values[i].substring(0, 14) === 'taxonomy_query') {
							is_tax = true;
							break;
						}
					}

					var new_values = [];

					if (is_tax) {
						for (var i = values.length - 1; i >= 0; i--) {
							if (values[i].substring(0, 9) === 'taxonomy_') {
								new_values.push(values[i]);
							}
						}
					} else {
						for (var i = values.length - 1; i >= 0; i--) {
							if (values[i].substring(0, 9) !== 'taxonomy_') {
								new_values.push(values[i]);
							}
						}
					}

					new_value += '<label>' + chunks[0] + '</label>';
					new_value += ': ';
					new_value += new_values.join('|');

					_this.html(new_value);
				}
			});
		});
	}

	window.showHideQueryBuilderOptions = function($taxType) {
		var $taxType = typeof $taxType  === 'undefined' ? $('.loop_params_holder select[name="taxonomy_query"]').val() : $taxType;

		if ($taxType !== '') {
			$('.loop_params_holder').find('.vc_row').hide();
			$('.loop_params_holder').find('.vc_row--taxonomy_query').show();
			$('.loop_params_holder').find('.vc_row--taxonomy-field').show();
			window.showHidePostSortedListFields();
			window.showHidePostRelatedFields('hide');

			if ($taxType.startsWith('product_') || $taxType.startsWith('pa_')) {
				$('#vc_edit-form-tab-0 .woo-single-variations-field').show();
			} else {
				$('#vc_edit-form-tab-0 .woo-single-variations-field').hide();
			}
		} else {
			$('.loop_params_holder').find('.vc_row').show();
			$('.loop_params_holder').find('.vc_row--taxonomy-field').hide();
			window.showHidePostRelatedFields('show');
			$('#vc_edit-form-tab-0 .woo-single-variations-field').hide();
		}
	}

	window.showHidePostSortedListFields = function() {
		// Hide post fields and show tax field
		$('#vc_edit-form-tab-1').find('.wpb_el_type_sorted_list').hide();
		$('#vc_edit-form-tab-1').find('.wpb_el_type_sorted_list[data-vc-shortcode-param-name="uncode_taxonomy_items"]').show();
		$('#vc_edit-form-tab-1').find('.wpb_el_type_sorted_list[data-vc-shortcode-param-name="uncode_taxonomy_table_items"]').show();
		$(document).trigger('showHidePostSortedListFields');
	}

	window.showHidePostRelatedFields = function(state) {
		var post_fields = $('#vc_ui-panel-edit-element .post-dependent-field');
		var pagination_fields = $('#vc_ui-panel-edit-element .pagination-field');

		if (state === 'hide') {
			post_fields.hide();
			pagination_fields.hide();
			$(document).trigger('uncodeHidePostRelatedFields');
		} else {
			post_fields.show();
			pagination_fields.show();
			$(document).trigger('uncodeShowPostRelatedFields');
		}
	}

	//Justify content
	window.showHideJustifyContent = function() {
		var	$panel_uncode_index = $('#vc_ui-panel-edit-element[data-vc-shortcode="uncode_index"]'),
			$index_type = $('[data-vc-shortcode-param-name="index_type"]', $panel_uncode_index),
			$justify_field = $('[data-vc-shortcode-param-name="content_justify"]', $panel_uncode_index);

		var checkIndexTypeVal = function(){
			var typeVal = $('option:selected', $index_type).val();

			if ( typeVal !== 'css_grid' ) {
				$justify_field.hide();
			} else {
				$justify_field.show();
			}
		};

		checkIndexTypeVal();
		$index_type.on('change', checkIndexTypeVal);

	}


	//Justify content
	window.showHideStickyInnnerRows = function() {
		var	$panel_row = $('#vc_ui-panel-edit-element[data-vc-shortcode="vc_row"]'),
			$animation_state = $('[data-vc-shortcode-param-name="animation_state"]', $panel_row),
			//$animation_last_sticky = $('[data-vc-shortcode-param-name="animation_last_sticky"]', $panel_row),
			//
			$no_animation_last = $('[data-vc-shortcode-param-name="no_animation_last"] input[name="no_animation_last"]', $panel_row),
			$animation_anticipate = $('[data-vc-shortcode-param-name="animation_anticipate"]', $panel_row);

		var checkDepend = function(){
			var typeVal = $('option:selected', $animation_state).val(),
				anticipateVal = $no_animation_last.is(':checked') ? true : false;

			// if ( typeVal !== 'end' ) {
			// 	$animation_last_sticky.hide();
			// } else {
			// 	$animation_last_sticky.show();
			// }

			if ( typeVal !== 'end' && anticipateVal ) {
				$animation_anticipate.show();
			} else {
				$animation_anticipate.hide();
			}
		};

		checkDepend();
		$animation_state.on('change', checkDepend);
		$animation_anticipate.on('change', checkDepend);

	}

}(window.jQuery);
