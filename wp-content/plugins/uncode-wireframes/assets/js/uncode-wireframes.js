jQuery(document).ready(function ($) {
	'use strict';
	/* global jQuery, WireframeParameters, vc_slugify, Bricks */

	var wireframesList = $('.vc_ui-template-list');
	var wireframesWindow = $('#vc_ui-panel-templates');
	var wireframesElements = $('.vc_templates-list-default_templates .vc_ui-template');
	var loadedImagesCount = 0;
	var totalImages = wireframesElements.find('img').length;
	var wireframesNav = $('.wireframe-categories-navigation__list');
	var wireframeSearch = $('#vc_templates_name_filter');
	var wireframeSearchContainer = wireframeSearch.closest('.vc_ui-search-box');

	var sizes = [
		{columns: 1, gutter: 0},
		{mq: '800px', columns: 2, gutter: 0},
		{mq: '1200px', columns: 3, gutter: 0},
		{mq: '2010px', columns: 4, gutter: 0}
	];

	var grid = Bricks({
		packed: 'data-packed',
		container: '.wireframes-list-inner',
		sizes: sizes
	});

	// Disable glitchy native Bricks.js resize method and create a new one
	grid.resize(false);
	var setResize;
	$(window).on('resize', function () {
		clearTimeout(setResize);
		setResize = setTimeout(function () {
			grid.pack();
		}, 150);
	});

	var didScroll = false;
	var justOpened = false;
	var loadingIconRemoved = false;

	function onPackLayout() {
		if (!justOpened && !loadingIconRemoved) {
			wireframesList.removeClass('loading');
			$('.wireframe-loading-icon').remove();
			loadingIconRemoved = true;
		}
	}

	function loadWireframesSRC(reload) {
		var listenAgain = typeof reload !== 'undefined';

		wireframesElements.each(function () {
			var _this = $(this);
			var img = _this.find('img');

			if (!img.hasClass('done')) {
				var src = img.attr('data-src');

				img.attr('src', src);
			}
		});

		if (listenAgain) {
			listenImagesLoad();
		}
	}

	function listenImagesLoad() {
		// Run Imagesloaded from 0 all the times
		if (loadedImagesCount >= totalImages) {
			loadedImagesCount = 0;
		}

		$('.wireframes-list-inner').imagesLoaded()
			.always(function (_instance) {
				if (WireframeParameters.enable_debug === '1') {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('All images loaded');
				}
			})
			.done(function (_instance) {
				grid.pack();
				if (WireframeParameters.enable_debug === '1') {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('All images successfully loaded');
				}
			})
			.fail(function () {
				if (WireframeParameters.enable_debug === '1') {
					// This console log is disabled by default
					// So nothing is printed in a typical installation
					//
					// It can be enabled for debugging purposes setting
					// the 'uncode_enable_debug_on_js_scripts' filter to true
					console.log('All images loaded, at least one is broken');
				}
			})
			.progress(function (_instance, image) {
				if (image.isLoaded) {
					loadedImagesCount++;
					image.img.className = 'done';
				}

				if (loadedImagesCount % 30 === 0) {
					justOpened = false;
					grid.pack();
				}
			});
	}

	function toggleSearchVisibility() {
		var selectedTab = wireframesWindow.find('.vc_edit-form-tab.vc_active');

		if (selectedTab.attr('data-tab') === 'default_templates') {
			wireframeSearchContainer.show();
		} else {
			wireframeSearchContainer.hide();
		}
	}

	function scrollToTop() {
		if (didScroll) {
			wireframesWindow.find('.vc_col-sm-12').scrollTop(0);

			setTimeout(function () {
				didScroll = false;
			}, 100);
		}
	}

	function onOpenWireframesWindow() {
		justOpened = true;
		loadingIconRemoved = false;

		setTimeout(function () {
			justOpened = false;
		}, 1000);

		// Reset the search value and show all the templates all the times you open the template panel
		wireframeSearch.val('');
		wireframesNav.find('li[data-sort="all"]').addClass('active').trigger('click');

		// -----------------------------------------------------------
		// Loading
		// -----------------------------------------------------------

		// Main list
		wireframesList.addClass('loading');
		$('.vc_edit-form-tab[data-tab="default_templates"]').append('<span class="vc_ui-wp-spinner wireframe-loading-icon"></span>');

		// Remove template rendering icon
		$('.template-rendering-icon').remove();
		wireframesElements.removeClass('rendering');

		// -----------------------------------------------------------
		// Masonry for wireframes thumbs
		// -----------------------------------------------------------

		grid.on('pack', onPackLayout);

		// -----------------------------------------------------------
		// Lazy load for wireframe thumbs
		// -----------------------------------------------------------

		loadWireframesSRC();
		listenImagesLoad();

		// -----------------------------------------------------------
		// Set wireframe navigation count and filtering
		// -----------------------------------------------------------

		// Calculate count for each wireframe category
		if (!wireframesNav.hasClass('count-done')) {
			wireframesNav.find('li').each(function () {
				var _this = $(this);

				if (_this.attr('data-sort') === 'all') {
					_this.find('.count').html(wireframesElements.length);
				} else {
					var selectedCatLength = wireframesElements.filter('.' + _this.attr('data-sort')).length;

					_this.find('.count').html(selectedCatLength);
				}
			});

			wireframesNav.addClass('count-done');
		}

		// Filter wireframes by category
		if (!wireframesNav.find('li[data-sort="all"]').hasClass('active')) {
			wireframesNav.find('li[data-sort="all"]').addClass('active').trigger('click');
		}

		wireframesNav.find('li').off().on('click', function () {
			wireframeSearch.val('');

			var _this = $(this);
			var selectedCat = _this.attr('data-sort');

			wireframesNav.find('li').removeClass('active');
			_this.addClass('active');
			wireframesElements.parent().show();

			if (selectedCat !== 'all') {
				wireframesElements.not('.' + selectedCat).parent().hide();

				setTimeout(function () {
					loadWireframesSRC(true);
				}, 500);
			}

			grid.pack();
			scrollToTop();
		});

		// -----------------------------------------------------------
		// Append text to wireframes that needs a dependency
		// -----------------------------------------------------------
		if (!wireframesList.hasClass('instructions-done')) {
			wireframesElements.each(function () {
				var _this = $(this);
				var button = _this.find('.vc_ui-list-bar-item-trigger');
				var text = '';

				// Remove alt text
				button.attr('title', '');

				// Add span inside buttons
				button.wrapInner('<span class="wireframe-title-wrapper"></span>');

				// Needs plugin
				if (_this.hasClass('has-dependency') && !_this.hasClass('dependency-done')) {
					var classes = _this.attr('class');
					var neededPlugin = classes.match(/needs-([^\s]+)/gm)[0];

					neededPlugin = neededPlugin.replace('needs-', '');
					text = WireframeParameters.locale.needs_dependency;

					var pluginName = WireframeParameters.dependecies_map[neededPlugin];

					text = text.replace('%s', pluginName);

					button.append('<span class="wireframe-instructions-text">' + text + '</span>');
					_this.addClass('dependency-done');
				}

				// For content blocks
				if (_this.hasClass('for-content-blocks') && !_this.hasClass('dependency-done')) {
					button.append('<span class="wireframe-instructions-text">' + WireframeParameters.locale.for_content_block + '</span>');
					_this.addClass('dependency-done');
				}

				wireframesList.addClass('instructions-done');
			});
		}

		// -----------------------------------------------------------
		// Trigger masonry on search
		// -----------------------------------------------------------

		wireframeSearch.on('focus', function () {
			if (!wireframesNav.find('li[data-sort="all"]').hasClass('active')) {
				wireframesNav.find('li[data-sort="all"]').addClass('active').trigger('click');
			}
		});

		var setKeyup;
		wireframeSearch.on('keyup search', function () {
			clearTimeout(setKeyup);
			var _this = $(this);

			setKeyup = setTimeout(function () {
				var val = _this.val();

				if (val.length > 0) {
					wireframesList.find('.wireframes-list-item').removeClass('wireframes-list-item-masonry').hide();
					wireframesList.find('[data-wireframe_name*="' + vc_slugify(val) + '"]').addClass('wireframes-list-item-masonry').show();
				} else {
					wireframesList.find('.wireframes-list-item').addClass('wireframes-list-item-masonry').show();
				}

				grid.pack();
			}, 500);
		});

		// -----------------------------------------------------------
		// Show or hide wiframes search
		// -----------------------------------------------------------

		toggleSearchVisibility();

		var doingClick = false;

		wireframesWindow.find('.vc_panel-tabs-control button').on('click', function () {
			if (!doingClick) {
				doingClick = true;

				setTimeout(function () {
					scrollToTop();
					toggleSearchVisibility(true);
					doingClick = false;
				}, 100);
			}
		});

		// -----------------------------------------------------------
		// Scroll to top
		// -----------------------------------------------------------

		wireframesWindow.find('.vc_col-sm-12').scroll(function () {
			didScroll = true;
		});
	}

	$('#vc_templates-editor-button, #vc_templates-more-layouts').on('click', onOpenWireframesWindow);
	$(document).on('open-templates-window', onOpenWireframesWindow);

	$('.vc_ui-list-bar-item-trigger').on('click [data-template_id] [data-template-handler]', function (e) {
		var _this = $(e.target);
		var template = _this.closest('.vc_ui-template');
		template.addClass('rendering');
		template.append('<span class="vc_ui-wp-spinner template-rendering-icon"></span>');
	});

	// -----------------------------------------------------------
	// Switch panel
	// -----------------------------------------------------------
	$('#wpb_visual_composer').on('click', '#vc_templates-editor-button', function (e) {
		var _this = $(e.target);

		if (_this.hasClass('user-templates') || _this.parent().hasClass('user-templates')) {
			$('[data-vc-ui-element-target="[data-tab=my_templates]"]').click();
		}
	});

	// -----------------------------------------------------------
	// Add new button that opens the wireframes window
	// -----------------------------------------------------------
	var addElementButton = $('#vc_not-empty-add-element');

	if (addElementButton.length > 0) {
		addElementButton.parent().append('<a id="vc_not-empty-add-wireframe" class="vc_add-element-not-empty-button" ><i class="fa fa-layout"></i><span>' + WireframeParameters.locale.add_wireframe + '</span></a>');
		addElementButton.append('<span>' + WireframeParameters.locale.add_element + '</span></a>');

		$('#vc_not-empty-add-wireframe').on('click', function () {
			$('#vc_templates-editor-button').trigger('click');
		});
	}

	var addTemplateButton = $('#vc_templates-more-layouts');

	if (addTemplateButton.length > 0) {
		addTemplateButton.find('span').text(WireframeParameters.locale.add_wireframe);
	}
});
