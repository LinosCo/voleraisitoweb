(function($) {
	"use strict";

	var setVcFrontend,
		setSortStop;
	if ( typeof UNCODE === 'undefined' ) {
		var UNCODE = window.UNCODE || {};
		window.UNCODE = UNCODE;
	}
	clearRequestTimeout(setVcFrontend);
	UNCODE.initVCfront = function() {
		var wfl_check = false, wfl_request, waypoint_request;

		UNCODE.preventDoubleTransition();
		UNCODE.betterResize();
		UNCODE.utils();
		UNCODE.magnetic();
		UNCODE.share();
		UNCODE.tooltip();
		UNCODE.counters();
		UNCODE.countdowns();
		UNCODE.tabs();
		UNCODE.collapse();
		UNCODE.bigText();
		UNCODE.menuSystem();
		UNCODE.bgChanger();
		UNCODE.magicCursor();
		UNCODE.magneticCursor();
		UNCODE.dropImage();
		UNCODE.postTable();
		UNCODE.rotatingTxt();
		UNCODE.okvideo();
		UNCODE.backgroundSelfVideos();
		UNCODE.tapHover();
		UNCODE.isotopeLayout();
		UNCODE.justifiedGallery();
		if (!SiteParameters.lbox_enhanced) {
			UNCODE.lightbox();
		} else {
			UNCODE.lightgallery();
		}
		UNCODE.carousel($('body'));
		UNCODE.lettering();
		UNCODE.animations();
		UNCODE.stickyElements();
		UNCODE.twentytwenty();
		UNCODE.disableHoverScroll();
		// UNCODE.printScreen();
		UNCODE.particles();
		UNCODE.filters();
		UNCODE.ajax_filters();
		UNCODE.widgets();
		UNCODE.unmodal();
		UNCODE.onePage(UNCODE.isMobile);
		UNCODE.fullPage();
		UNCODE.verticalText();
		UNCODE.revslider();
		UNCODE.layerslider();
		UNCODE.textMarquee();
		UNCODE.stickyScroll();
		UNCODE.cssGrid();
		UNCODE.lottie();
		UNCODE.readMoreCol();
		UNCODE.inlineImgs();
		UNCODE.animatedBgGradient();
		UNCODE.areaTextReveal();
		UNCODE.thumbsReveal();
		$(window).on('load',function(){
			clearRequestTimeout(waypoint_request);
			waypoint_request = requestTimeout( function(){
				Waypoint.refreshAll();
			}, 1000);
		});
	}

	var allCids = [];

	var isInViewport = function( $el ) {
		var elementTop = $el.offset().top,
			elementBottom = elementTop + $el.outerHeight(),
			viewportTop = $(window).scrollTop(),
			viewportBottom = viewportTop + $(window).height();

		return elementBottom > viewportTop && elementTop < viewportBottom;
	};

	UNCODE.frontendEditorNavbar = function(){
		var $navBar = $('#vc_navbar', parent.document),
			$addElPanel = $('#vc_ui-panel-add-element', parent.document),
			$sizePreviews = $('#vc_screen-size-control', $navBar),
			$settings_css = $('.vc_post-settings', $navBar),
			$body = $('body', parent.document);

		if ( $body.hasClass('post-type-uncodeblock') ) {
			$settings_css.closest('li').addClass('disabled');
		}

		$addElPanel.add($navBar).find('a[href="javascript:;"], a[href="#"]').each(function(){
			$(this).removeAttr('href');
		});

		$('ul a', $sizePreviews).on('click', function(){
			if ( $(this).hasClass('vc-c-icon-layout_default') ) {
				$('iframe#vc_inline-frame', parent.document).removeClass('size-previews');
			} else {
				$('iframe#vc_inline-frame', parent.document).addClass('size-previews');
			}
		});
	};

	UNCODE.frontendEditorSidebarSwitch = function(){

		var $navBar = $('#vc_navbar', parent.document),
			$navBarUl = $('ul.vc_navbar-nav', $navBar),
			$updateButton = $('#vc_button-update', $navBar),
			$buttonWrap = $updateButton.closest('li').addClass('vc_button-wrap'),
			$more_opts = $('#vc_more-options', $navBarUl).closest('li.vc_pull-right').addClass('has_vc_more-options'),
			$post_stgs = $('> .vc_hide-mobile > .vc_post-settings', $navBarUl).closest('li.vc_pull-right').addClass('has_vc_post-settings-button'),
			$size_ctrl = $('#vc_screen-size-control', $navBarUl).closest('li.vc_pull-right').addClass('has_vc_screen-size-control'),
			$back_btn = $('.vc_back-button', $navBarUl).closest('li.vc_pull-right').addClass('has_vc_back-button'),
			$draft_publish = $('#vc_button-save-draft', $navBarUl).closest('li.vc_pull-right').addClass('has_vc_button-save-draft'),
			$seo_options = $('> .vc_hide-mobile > .vc_seo-button', $navBarUl).closest('li.vc_pull-right').addClass('vc_seo-li'),
			$buttonRight = $('> li.vc_pull-right:not(.vc_show-mobile)', $navBarUl),
			$undoLi = $('> .vc_hide-mobile > .vc_undo-button', $navBarUl).closest('li').addClass('vc_undo-li'),
			$redoLi = $('> .vc_hide-mobile > .vc_redo-button', $navBarUl).closest('li').addClass('vc_redo-li'),
			button_length = $('> button', $buttonWrap).length;

		if ( !$('#vc_clipboard_toolbar_paste', $navBar).length ) {
			$('.vc_undo-li', $navBar).addClass('margin-auto');
		}

		$navBar.addClass( 'button-lenght-' + button_length );
		$buttonWrap.addClass( 'button-lenght-' + button_length );

		$('#vc_add-new-element', $navBarUl).closest('li').addClass('do_not_show_if_sided');
		$('#vc_templates-editor-button', $navBarUl).closest('li').addClass('do_not_show_if_sided');

		var _frontendEditorSidebarSwitch = function( switched ){
			return;

			if ( switched === true ) {
				$('#vc_navbar-sidebar-switch', $navBar).find('.fa-minimize').removeClass('fa-minimize').addClass('fa-maximize');
				$buttonWrap.after('<li class="hidden" id="vc_frontend-sidebar-switch-placeholder-li" />');
				var $placeholder = $('#vc_frontend-sidebar-switch-placeholder-li', $navBarUl).after($buttonWrap);
				$navBarUl.append($buttonWrap);
				$buttonRight = $('> li.vc_pull-right:not(.vc_show-mobile), > li.vc_redo-li, > li.vc_undo-li', $navBarUl);
				$buttonRight.each(function(){
					if ( $(this).is( $undoLi ) || $(this).is( $redoLi ) ) {
						$navBarUl.prepend($(this));
					} else {
						$placeholder.after($(this));
					}
				});
			} else {
				$('#vc_navbar-sidebar-switch', $navBar).find('.fa-maximize').removeClass('fa-maximize').addClass('fa-minimize');
				var $placeholder = $('#vc_frontend-sidebar-switch-placeholder-li', $navBarUl).after($buttonWrap);
				$buttonRight = $('> li.vc_pull-right:not(.vc_show-mobile)', $navBarUl);
				$buttonRight.each(function(){
					$buttonWrap.after($(this));
				});
				$placeholder.remove();
			}

			window.parent.jQuery( window.parent.document ).trigger( 'vc_frontend-sidebar-switch', switched );
			setTimeout(function(){
				window.parent.vc.edit_element_block_view.setSize();
			}, 100);
			Waypoint.refreshAll();

		};

		var _vcFocusAfterAddElementWindow = function(){

			if ( window.localStorage['vc_frontend-sidebar-switch'] === 'on' ) {

				var _add_view = window.parent.vc.add_element_block_view,
					$add_view_cid = _add_view.cid,
					_edit_view = window.parent.vc.edit_element_block_view;

				_add_view.on('render', function(){
					var $el = _add_view.$el;
					if ( typeof window.parent.vc.row_layout_editor !== 'undefined' && window.parent.vc.row_layout_editor.$el.hasClass('vc_active') ) {
						window.parent.vc.row_layout_editor.hide();
					} else if ( typeof window.parent.vc.post_settings_view !== 'undefined' && window.parent.vc.post_settings_view.$el.hasClass('vc_active') ) {
						window.parent.vc.post_settings_view.hide();
					} else {
						$('ul.wpb-content-layouts > li:visible', $el).removeClass('vc_add_element_anim');
						$.each($('ul.wpb-content-layouts > li:visible', $el), function(index, val) {
							setTimeout(function(){
								$(val).addClass('vc_add_element_anim');
							}, ( ( 15 * (index+1) ) - 15 ) );
						});
					}
				});

				_edit_view.on('render', function(){
					if ( $add_view_cid !== _add_view.cid ) {
						$add_view_cid = _add_view.cid;
					}
					if ( typeof window.parent.vc.row_layout_editor !== 'undefined' && window.parent.vc.row_layout_editor.$el.hasClass('vc_active') ) {
						window.parent.vc.row_layout_editor.hide();
					}
				});

			}

		};

		if ( window.localStorage['vc_frontend-sidebar-switch'] === 'on' && UNCODE.wwidth > 960 ) {
			$('body', parent.document).addClass('vc-sidebar-switch');
			$('body').addClass('vc-sidebar-switch-inside');
			_frontendEditorSidebarSwitch( true );
			window.parent.vc.add_element_block_view.render(!1);
			window.parent.jQuery( window.parent.document ).trigger( 'vc_frontend-sidebar-switch', true );
		} else if ( UNCODE.wwidth <= 960 && $('body', parent.document).hasClass('vc-sidebar-switch') ) {
			_frontendEditorSidebarSwitch( false );
		}

		_vcFocusAfterAddElementWindow();
		var $sidebarswitch = $( '#vc_navbar-sidebar-switch', parent.document );

		$sidebarswitch.on( 'click', function(e){

			e.preventDefault();

			$('body', parent.document).toggleClass('vc-sidebar-switch');
			$('body').toggleClass('vc-sidebar-switch-inside');

			if ( window.localStorage['vc_frontend-sidebar-switch'] === 'on' ) {
				window.localStorage.removeItem('vc_frontend-sidebar-switch');

				if ( $('#vc_ui-panel-add-element', parent.document ).hasClass( 'vc_active' ) ) {
					window.parent.vc.add_element_block_view.hide();
				}
			} else {
				window.localStorage['vc_frontend-sidebar-switch'] = 'on';
				_vcFocusAfterAddElementWindow();
				if ( ! $('#vc_ui-panel-edit-element', parent.document ).hasClass( 'vc_active' ) ) {
					window.parent.vc.add_element_block_view.render(!1);
				}
			}
			_frontendEditorSidebarSwitch( window.localStorage['vc_frontend-sidebar-switch'] === 'on' );
			window.parent.dispatchEvent(new CustomEvent('resize'));

		});

		window.parent.vc.events.on('shortcodeView:destroy', function(model) {
			if ( window.localStorage['vc_frontend-sidebar-switch'] === 'on' ) {
				window.parent.vc.add_element_block_view.render(!1);
			}
		});

		$( '.vc_ui-close-button', parent.document ).on( 'click', function(){
			if ( $( 'body', parent.document ).hasClass( 'vc-sidebar-switch' ) ) {
				window.parent.vc.add_element_block_view.render(!1);
			}
		});

		$( '.vc_control-btn-layout', parent.document ).on( 'click', function(){
			if ( $( 'body', parent.document ).hasClass( 'vc-sidebar-switch' ) ) {
				window.parent.vc.add_element_block_view.hide();
			}
		});

	};

	UNCODE.frontendEditorSafeMode = function(){
		var $navBar = $('#vc_navbar', parent.document);

		if ( window.localStorage['vc_frontend-safe-mode'] === 'on' ) {
			$('body').addClass('vc-safe-mode');
			$('#vc_navbar-safe-mode', $navBar).find('.fa-marquee-plus').removeClass('fa-marquee-plus').addClass('fa-marquee-minus');
			$(window).trigger('vc-safe-mode-on');
		}

		var $safemode = $( '#vc_navbar-safe-mode', parent.document );
		$safemode.on( 'click', function(e){
			e.preventDefault();
			$('body').toggleClass('vc-safe-mode');
			if ( window.localStorage['vc_frontend-safe-mode'] === 'on' ) {
				$('#vc_navbar-safe-mode', $navBar).find('.fa-marquee-minus').removeClass('fa-marquee-minus').addClass('fa-marquee-plus');
				window.localStorage.removeItem('vc_frontend-safe-mode');
				$(window).trigger('vc-safe-mode-off');
			} else {
				$('#vc_navbar-safe-mode', $navBar).find('.fa-marquee-plus').removeClass('fa-marquee-plus').addClass('fa-marquee-minus');
				window.localStorage['vc_frontend-safe-mode'] = 'on';
				$(window).trigger('vc-safe-mode-on');
			}
			Waypoint.refreshAll();
		});
	};

	UNCODE.vcFrontendMoveControls = function(model){
		if ( typeof model.view !== 'undefined' ) {
			var $el = model.view.$el,
				shortcode = model.attributes.shortcode,
				$controls = model.view.$controls;
		} else {
			var $el = model.closest('.boomapps_vccolumn'),
				shortcode = 'vc_column',
				$controls = model;
		}

		if ( typeof $el !== 'undefined' && ( shortcode === 'vc_column' || shortcode === 'vc_column_inner' || shortcode === 'vc_section' ) ) {
			var $controls = $controls.addClass('moved_controls'),
				uncol_class = $('.uncol', $el).attr('class');
			$el.prepend( $controls );

			if ( typeof uncol_class !== 'undefined' && uncol_class.match(/shift_x(.*?)[^\s]+/g) ) {
				var class_shift_x = uncol_class.match(/shift_x(.*?)[^\s]+/g);
				$('.vc_controls-out-tl', $controls).addClass( class_shift_x[0] );
			}

			if ( typeof uncol_class !== 'undefined' && uncol_class.match(/shift_y(.*?)[^\s]+/g) ) {
				var class_shift_y = uncol_class.match(/shift_y(.*?)[^\s]+/g);
				$('.vc_controls-out-tl', $controls).addClass( class_shift_y[0] );
			}
		}
	};

	if ( typeof window.parent.vc !== 'undefined' ) {

		window.parent.vc.events.on("app.render", function() {

			$('html, body', parent.document).css({
				'overflow':'hidden'
			});

			UNCODE.frontendEditorNavbar();
			UNCODE.frontendEditorSidebarSwitch();
			UNCODE.frontendEditorSafeMode();

			$('.added-owl-item').removeClass('added-owl-item');
			$('.vc_welcome-header').add('.vc_welcome-brand').add('#vc_no-content-add-text-block').remove();
			$('#vc_no-content-helper .vc_ui-help-block a').attr('href','https://support.undsgn.com/hc/en-us');
			if (SiteParameters.wireframes_plugin_active) {
				appendWireframesButton();
			}

			UNCODE.initVCfront();

			window.parent.vc.removePreLoader();
			window.parent.vc.removeOverlaySpinner();

			var setCTA;

			window.parent.vc.events.on('vc_column:render', function($col) {
				clearRequestTimeout(setCTA);
				setCTA = requestTimeout(function(){
					window.dispatchEvent(new CustomEvent('resize'));
				},10);
			});

		});

		document.addEventListener('keydown', function(e) {
			window.parent.listenKeyboardEvents(e, window.parent, false);
		});

		$(window).on("all_shortcodes:ready", function() {

			$(document).on('mouseout', '.vc_el_just_added', function(){
				$(this).removeClass('vc_el_just_added');
			});

			window.parent.vc.events.on('shortcodeView:ready', function(model) {
				requestTimeout(function(){
					var $el = model.view.$el,
						shortcode = model.attributes.shortcode;

					if ( shortcode === 'vc_custom_heading' && typeof $el !== 'undefined' ) {
						var $parent_row = $el.closest('.row');
						if ( typeof $parent_row[0] !== 'undefined' ) {
							requestTimeout(function(){
								UNCODE.initRow($parent_row[0]);
							}, 250);
						}
					}

					setTimeout(function(){
						$el.closest('.vc_row[data-parent]').removeClass('vc_el_just_added');
					}, 5000);

					// if ( shortcode === 'vc_row' && typeof $el !== 'undefined' && ! isInViewport( $el ) ) {
					// 	var el_offset = $el.offset();
					// 	el_offset.top -= 20;

					// 	$('html, body').animate({
					// 		scrollTop: el_offset.top,
					// 	}, 150);
					// }

					if (!SiteParameters.lbox_enhanced) {
						UNCODE.lightbox();
					} else {
						UNCODE.lightgallery();
					}

				}, 100);

				var $el = model.view.$el,
					cid = model.cid,
					shortcode = model.attributes.shortcode,
					$closest_carousel = $el.closest('.owl-carousel').attr('data-front-edited','true'),
					$inner_carousel = $('.owl-carousel', $el);
				
				if ( $closest_carousel.length || $inner_carousel.length ) {
					$( window ).trigger( 'frontend:carousel_updated' );
				}
			});

		});

		$(document).on('mouseover', '.vc_row[data-parent], [data-tag="vc_section"]', function(){
			var $row = $(this),
				$controls = $row.find('[data-tag="vc_column"] >.vc_controls-column.vc_controls:not(.moved_controls)', '[data-tag="vc_column_inner"] >.vc_controls-column.vc_controls:not(.moved_controls), >.vc_controls-container.vc_controls:not(.moved_controls)');

			if ( $controls.length ) {
				$controls.each(function(){
					var $control = $(this);
					UNCODE.vcFrontendMoveControls($control);
				})
			}
		});

		var item_to_add = false;
		window.parent.vc.events.on('added-owl-item', function(model) {
			item_to_add = true;
			window.parent.vc.events.on('changeLayout', function(model) {
				if ( item_to_add === true ) {
					var $slider = model.view.$el.closest('.uncode-slider'),
						carousel_id = $('.owl-carousel', $slider).attr('id'),
						$new_slide = $('.added-owl-item', $slider).removeClass('added-owl-item').closest('.vc_element.vc_row').last();

					if ( $new_slide.length ) {
						var randID = Math.round(new Date().getTime() + (Math.random() * 100));
						$( document.body ).trigger( 'added-owl-item', [ carousel_id, $new_slide, randID ] );
					}

					UNCODE.vcFrontendMoveControls( model );
					item_to_add = false;
				}
			});

		});

		window.parent.vc.events.on("undoredo:lock", function() {
			window.parent.vc.createPreLoader();
			window.parent.vc.createOverlaySpinner();
		});

		window.parent.vc.events.on("undoredo:unlock", function() {
			window.dispatchEvent(new CustomEvent('resize'));
			window.parent.vc.removePreLoader();
			window.parent.vc.removeOverlaySpinner();
		});

		// window.parent.vc.events.on("undoredo:undo undoredo:redo", function() {
		// 	console.log('undoredo');
		// });

		window.parent.vc.events.on( "vc.update-slider", function(model) {
			var $slider_cont = model.view.$el.find('.uncode-slider'),
				$slider = $slider_cont.find(' > .owl-carousel'),
				$slider_dots = $slider_cont.find('.owl-dots'),
				slider_dots_class = $slider_dots.attr('class'),
				carousel_id = $slider.attr('id'),
				params = model.changed.params,
				old_params = model._previousAttributes.params;

			var $carousel = $('#' + carousel_id).data('owl.carousel');
			$carousel.destroy();

			for (var p in params) {
				if( params.hasOwnProperty(p) && ( ! old_params.hasOwnProperty(p) || ( params[p] !== old_params[p] ) ) ) {
					switch( p ) {
						case 'slider_type':
							if ( params[p] !== '' ) {
								$slider.attr( 'data-fade', params[p].toString() );
								$carousel.settings.animateIn = 'fadeIn';
								$carousel.settings.animateOut = 'fadeOut';
							} else {
								$slider.removeAttr( 'data-fade' );
								$carousel.settings.animateIn = null;
								$carousel.settings.animateOut = null;
							}

							break;
						case 'slider_hide_dots':
							$slider.attr( 'data-dotsmobile', params[p].toString() ).attr( 'data-dots', params[p].toString() );

							$carousel.settings.dotsmobile = !params[p];
							$carousel.settings.dots = !params[p];
							break;
						case 'advanced_nav':
							$slider.attr( 'data-dotsmobile', params[p].toString() ).attr( 'data-dots', params[p].toString() );
							$carousel.settings.dotsmobile = !params[p];
							$carousel.settings.dots = !params[p];

							$slider.attr( 'data-nav', params[p].toString() );
							$carousel.settings.nav = !params[p];
							break;
						case 'slider_dot_position':
							var old_param = old_params[p] === '' ? 'center' : old_params[p],
								param = params[p] === '' ? 'center' : params[p];
							$slider_cont.removeClass('owl-dots-align-' + old_param).addClass('owl-dots-align-' + param);
							break;
						case 'slider_hide_arrows':
							$slider.attr( 'data-nav', params[p].toString() );

							$carousel.settings.nav = !params[p];
							break;
						case 'slider_dots_space':
							if ( params[p] !== '' ) {
								$slider_cont.addClass('owl-dots-db-space');
							} else {
								$slider_cont.removeClass('owl-dots-db-space');
							}
							break;
						case 'slider_dot_width':
							if ( params[p] !== '' ) {
								if ( slider_dots_class.indexOf('limit-width') == -1 ) {
									slider_dots_class += ' limit-width';
								}
							} else {
								if ( slider_dots_class.indexOf('limit-width') != -1 ) {
									slider_dots_class = slider_dots_class.replace(" limit-width", "");
									slider_dots_class = slider_dots_class.replace("limit-width ", "");
									slider_dots_class = slider_dots_class.replace("limit-width", "");
								}
							}
							break;
						case 'h_padding':
							if ( params[p] != old_params[p] ) {
								switch (old_params[p]) {
									case '0':
										slider_dots_class = slider_dots_class.replace(" no-h-padding", "");
										slider_dots_class = slider_dots_class.replace("no-h-padding", "");
										break;
									case '1':
										slider_dots_class = slider_dots_class.replace(" one-h-padding", "");
										slider_dots_class = slider_dots_class.replace("one-h-padding", "");
										break;
									case '3':
										slider_dots_class = slider_dots_class.replace(" double-h-padding", "");
										slider_dots_class = slider_dots_class.replace("double-h-padding", "");
										break;
									case '4':
										slider_dots_class = slider_dots_class.replace(" triple-h-padding", "");
										slider_dots_class = slider_dots_class.replace("triple-h-padding", "");
										break;
									case '5':
										slider_dots_class = slider_dots_class.replace(" quad-h-padding", "");
										slider_dots_class = slider_dots_class.replace("quad-h-padding", "");
										break;
									case '6':
										slider_dots_class = slider_dots_class.replace(" penta-h-padding", "");
										slider_dots_class = slider_dots_class.replace("penta-h-padding", "");
										break;
									case '7':
										slider_dots_class = slider_dots_class.replace(" exa-h-padding", "");
										slider_dots_class = slider_dots_class.replace("exa-h-padding", "");
										break;
									case '2':
									default:
										slider_dots_class = slider_dots_class.replace(" single-h-padding", "");
										slider_dots_class = slider_dots_class.replace("single-h-padding", "");
										break;
								}
								switch (params[p]) {
									case '0':
										slider_dots_class += " no-h-padding";
										break;
									case '1':
										slider_dots_class += " one-h-padding";
										break;
									case '3':
										slider_dots_class += " double-h-padding";
										break;
									case '4':
										slider_dots_class += " triple-h-padding";
										break;
									case '5':
										slider_dots_class += " quad-h-padding";
										break;
									case '6':
										slider_dots_class += " penta-h-padding";
										break;
									case '7':
										slider_dots_class += " exa-h-padding";
										break;
									case '2':
									default:
										slider_dots_class += " single-h-padding";
										break;
								}
							}
							break;
					}
				}
			}
			$('#' + carousel_id).owlCarousel($carousel.settings);
			$('#' + carousel_id).find('.owl-dots').attr('class', slider_dots_class);
		});

		var setShortcodeReady_cta;

		window.parent.vc.events.on('shortcodeView:ready', function(model) {

			uncode_progress_bar();

			var $el = model.view.$el,
				cid = model.cid,
				shortcode = model.attributes.shortcode;

			if ( shortcode === 'uncode_carousel_nav' ) {
				var modelID = $el.attr('data-model-id');
				$el.find('.uncode-owl-nav-out').attr('data-target-model', modelID);
			}

			if ( allCids.indexOf( cid ) == -1 ) {
				allCids.push( cid );
				if ( $('body').data('all-shortcode-ready') === 'true' ) {
					$el.closest('.vc_row[data-parent]').addClass('vc_el_just_added');
				}
			}

			if ( shortcode === 'vc_icon' ) {
				var icon_id = $el.find('.icon-media').attr('id'),
					$data_icon = $el.find('[data-id="' + icon_id + '"]'),
					icon_time = $data_icon.attr('data-time'),
					icon_delay = $data_icon.attr('data-delay'),
					icon_thumb = $data_icon.attr('data-thumb');

				if ( $el.find('#' + icon_id).length && typeof icon_time !== 'undefined' && typeof icon_delay !== 'undefined' && typeof icon_thumb !== 'undefined' ) {
					UNCODE.vivus( icon_id, icon_time, icon_delay, icon_thumb );
				}
			}

			requestTimeout(function(){
				if ( $('.woocommerce-product-gallery__image-first__img', $el).length ) {
					$('.woocommerce-product-gallery__image-first__img', $el).css({
						'min-width':'100px'
					});
				}
			}, 250);

			if ( shortcode !== 'uncode_slider' ) {
				UNCODE.carousel( $el );
			}

			if ( shortcode === 'vc_row' && typeof $el !== 'undefined' ) {
				UNCODE.initRow($el[0]);
			}

			if ( ( shortcode === 'vc_row' || shortcode === 'vc_row_inner' ) ) {
				if ( model.attributes.cloned ) {
					window.dispatchEvent(new CustomEvent('resize'));
				}
			}

			if ( ( shortcode === 'vc_accordion_tab' ||  shortcode === 'vc_tab' ) && model.attributes.cloned ) {
				model.attributes.params.tab_id = model.attributes.cloned_from.params.tab_id + Math.floor(Math.random() * 10);
			} /*else if ( ( shortcode === 'vc_gallery' ||  shortcode === 'uncode_index' ) && model.attributes.cloned ) {
				model.attributes.params.el_id = model.attributes.cloned_from.params.el_id + Math.floor(Math.random() * 10);;
			}*/

			var setCTA;

			model.on("change:parent_id", function(){
				clearRequestTimeout(setCTA);
				setCTA = requestTimeout(function(){
					window.dispatchEvent(new CustomEvent('resize'));
				},10);
			});

			if ( shortcode === 'uncode_index' || shortcode === 'vc_gallery' ) {
				if ($el.hasClass('cssgrid-system')) {
					var sequential = $el.hasClass('cssgrid-animate-sequential') ? true : false;
					UNCODE.animate_css_grids($el, $el.find('.tmb-grid'), 0, sequential, false);
					UNCODE.cssGrid();
				}

				requestTimeout(function(){
					UNCODE.isotopeLayout();
					UNCODE.justifiedGallery();
				}, 250);

			}

			if ( shortcode.indexOf('uncode_single_product_') !== -1 ) {
				$el.closest('.uncoltable').addClass('product');
			}

			if ( ( shortcode === 'uncode_twentytwenty' ) ) {
				var $uncode_twentytwenty_before_img = $el.find('.twentytwenty-container > img')[0];
				if ( typeof $uncode_twentytwenty_before_img !== 'undefined' ) {
					$uncode_twentytwenty_before_img.addEventListener( 'load', UNCODE.twentytwenty, false );
				}
			}

			if ( shortcode.includes('uncode_single_product_') ) {
				$('.hentry > div').addClass('product');
			}

			if ( shortcode === 'vc_button' ) {
				$( document ).trigger( 'vc-frontend:vc_button' );
			}

			UNCODE.utils();
			UNCODE.bigText();

			UNCODE.vcFrontendMoveControls( model );

			clearRequestTimeout(setShortcodeReady_cta);
			setShortcodeReady_cta = requestTimeout(function(){
				$(window).trigger('all_shortcodes:ready');
				$('body').data('all-shortcode-ready', 'true');
			}, 2500);

			if ( shortcode === 'uncode_single_product_reviews' ) {
				$( document ).trigger( 'vc-uncode_single_product_reviews', $el );
			}

			$(window).trigger('uncode-custom-cursor');

			if ( shortcode === 'uncode_module_placeholder' && typeof $el !== 'undefined' ) {
				var $parent_row = $el.closest('.vc_row[data-parent]');
				$parent_row.addClass('custom-grid-container');
			}

			if ( shortcode === 'vc_row' || shortcode === 'vc_row_inner' || shortcode === 'vc_column' || shortcode === 'vc_column_inner' || shortcode === 'uncode_index' || shortcode === 'vc_gallery' ) {
				requestTimeout(function(){
					UNCODE.stickyScroll($el);
				}, 250);
			}

			if ( shortcode === 'uncode_lottie' || $el.html().indexOf( ' vc_uncode_lottie' ) > -1 ) {
				$(window).trigger('unlottie-destroy');
				UNCODE.lottie();
			}

		});

		window.parent.vc.events.on('shortcodeView:destroy', function(model) {
			var $el = model.view.$el,
				shortcode = model.attributes.shortcode;

			if ( shortcode === 'uncode_carousel_nav' ) {
				var wrapID = $el.attr('data-wrap-id'),
					$navChildren = $('[data-parent-wrap="' + wrapID + '"');

				$navChildren.remove();
			}
			var cid_index = allCids.indexOf( model.cid );
			if ( cid_index > -1 ) {
				allCids.splice(cid_index, 1);
			}
			window.dispatchEvent(new CustomEvent('resize'));
		});

		window.parent.vc.events.on('shortcodeView:beforeUpdate', function(model) {
			var $el = model.view.$el,
				shortcode = model.attributes.shortcode;
			$el.addClass('updating');

			$('.owl-carousel').each(function(){
				var parent = $(this).closest('.owl-carousel-wrapper');
				if ( parent.hasClass('updating') ) {
					$(this).hide().owlCarousel( 'destroy' );
				}
			});

			if ( shortcode === 'vc_accordion' ) {
				var $accordion = $('.uncode-accordion', $el),
					palette_classes = $accordion.attr('data-classes');
				window.localStorage.setItem('vc_accordion_classes', palette_classes);
			}
		});

		$(window).on('stopSorting', function(e, ui) {
			var model = parent.vc.shortcodes.get(ui.item.data("modelId")),
				shortcode = model.attributes.shortcode,
				parent_view = model.view.parent_view.model;
		});

		window.parent.vc.events.on('shortcodeView:updated', function(model) {
						
			var $el = model.view.$el,
				row = $el.parents('.row-parent').eq(0)[0],
				shortcode = model.attributes.shortcode,
				$closest_carousel = $el.closest('.owl-carousel').attr('data-front-edited','true'),
				$inner_carousel = $('.owl-carousel', $el);

			// if ( shortcode === 'vc_icon' ) {
			// 	var icon_id = $el.find('.icon-media').attr('id'),
			// 		$data_icon = $el.find('[data-id="' + icon_id + '"]'),
			// 		icon_time = $data_icon.attr('data-time'),
			// 		icon_delay = $data_icon.attr('data-delay'),
			// 		icon_thumb = $data_icon.attr('data-thumb');

			// 	if ( $el.find('#' + icon_id).length ) {
			// 		var v = UNCODE.vivus( icon_id, icon_time, icon_delay, icon_thumb );
			// 		v.destroy();
			// 	}
			// }

			if ( $closest_carousel.length || $inner_carousel.length ) {
				$( window ).trigger( 'frontend:carousel_updated' );
			}

			if ( typeof row !== 'undefined' ) {
				row.dispatchEvent(new CustomEvent('vc-shortcodeView-updated'));
			}

			if ( shortcode.indexOf('uncode_single_product_gallery') !== -1 ) {
				wc_single_product_params.zoom_enabled = ( model.changed.params.zoom !== 'yes' );
				$( '.woocommerce-product-gallery' ).each( function() {
					$( this ).trigger( 'wc-product-gallery-before-init', [ this, wc_single_product_params ] );
					$( this ).wc_product_gallery( wc_single_product_params );
					$( this ).trigger( 'wc-product-gallery-after-init', [ this, wc_single_product_params ] );
				} );
			}

			if ( ( shortcode === 'vc_row' || shortcode === 'vc_row_inner' || shortcode === 'vc_column' || shortcode === 'vc_column_inner' || shortcode === 'vc_gallery' || shortcode === 'uncode_index' ) && typeof $el !== 'undefined' ) {
				var $parent = $el.closest('.row-parent').length ? $el.closest('.row-parent') : $el;
				$parent.find('.cols-md-responsive, .cols-sm-responsive').removeClass('cols-md-responsive').removeClass('cols-sm-responsive');
				UNCODE.initRow($parent[0]);
				document.dispatchEvent(new CustomEvent('DOMContentLoaded'));
				window.dispatchEvent(new CustomEvent('resize'));
				UNCODE.okvideo();
			}

			if ( shortcode === 'vc_row' || shortcode === 'vc_row_inner' || shortcode === 'vc_column' || shortcode === 'vc_column_inner' || shortcode === 'uncode_index' || shortcode === 'vc_gallery' ) {
				UNCODE.stickyScroll($el);
				UNCODE.readMoreCol($el);
				UNCODE.animatedBgGradient($el);
			}

			if ( shortcode === 'vc_row' || shortcode === 'vc_row_inner' || shortcode === 'vc_column' || shortcode === 'vc_column_inner' ) {
				UNCODE.multibg();
			}

			if ( shortcode === 'vc_row_inner' ) {
				if ( $el.closest('.unequal-flex').length && $el.find('.row-child[data-height]').length ) {
					var dataH = $el.find('.row-child').attr('data-height');
					$el.css({ height: dataH + '%' });
				} else {
					$el[0].style.height = '';
				}
			}

			if ( shortcode === 'vc_tab' ) {
				$el.addClass('active').addClass('in');
			}

			if ( shortcode === 'vc_tabs' ) {
				if ( typeof model.changed.params !== 'undefined' && typeof model._previousAttributes.params !== 'undefined' && model._previousAttributes.params.tab_no_fade !== model.changed.params.tab_no_fade ) {
					$el.find('.tab-pane').toggleClass('fade');
					$el.find('.tab-pane.fade.active').toggleClass('in');
				}
				$(window).trigger('wwResize');
			}

			if ( shortcode === 'vc_accordion_tab' ) {
				var $collapse = $('.panel-collapse', $el);
				var $parent = model.view.parent_view.$content;
				if ( $el.hasClass('active-group') ) {
					$collapse.addClass('in');
				}
				if ( $parent.length ) {
					$el.find('.panel-title a').attr('data-parent', $parent.attr('id'));
				}
			}

			if ( shortcode === 'vc_accordion' ) {
				var $titles = $('.panel-title', $el);
				$titles.each(function(){
					var $title = $(this),
						params = model.changed.params,
						old_params = model._previousAttributes.params;

					$title.removeClass(old_params.titles_font).addClass(params.titles_font);

					$title.removeClass(old_params.titles_size).addClass(params.titles_size);

					$title.removeClass('font-weight-' + old_params.titles_weight).addClass('font-weight-' + params.titles_weight);

					$title.removeClass('text-' + old_params.titles_transform).addClass('text-' + params.titles_transform);

					$title.removeClass(old_params.titles_height).addClass(params.titles_height);

					$title.removeClass(old_params.titles_space).addClass(params.titles_space);

					var title_attrs = $title[0].attributes,
						title_html = $title[0].innerHTML;

					var title_attr = {};
					$.each(title_attrs, function(i,e) { 
						title_attr[e.nodeName] = e.nodeValue; 
					});
					var $new_title = $('<' + params.heading_semantic + '/>').html(title_html).attr(title_attr);
					$title.replaceWith($new_title);

				});

				var $panels = $('.panel', $el),
					$accordion = $('.uncode-accordion', $el),
					data_classes = $accordion.attr('data-classes'),
					a_classes = $accordion.attr('data-a-classes'),
					palette_classes = window.localStorage.getItem('vc_accordion_classes'),
					palette_classes_arr = (typeof palette_classes !== 'undefined' && palette_classes !== null) ? palette_classes.split(' ') : '';

				$panels.each(function(){
					var $panel = $(this);
	
					for (var i_c = 0; i_c < palette_classes_arr.length; i_c++) {
						$panel.removeClass(palette_classes_arr[i_c]);
					}
					$panel.addClass( data_classes ).find('a[data-toggle]').attr( 'class', a_classes );
				});
			}

			if ( shortcode === 'uncode_lottie' || $el.html().indexOf( ' vc_uncode_lottie' ) > -1 ) {
				$(window).trigger('unlottie-destroy');
				UNCODE.lottie();
			}

			if ( shortcode === 'vc_column' || shortcode === 'vc_column_inner' ) {
				UNCODE.stickyElements();
			}

			// if ( ( shortcode === 'vc_row_inner' || shortcode === 'vc_custom_heading' ) && typeof $el !== 'undefined' ) {
				window.dispatchEvent(new CustomEvent('vc-resize'));
			// }

			if ( shortcode === 'vc_single_image' || shortcode === 'vc_gallery' ) {
				UNCODE.adaptive();
			}

			if ( shortcode === 'uncode_index' || shortcode === 'vc_gallery' ) {
				if ($el.hasClass('cssgrid-system')) {
					var sequential = $el.hasClass('cssgrid-animate-sequential') ? true : false;
					UNCODE.animate_css_grids($el, $el.find('.tmb-grid'), 0, sequential, false);
					UNCODE.cssGrid();
				}
			}

			if ( shortcode === 'uncode_index' && typeof model.changed.params !== 'undefined' && model.changed.params.filtering === 'ajax' ) {
				$( window ).trigger('uncode.ajax_filters', $el);
			}

			requestTimeout(function(){
				UNCODE.isotopeLayout();
				UNCODE.justifiedGallery();
				$( document.body ).trigger('isotope-shortcodeView-updated');
			}, 250);

			if ( ( shortcode === 'uncode_twentytwenty' ) ) {
				var $uncode_twentytwenty_before_img = $el.find('.twentytwenty-container > img')[0];
				if ( typeof $uncode_twentytwenty_before_img !== 'undefined' ) {
					$uncode_twentytwenty_before_img.addEventListener( 'load', UNCODE.twentytwenty, false );
				}
			}

			if ( typeof $el !== 'undefined' && ( shortcode === 'vc_row' ) && $el.find('.row-slider').length && $el.find('.owl-carousel').length ) {
				var params = model.changed.params,
					old_params = model._previousAttributes.params;

				for (var p in params) {
					if( params.hasOwnProperty(p) && ( ! old_params.hasOwnProperty(p) || ( params[p] !== old_params[p] ) ) ) {
						switch( p ) {
							case 'override_padding':
							case 'top_padding':
							case 'bottom_padding':
							case 'h_padding':
								if ( params.override_padding === 'yes' ) {
									if (old_params.top_padding == '0') {
										$('.owl-carousel .row', $el).removeClass('no-top-padding');
									} else if (old_params.top_padding == '1') {
										$('.owl-carousel .row', $el).removeClass('one-top-padding');
									} else if (old_params.top_padding == '2') {
										$('.owl-carousel .row', $el).removeClass('single-top-padding');
									} else if (old_params.top_padding == '3') {
										$('.owl-carousel .row', $el).removeClass('double-top-padding');
									} else if (old_params.top_padding == '4') {
										$('.owl-carousel .row', $el).removeClass('triple-top-padding');
									} else if (old_params.top_padding == '5') {
										$('.owl-carousel .row', $el).removeClass('quad-top-padding');
									} else if (old_params.top_padding == '6') {
										$('.owl-carousel .row', $el).removeClass('penta-top-padding');
									} else if (old_params.top_padding == '7') {
										$('.owl-carousel .row', $el).removeClass('exa-top-padding');
									}

									if (old_params.bottom_padding == '0') {
										$('.owl-carousel .row', $el).removeClass('no-bottom-padding');
									} else if (old_params.bottom_padding == '1') {
										$('.owl-carousel .row', $el).removeClass('one-bottom-padding');
									} else if (old_params.bottom_padding == '2') {
										$('.owl-carousel .row', $el).removeClass('single-bottom-padding');
									} else if (old_params.bottom_padding == '3') {
										$('.owl-carousel .row', $el).removeClass('double-bottom-padding');
									} else if (old_params.bottom_padding == '4') {
										$('.owl-carousel .row', $el).removeClass('triple-bottom-padding');
									} else if (old_params.bottom_padding == '5') {
										$('.owl-carousel .row', $el).removeClass('quad-bottom-padding');
									} else if (old_params.bottom_padding == '6') {
										$('.owl-carousel .row', $el).removeClass('penta-bottom-padding');
									} else if (old_params.bottom_padding == '7') {
										$('.owl-carousel .row', $el).removeClass('exa-bottom-padding');
									}

									if (old_params.h_padding == '0') {
										$('.owl-carousel .row', $el).removeClass('no-h-padding');
									} else if (old_params.h_padding == '1') {
										$('.owl-carousel .row', $el).removeClass('one-h-padding');
									} else if (old_params.h_padding == '2') {
										$('.owl-carousel .row', $el).removeClass('single-h-padding');
									} else if (old_params.h_padding == '3') {
										$('.owl-carousel .row', $el).removeClass('double-h-padding');
									} else if (old_params.h_padding == '4') {
										$('.owl-carousel .row', $el).removeClass('triple-h-padding');
									} else if (old_params.h_padding == '5') {
										$('.owl-carousel .row', $el).removeClass('quad-h-padding');
									} else if (old_params.h_padding == '6') {
										$('.owl-carousel .row', $el).removeClass('penta-h-padding');
									} else if (old_params.h_padding == '7') {
										$('.owl-carousel .row', $el).removeClass('exa-h-padding');
									}

									if (params.top_padding == '0') {
										$('.owl-carousel .row', $el).addClass('no-top-padding');
									} else if (params.top_padding == '1') {
										$('.owl-carousel .row', $el).addClass('one-top-padding');
									} else if (params.top_padding == '2') {
										$('.owl-carousel .row', $el).addClass('single-top-padding');
									} else if (params.top_padding == '3') {
										$('.owl-carousel .row', $el).addClass('double-top-padding');
									} else if (params.top_padding == '4') {
										$('.owl-carousel .row', $el).addClass('triple-top-padding');
									} else if (params.top_padding == '5') {
										$('.owl-carousel .row', $el).addClass('quad-top-padding');
									} else if (params.top_padding == '6') {
										$('.owl-carousel .row', $el).addClass('penta-top-padding');
									} else if (params.top_padding == '7') {
										$('.owl-carousel .row', $el).addClass('exa-top-padding');
									}

									if (params.bottom_padding == '0') {
										$('.owl-carousel .row', $el).addClass('no-bottom-padding');
									} else if (params.bottom_padding == '1') {
										$('.owl-carousel .row', $el).addClass('one-bottom-padding');
									} else if (params.bottom_padding == '2') {
										$('.owl-carousel .row', $el).addClass('single-bottom-padding');
									} else if (params.bottom_padding == '3') {
										$('.owl-carousel .row', $el).addClass('double-bottom-padding');
									} else if (params.bottom_padding == '4') {
										$('.owl-carousel .row', $el).addClass('triple-bottom-padding');
									} else if (params.bottom_padding == '5') {
										$('.owl-carousel .row', $el).addClass('quad-bottom-padding');
									} else if (params.bottom_padding == '6') {
										$('.owl-carousel .row', $el).addClass('penta-bottom-padding');
									} else if (params.bottom_padding == '7') {
										$('.owl-carousel .row', $el).addClass('exa-bottom-padding');
									}

									if (params.h_padding == '0') {
										$('.owl-carousel .row', $el).addClass('no-h-padding');
									} else if (params.h_padding == '1') {
										$('.owl-carousel .row', $el).addClass('one-h-padding');
									} else if (params.h_padding == '2') {
										$('.owl-carousel .row', $el).addClass('single-h-padding');
									} else if (params.h_padding == '3') {
										$('.owl-carousel .row', $el).addClass('double-h-padding');
									} else if (params.h_padding == '4') {
										$('.owl-carousel .row', $el).addClass('triple-h-padding');
									} else if (params.h_padding == '5') {
										$('.owl-carousel .row', $el).addClass('quad-h-padding');
									} else if (params.h_padding == '6') {
										$('.owl-carousel .row', $el).addClass('penta-h-padding');
									} else if (params.h_padding == '7') {
										$('.owl-carousel .row', $el).addClass('exa-h-padding');
									}
								}
								break;
							case 'unlock_row':
							case 'unlock_row_content':
								if ( params.unlock_row === 'yes' && params.unlock_row_content !== 'yes' ) {
									$('.owl-carousel .row', $el).addClass('limit-width');
								} else {
									$('.owl-carousel .row', $el).removeClass('limit-width');
								}
								break;
							case 'row_height_percent':
								if ( params[p] === '' || params[p] == '0' ) {
									$el.find('.owl-carousel').removeClass('owl-height-forced').addClass('owl-height-auto');
								} else {
									$el.find('.owl-carousel').removeClass('owl-height-auto').addClass('owl-height-forced');
								}
								break;
						}

					}
				}
			}

			if ( shortcode === 'vc_button' ) {
				$( document ).trigger( 'vc-frontend:vc_button' );
			}

			if ( shortcode === 'uncode_slider' ) {
				UNCODE.carousel( $el );
			}

			UNCODE.utils();
			UNCODE.bigText();

			UNCODE.vcFrontendMoveControls( model );

		});

		var footer_Controls_position = function(){
			if ( SiteParameters.is_frontend_editor ) {
				var $colophon = $('#colophon'),
					$credits = $('.footer-last', $colophon),
					creditsH,
					$controls = $('.vc_controls-content_block .vc_controls-cc', $colophon);

				if ( $credits.length && $controls.length ) {
					creditsH = $credits.outerHeight();
					$controls.css({
						'margin-top': creditsH * -0.5
					})
				}
			}
		}

		window.parent.vc.events.on("app.render", footer_Controls_position);

		var setTO_footer_ctrls;
		$(window).on( 'resize', function(){
			clearRequestTimeout(setTO_footer_ctrls);
			setTO_footer_ctrls = requestTimeout( footer_Controls_position, 100 );
		});

		var appendWireframesButton = function() {
			var addElementButton = $('#vc_not-empty-add-element');

			if (addElementButton.length > 0) {
				addElementButton.parent().append('<a id="vc_templates-more-layouts" class="vc_add-element-not-empty-button" ><i class="fa fa-layout"></i></a>');
			}
		}
	}

	window.fixallInputs();

	window.parent.vc.events.on('render:PostSettingsPanelView', function(){
		window.uncode_hide_flip_from_hor_el();
		window.uncode_hide_animation_seq_from_css_grid();
	});

})(jQuery);
