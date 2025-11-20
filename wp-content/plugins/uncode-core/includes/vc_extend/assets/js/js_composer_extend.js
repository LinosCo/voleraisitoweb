jQuery(document).ready(function($) {
	if (window.VcSectionView && !$('body.compose-mode').length) {
		window.UncodeSectionView = window.VcSectionView.extend({
			buildDesignHelpers: function() {
				var color = this.model.getParam('back_color'),
					image = this.model.getParam('back_image'),
					$column_edit = this.$el.find('> .vc_controls .column_edit'),
					$image, $color = '';
				var color_type = this.model.getParam('back_color_type');
				if (color_type === 'uncode-solid') {
					var color_solid = this.model.getParam('back_color_solid');
					if (color_solid) {
						color = color_solid;
					}
				} else if (color_type === 'uncode-gradient') {
					var color_gradient = this.model.getParam('back_color_gradient');
					if (color_gradient) {
						color = JSON.parse(color_gradient);
					}
				} else {
					color_type = 'uncode-palette';
				}
				this.$el.find('> .vc_controls .vc_row_color').remove();
				this.$el.find('> .vc_controls .vc_row_image').remove();
				if (color) {
					$color = $('<span class="vc_row_color"></span>');
					if (color_type === 'uncode-palette') {
						$color.addClass('style-' + color + '-bg');
					} else if (color_type === 'uncode-solid') {
						$color.css('background', color);
					} else if (color_type === 'uncode-gradient') {
						$color.css('background', color);
						$color.attr('style', color.css);
					}
					$color.insertAfter($column_edit);
				}
				if (image) {
					$.ajax({
						type: 'POST',
						url: window.ajaxurl,
						data: {
							action: 'uncode_get_media_post',
							content: image
						},
						dataType: 'JSON'
					}).done(function(data) {
						if ($color == '') {
							$color = $('<span class="vc_row_color"></span>');
							$color.insertAfter($column_edit);
						}
						if (data.back_url != '') $color.addClass('image_viewer').html($('<span class="vc_row_image" style="' + data.back_url + '"></span>'));
						if (data.back_icon != '') $color.html($('<span class="vc_row_image" title="' + (data.back_mime).replace("oembed/", "") + '">' + data.back_icon + '</span>'));
					});
				}
			},
			ready: function(e) {
				window.UncodeRowView.__super__.ready.call(this, e);
				if (this.$content.closest('.wpb_uncode_slider').length) {
					var row_inner = this.$content.closest('.wpb_vc_row_inner.wpb_sortable');
					row_inner.prepend("<h3>Slide</h3>");
				}
				return this;
			},
		});
	}
	if (window.VcRowView && !$('body.compose-mode').length) {
		window.UncodeRowView = window.VcRowView.extend({
			buildDesignHelpers: function() {
				var color = this.model.getParam('back_color'),
					image = this.model.getParam('back_image'),
					$column_edit = this.$el.find('> .vc_controls .column_edit'),
					$image, $color = '';
				var color_type = this.model.getParam('back_color_type');
				if (color_type === 'uncode-solid') {
					var color_solid = this.model.getParam('back_color_solid');
					if (color_solid) {
						color = color_solid;
					}
				} else if (color_type === 'uncode-gradient') {
					var color_gradient = this.model.getParam('back_color_gradient');
					if (color_gradient) {
						color = JSON.parse(color_gradient);
					}
				} else {
					color_type = 'uncode-palette';
				}
				this.$el.find('> .vc_controls .vc_row_color').remove();
				this.$el.find('> .vc_controls .vc_row_image').remove();
				if (color) {
					$color = $('<span class="vc_row_color"></span>');
					if (color_type === 'uncode-palette') {
						$color.addClass('style-' + color + '-bg');
					} else if (color_type === 'uncode-solid') {
						$color.css('background', color);
					} else if (color_type === 'uncode-gradient') {
						$color.css('background', color);
						$color.attr('style', color.css);
					}
					$color.insertAfter($column_edit);
				}
				if (image) {
					$.ajax({
						type: 'POST',
						url: window.ajaxurl,
						data: {
							action: 'uncode_get_media_post',
							content: image
						},
						dataType: 'JSON'
					}).done(function(data) {
						if ($color == '') {
							$color = $('<span class="vc_row_color"></span>');
							$color.insertAfter($column_edit);
						}
						if (data.back_url != '') $color.addClass('image_viewer').html($('<span class="vc_row_image" style="' + data.back_url + '"></span>'));
						if (data.back_icon != '') $color.html($('<span class="vc_row_image" title="' + (data.back_mime).replace("oembed/", "") + '">' + data.back_icon + '</span>'));
					});
				}
			},
			ready: function(e) {
				window.UncodeRowView.__super__.ready.call(this, e);
				if (this.$content.closest('.wpb_uncode_slider').length) {
					var row_inner = this.$content.closest('.wpb_vc_row_inner.wpb_sortable');
					row_inner.prepend("<h3>Slide</h3>");
				}

				return this;
			},
		});
	}
	window.UncodeSingleMedia = vc.shortcode_view.extend({
		changeShortcodeParams: function ( model ) {
			window.UncodeBlockView.__super__.changeShortcodeParams.call( this, model );
			var params = model.get('params');
			value = params['media'];
			if ( value ) {
				$.ajax({
					type: 'POST',
					url: window.ajaxurl,
					data: {
						action: 'uncode_get_media_alt',
						content: value
					},
					dataType: 'html',
					context: this
				}).done(function(html) {
					this.$el.find('img').attr('alt', html);
					window.vc.events.trigger("app.render");
				});
			}
		}
	});
	if (window.VcRowView && $('body.compose-mode').length) {
		window.UncodeRowView = window.VcRowView.extend({
			ready: function(e) {
				window.UncodeRowView.__super__.ready.call(this, e);
				if (this.$content.closest('.wpb_uncode_slider').length) {
					var row_inner = this.$content.closest('.wpb_vc_row_inner.wpb_sortable');
					row_inner.prepend("<h3>Slide</h3>");
				}

				return this;
			},
		});
	}
	if (window.VcColumnView && !$('body.compose-mode').length) {
		window.UncodeColumnView = window.VcColumnView.extend({
			buildDesignHelpers: function() {
				var color = this.model.getParam('back_color'),
					image = this.model.getParam('back_image'),
					$column_add = this.$el.find('> .bottom-controls .column_add'),
					$column_edit = this.$el.find('> .vc_controls .column_edit'),
					$column_delete = this.$el.find('> .vc_controls .column_delete'),
					$image, $color = '';
				var color_type = this.model.getParam('back_color_type');
				if (color_type === 'uncode-solid') {
					var color_solid = this.model.getParam('back_color_solid');
					if (color_solid) {
						color = color_solid;
					}
				} else if (color_type === 'uncode-gradient') {
					var color_gradient = this.model.getParam('back_color_gradient');
					if (color_gradient) {
						color = JSON.parse(color_gradient);
					}
				} else {
					color_type = 'uncode-palette';
				}
				$column_edit.insertAfter($column_add);
				$column_delete.insertAfter($column_edit);
				this.$el.find('> .bottom-controls .vc_column_color').remove();
				this.$el.find('> .bottom-controls .vc_column_image').remove();
				if (color) {
					$color = $('<span class="vc_control vc_column_color"></span>');
					if (color_type === 'uncode-palette') {
						$color.addClass('style-' + color + '-bg');
					} else if (color_type === 'uncode-solid') {
						$color.css('background', color);
					} else if (color_type === 'uncode-gradient') {
						$color.css('background', color);
						$color.attr('style', color.css);
					}
					$color.insertAfter($column_delete);
				}
				if (image) {
					$.ajax({
						type: 'POST',
						url: window.ajaxurl,
						data: {
							action: 'uncode_get_media_post',
							content: image
						},
						dataType: 'JSON'
					}).done(function(data) {
						if ($color == '') {
							$color = $('<span class="vc_control vc_column_color"></span>');
							$color.insertAfter($column_delete);
						}
						if (data.back_url != '') $color.addClass('image_viewer').html($('<span class="vc_column_image" style="' + data.back_url + '"></span>'));
						if (data.back_icon != '' && data.back_mime != undefined) $color.html($('<span class="vc_column_image" title="' + (data.back_mime).replace("oembed/", "") + '">' + data.back_icon + '</span>'));
					});
				}
			},
		});
	}
	if (vc.shortcode_view && !$('body.compose-mode').length) {
		window.UncodeTextView = vc.shortcode_view.extend({
			changedContent: function(model) {
				var params = model.get('params');
				value = params['content'];
				$.ajax({
					type: 'POST',
					url: window.ajaxurl,
					data: {
						action: 'uncode_get_html',
						content: value
					},
					dataType: 'html',
					context: this
				}).done(function(html) {
					this.$el.find('.textarea_html').html(html);
				});
				window.UncodeTextView.__super__.changedContent.call(this, model);
			}
		});
	}
	if (window.VcAccordionView && !$('body.compose-mode').length) {
		window.UncodeAccordionView = window.VcAccordionView.extend({
			render: function() {
				window.UncodeAccordionView.__super__.render.call(this);
				this.$content.sortable({
					axis: "y",
					handle: "h3",
					stop: function(event, ui) {
						// IE doesn't register the blur when sorting
						// so trigger focusout handlers to remove .ui-state-focus
						ui.item.prev().triggerHandler("focusout");
						$(this).find('> .wpb_sortable').each(function() {
							var shortcode = $(this).data('model');
							shortcode.save({
								'order': $(this).index()
							}); // Optimize
						});
					}
				});
				return this;
			},
			addTab: function(e) {
				this.adding_new_tab = true;
				e.preventDefault();
				var row = vc.shortcodes.create({
					shortcode: 'vc_row_inner',
					parent_id: this.model.id
				});
				vc.shortcodes.create({
					shortcode: 'vc_column_inner',
					params: {
						width: '1/1'
					},
					parent_id: row.id
				});
			},
		});
	}
	if (vc.shortcode_view && !$('body.compose-mode').length) {
		window.UncodeBlockView = vc.shortcode_view.extend({
			changeShortcodeParams: function ( model ) {
				window.UncodeBlockView.__super__.changeShortcodeParams.call( this, model );
				var wrap = this.$el.closest('.wpb_element_wrapper'),
					container = this.$el.find('.wpb_element_wrapper'),
					element = this.$el.closest('.wpb_content_element'),
					row = this.$el.closest('.wpb_vc_row');
				if (this.model.getParam('inside_column') != 'yes') {
					wrap.css('padding','0');
					element.css('box-shadow','none');
					container.css({
						'backgroundColor':'#fafafa',
						'min-height':'46px',
						'border-width':'1px 0 0',
						'margin':'0px'
					});
					row.find('.vc_row_layouts').hide();
					row.find('.vc_column-edit').hide();
					row.find('.vc_control-column').hide();
					row.find('.vc_row_color').hide();
					row.addClass('no-container-settings');
				} else {
					wrap.removeAttr('style');
					element.removeAttr('style');
					container.removeAttr('style');
					row.find('.vc_row_layouts').show();
					row.find('.vc_column-edit').show();
					row.find('.vc_control-column').show();
					row.find('.vc_row_color').show();
					row.removeClass('no-container-settings');
				}
			}
		});
	}
	if (vc.shortcode_view && !$('body.compose-mode').length) {
		window.UncodePanelsView = vc.shortcode_view.extend({
	        adding_new_tab: !1,
	        events: {
	            "click .add_tab": "addTab",
	            "click > .vc_controls .column_delete, > .vc_controls .vc_control-btn-delete": "deleteShortcode",
	            "click > .vc_controls .column_edit, > .vc_controls .vc_control-btn-edit": "editElement",
	            "click > .vc_controls .column_clone,> .vc_controls .vc_control-btn-clone": "clone"
	        },
	        render: function() {
	            return window.VcAccordionView.__super__.render.call(this), vc_user_access().shortcodeAll("vc_accordion_tab") ? (this.$content.sortable({
	                axis: "y",
	                handle: "h3",
	                stop: function(event, ui) {
	                    ui.item.prev().triggerHandler("focusout"), $(this).find("> .wpb_sortable").each(function() {
	                        $(this).data("model").save({
	                            order: $(this).index()
	                        })
	                    })
	                }
	            }), this) : (this.$el.find(".tab_controls").hide(), this)
	        },
	        changeShortcodeParams: function(model) {
	            var params, collapsible;
	            window.VcAccordionView.__super__.changeShortcodeParams.call(this, model), params = model.get("params"), collapsible = !(!_.isString(params.collapsible) || "yes" !== params.collapsible), this.$content.hasClass("ui-accordion") && this.$content.accordion("option", "collapsible", collapsible)
	        },
	        changedContent: function(view) {
	            this.$content.hasClass("ui-accordion") && this.$content.accordion("destroy");
	            var collapsible = !(!_.isString(this.model.get("params").collapsible) || "yes" !== this.model.get("params").collapsible);
	            this.$content.accordion({
	                header: "h3",
	                navigation: !1,
	                autoHeight: !0,
	                heightStyle: "content",
	                collapsible: collapsible,
	                active: !1 === this.adding_new_tab && !0 !== view.model.get("cloned") ? 0 : view.$el.index()
	            }), this.adding_new_tab = !1
	        },
	        addTab: function(e) {
	            if (e.preventDefault(), !vc_user_access().shortcodeAll("vc_accordion_tab")) return !1;
	            this.adding_new_tab = !0;
	            var tab_title = window.i18nLocale.tab,
	                tabs_count = this.$content.find("[data-element_type=vc_accordion_tab]").length,
	                tab_id = Date.now() + "-" + tabs_count + "-" + Math.floor(11 * Math.random());
	            return vc.shortcodes.create({
	                shortcode: "vc_accordion_tab",
	                params: {
	                    title: window.i18nLocale.section,
	                    tab_id: tab_id
	                },
	                parent_id: this.model.id
	            })
	        },
	        _loadDefaults: function() {
	            window.VcAccordionView.__super__._loadDefaults.call(this)
	        }
	    });
	}
});