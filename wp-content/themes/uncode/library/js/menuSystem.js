(function($) {
	"use strict";

	UNCODE.menuSystem = function() {

	function menuMobile() {
		var $body = $('body'),
			scrolltop,
			$mobileToggleButton = $('.mobile-menu-button, .uncode-close-offcanvas-mobile'),
			$masthead = $('#masthead'),
			$box,
			$el,
			$el_transp,
			elHeight,
			offCanvasAnim,
			check,
			animating = false,
			stickyMobile = false,
			menuClose = new CustomEvent('menuMobileClose'),
			menuOpen = new CustomEvent('menuMobileOpen');
		UNCODE.menuOpened = false;
		$mobileToggleButton.on('click', function(event) {
			event.stopPropagation();
			var btn = this;
			if ($(btn).hasClass('overlay-close')) return;
			event.preventDefault();
			$('.overlay-search.open .menu-close-dd', $masthead).trigger('click');
			if (UNCODE.wwidth <= UNCODE.mediaQuery) {
				$box = $(this).closest('.box-container').find('.main-menu-container');
				$el = $(this).closest('.box-container').find('.menu-horizontal-inner:not(.row-brand), .menu-sidebar-inner');
				$el_transp = $('.menu-absolute.menu-transparent');
				if (UNCODE.isMobile) {
					if ( $('.menu-wrapper.menu-sticky, .menu-wrapper.menu-hide-only, .main-header .menu-sticky-vertical, .main-header .menu-hide-only-vertical, .menu-mobile-centered, .menu-sticky-mobile').length ) {
						stickyMobile = true;
						elHeight = window.innerHeight - UNCODE.menuMobileHeight - (UNCODE.bodyBorder * 2) - UNCODE.adminBarHeight + 1;
					} else {
						elHeight = 0;
						$.each($box.find('> div'), function(index, val) {
							elHeight += $(val).outerHeight();
						});
					}
				} else {
					elHeight = 0;
					$.each($el, function(index, val) {
						elHeight += $(val).outerHeight();
					});
				}
				var open = function() {
					clearTimeout(offCanvasAnim);
					if (!animating) {
						$body.addClass('open-overlay-menu').addClass('opening-overlay-menu');
						scrolltop = $(window).scrollTop();
						window.dispatchEvent(menuOpen);
						animating = true;
						UNCODE.menuOpened = true;
						if ($('body[class*="vmenu-"], body.hmenu-center').length && ($('.menu-hide, .menu-sticky, .menu-transparent').length)) {
							if ( $body.hasClass('menu-sticky-mobile') || ( $('#masthead.menu-transparent').length && !UNCODE.isMobile ) ) {
								$('.main-header > .vmenu-container').css({position:'fixed', top: ($('.menu-container').outerHeight() + UNCODE.bodyBorder + UNCODE.adminBarHeight) + 'px'});
							}
							if ($('body.menu-offcanvas').length) {
								$('.menu-container:not(.sticky-element):not(.grid-filters)').css({position:'fixed'});
								$('.vmenu-container.menu-container:not(.sticky-element):not(.grid-filters)').css({position:'fixed', top: (UNCODE.menuMobileHeight + UNCODE.bodyBorder + UNCODE.adminBarHeight) + 'px'});
							} else {
								if ( $('.menu-hide, .menu-sticky').length ) {
									if ( UNCODE.wwidth >= 960 && $('.menu-sticky').length  ) {
										$('.menu-container:not(.sticky-element):not(.grid-filters)').css({position:'fixed'});
									}
								}
							}
						}
						if ($('body.hmenu-center').length && ( (!UNCODE.isMobile && $('.menu-hide, .menu-sticky').length) || (UNCODE.isMobile && $('.menu-sticky-mobile').length) )) {
							//$("#masthead")[0].scrollIntoView();
							$('.menu-container:not(.sticky-element):not(.grid-filters)').css({position:'fixed', top: (UNCODE.menuMobileHeight + UNCODE.bodyBorder + UNCODE.adminBarHeight) + 'px'});
						}
						$box.addClass('open-items');
						if ($el_transp.length && $('body.menu-mobile-transparent').length) {
							$el_transp.addClass('is_mobile_open');
						}
						if ( ! $('body').hasClass('menu-mobile-off-canvas') ) {
							btn.classList.add('close');
							$box.animate({
								height: elHeight
							}, 600, "easeInOutCirc", function() {
								animating = false;
								if (!stickyMobile) $box.css('height', 'auto');
							});
						} else {
							animating = false;
						}
					}
				};

				var close = function() {
					clearTimeout(offCanvasAnim);
					if (!animating) {
						window.dispatchEvent(menuClose);
						animating = true;
						UNCODE.menuOpened = false;
						if ( ! $('body').hasClass('menu-mobile-off-canvas') ) {
							btn.classList.remove('close');
							btn.classList.add('closing');
						}
						$box.addClass('close');
						requestTimeout(function() {
							$box.removeClass('close');
							$box.removeClass('open-items');
							btn.classList.remove('closing');
							if ($el_transp.length) {
								$el_transp.removeClass('is_mobile_open');
							}
						}, 500);
						$body.removeClass('opening-overlay-menu');
						if ( ! $('body').hasClass('menu-mobile-off-canvas') ) {
							$box.animate({
								height: 0
							}, {
								duration: 600,
								easing: "easeInOutCirc",
								complete: function(elements) {
									$(elements).css('height', '');
									animating = false;
									if ($('body[class*="vmenu-"]').length && UNCODE.wwidth >= 960) {
										$('.main-header > .vmenu-container').add('.menu-container:not(.sticky-element):not(.grid-filters)').css('position','relative');
									}
									$body.removeClass('open-overlay-menu');
								}
							});
						} else {
							animating = false;
							offCanvasAnim = setTimeout(function(){
								$body.removeClass('open-overlay-menu');
							}, 1000);
						}
					}
				};
				check = (!UNCODE.menuOpened) ? open() : close();
			}
		});

		$('html').on('click', function(event){
			if ( $('body').hasClass('menu-mobile-off-canvas') && UNCODE.wwidth < 960 && UNCODE.menuOpened && event.clientX < SiteParameters.menu_mobile_offcanvas_gap ) {
				$('.uncode-close-offcanvas-mobile').trigger('click');
			}
		});

		window.addEventListener('menuMobileTrigged', function(e) {
			$('.mobile-menu-button.close, .opening-overlay-menu .uncode-close-offcanvas-mobile').trigger('click');
		});
		window.addEventListener('orientationchange', function(e) {
			$('#logo-container-mobile .mobile-menu-button.close').trigger('click');
		});
		window.addEventListener("resize", function() {
			if ($(window).width() < UNCODE.mediaQuery) {
				if (UNCODE.isMobile) {
					var $box = $('.box-container .main-menu-container'),
						$el = $('.box-container .menu-horizontal-inner, .box-container .menu-sidebar-inner');
					if ($($box).length && $($box).hasClass('open-items') && $($box).css('height') != 'auto' && ! $('body').hasClass('menu-mobile-off-canvas') ) {
						if ($('.menu-wrapper.menu-sticky, .menu-wrapper.menu-hide-only').length) {
							elHeight = 0;
							$.each($el, function(index, val) {
								elHeight += $(val).outerHeight();
							});
							elHeight = window.innerHeight - $('.menu-wrapper.menu-sticky .menu-container .row-menu-inner, .menu-wrapper.menu-hide-only .menu-container .row-menu-inner').height() - (UNCODE.bodyBorder * 2) + 1;
							$($box).css('height', elHeight + 'px');
						}
					}
				}
			} else {
				$('.menu-hide-vertical').removeAttr('style');
				$('.menu-container-mobile').removeAttr('style');
				$('.vmenu-container.menu-container').removeAttr('style');
			}
		});

		$(window).on('scroll', function(){
			if ( $body.hasClass('opening-overlay-menu') && $body.hasClass('menu-mobile-off-canvas') && UNCODE.wwidth < 960 ) {
				$(window).scrollTop(scrolltop);
				return false;
			}
		});

	};

	function menuOffCanvas() {
		var menuClose = new CustomEvent('menuCanvasClose'),
			menuOpen = new CustomEvent('menuCanvasOpen');
		$('.menu-primary .menu-button-offcanvas:not(.menu-close-search)').on('click', function(event) {
			if ($(window).width() > UNCODE.mediaQuery) {
				if ( $('body.vmenu-offcanvas-overlay').length ) {
					if ($(event.currentTarget).hasClass('off-close')) {
						$(event.currentTarget).removeClass('off-close');
						requestTimeout(function() {
							window.dispatchEvent(menuClose);
						}, 500);

					} else {
						$(event.currentTarget).addClass('off-close');
						window.dispatchEvent(menuOpen);
					}
				} else {
					if ($(event.currentTarget).hasClass('close')) {
						$(event.currentTarget).removeClass('close');
						$(event.currentTarget).addClass('closing');
						requestTimeout(function() {
							$(event.currentTarget).removeClass('closing');
							window.dispatchEvent(menuClose);
						}, 500);

					} else {
						$(event.currentTarget).addClass('close');
						window.dispatchEvent(menuOpen);
					}
				}
			}

			$('body').toggleClass('off-opened');
		});

		$('body').off('click.menu-off-canvas-mobile').on('click.menu-off-canvas-mobile', function(e){
			if ( $(window).width() > UNCODE.mediaQuery && $('body.menu-offcanvas.vmenu-offcanvas-overlay.off-opened').length ) {
				var $vMenuCont = $('#masthead .vmenu-container'),
					$close_menu = $('.uncode-close-offcanvas-overlay', $vMenuCont),

					vmenu_h = parseFloat( $vMenuCont.outerHeight() ),
					vmenu_w = parseFloat( $vMenuCont.outerWidth() ),
					vmenu_off = $vMenuCont.offset(),
					vmenu_l = parseFloat(vmenu_off.left),
					vmenu_t = parseFloat(vmenu_off.top),
					vmenu_r = vmenu_l + vmenu_w,
					vmenu_b = vmenu_t + vmenu_h,

					close_h = parseFloat( $close_menu.outerHeight() ),
					close_w = parseFloat( $close_menu.outerWidth() ),
					close_off = $close_menu.offset(),
					close_l = parseFloat(close_off.left),
					close_t = parseFloat(close_off.top),
					close_r = close_l + close_w,
					close_b = close_t + close_h;
				if (
					!(
						e.clientX > vmenu_l &&
						e.clientX < vmenu_r &&
						e.clientY > vmenu_t &&
						e.clientY < vmenu_b
					)
					||
					(
						e.clientX > close_l &&
						e.clientX < close_r &&
						e.clientY > close_t &&
						e.clientY < close_b
					)
				) {
					$('.menu-primary .menu-button-offcanvas:not(.menu-close-search)').trigger('click');
				}
			}
		});
	};

	function menuOverlay() {
		if ( $('.overlay').length ) {
			$('.overlay').removeClass('hidden');
		}
		if ( ($('.overlay-sequential').length > 0 && UNCODE.wwidth >= UNCODE.mediaQuery) || ($('.menu-mobile-animated').length > 0 && UNCODE.wwidth < UNCODE.mediaQuery) ) {
			$('.overlay-sequential .menu-smart > li, .menu-sticky .menu-container .menu-smart > li, .menu-hide.menu-container .menu-smart > li, .vmenu-container .menu-smart > li, .uncode-menu-additional-text').each(function(index, el) {
				var transDelay = (index / 20) + 0.1;
				if ( $('body').hasClass('menu-mobile-centered') && $(window).width() < UNCODE.mediaQuery )
					transDelay = transDelay + 0.3;
				$(this)[0].setAttribute('style', '-webkit-transition-delay:' + transDelay + 's; -moz-transition-delay:' + transDelay + 's; -ms-transition-delay:' + transDelay + 's; -o-transition-delay:' + transDelay + 's; transition-delay:' + transDelay + 's');
			});
		}

	};
	var $secondary_parent;
	function menuAppend() {
		var $body = $('body'),
			$menuCont = $('.menu-container:not(.vmenu-container)'),
			$vMenuCont = $('.menu-container.vmenu-container'),
			$cta = $('.navbar-cta'),
			$socials = $('.navbar-social:not(.appended-navbar)'),
			$ul = $('.navbar-main ul.menu-primary-inner'),
			$ulCta,
			$ulSocials,
			$navLast,
			$firstMenu = $('.main-menu-container:first-child', $menuCont),
			$secondMenu = $('.main-menu-container:last-child', $menuCont),
			$firstNav = $('.navbar-nav:not(.uncode-close-offcanvas-mobile):first-child', $firstMenu),
			$secondNav = $('.navbar-nav:not(.uncode-close-offcanvas-mobile):first-child', $secondMenu),
			$ulFirst = $('> ul', $firstNav),
			$ulSecond = $('> ul', $secondNav),
			setCTA,
			appendCTA = function(){
				return true;
			},
			appendSocials = function(){
				return true;
			},
			appendSplit = function(){
				return true;
			};

		if ( ( $body.hasClass('menu-offcanvas') || $body.hasClass('menu-overlay') || $body.hasClass('hmenu-center-split') ) && $cta.length ) {
			$ulCta = $('> ul', $cta);
			$ulCta.parent().addClass('mobile-hidden').addClass('tablet-hidden');

			appendCTA = function(){
				if (UNCODE.wwidth < UNCODE.mediaQuery) {
					$ul.after($ulCta);
				} else {
					$cta.append($ulCta);
				}
			}
		}

		if ( ! $body.hasClass('cta-not-appended') ) {
			appendCTA();
		}

		var $smartSocial = $menuCont.add($vMenuCont).find('.menu-smart-social');
		$smartSocial.each(function(){
			var $_smartSocial = $(this);
			$('> li', $_smartSocial).each(function(){
				var $li = $(this);
				if ( $li.hasClass('mobile-hidden') ) {
					$_smartSocial.addClass('mobile-hidden');
				} else {
					$_smartSocial.removeClass('mobile-hidden');
					return false;
				}
			});

			$('> li', $_smartSocial).each(function(){
				var $li = $(this);
				if ( $li.hasClass('tablet-hidden') ) {
					$_smartSocial.addClass('tablet-hidden');
				} else {
					$_smartSocial.removeClass('tablet-hidden');
					return false;
				}
			});
		});

		if ( ( $body.hasClass('hmenu-center-split') || $body.hasClass('menu-overlay-center') || $body.hasClass('menu-offcanvas') || $body.hasClass('vmenu') ) && $socials.length ) {
			$ulSocials = $('> ul', $socials).addClass('menu-smart-social');
			if ( $body.hasClass('hmenu-center-split') ) {
				$navLast = $('.menu-horizontal-inner .navbar-nav-last', $menuCont);
			} else {
				$navLast = $('.navbar-nav-last', $vMenuCont);
			}

			if ( ! $navLast.length ) {
				var _navLast = $('<div class="nav navbar-nav navbar-social navbar-nav-last appended-navbar" />');
				if ( $body.hasClass('hmenu-center-split') ) {
					$('.menu-horizontal-inner', $menuCont).append(_navLast);
					$navLast = $('.menu-horizontal-inner .navbar-nav-last', $menuCont);
				} else {
					$('.menu-sidebar-inner', $vMenuCont).last().append(_navLast);
					$navLast = $('.navbar-nav-last', $vMenuCont);
				}
			}

			appendSocials = function(){
				if ( !$body.hasClass('menu-overlay-center') ) {
				// 	if ( !$navLast.find('ul.menu-smart-social').length ) {
				// 		$ulSocials = $('.menu-smart-social li.social-icon', $vMenuCont);
				// 		$navLast.append('<ul class="menu-smart menu-smart-social" />');
				// 		$ulSocials.each(function(){
				// 			var $li_social = $(this);
				// 			$navLast.find('ul.menu-smart-social').append($li_social);
				// 		});
				// 	}
				// } else {
					if (UNCODE.wwidth < UNCODE.mediaQuery) {
						$socials.addClass('mobile-hidden').addClass('tablet-hidden')
						if ( ! $('> ul.menu-smart-social li', $socials).length ) {
							$('> ul.menu-smart-social li', $socials).remove();
						}
						$navLast.append($ulSocials);
					} else {
						if ( ! $('> ul.menu-smart-social li', $navLast).length ) {
							$('> ul.menu-smart-social li', $navLast).remove();
						}
						$socials.append($ulSocials);
					}
				}
			}
			appendSocials();
		}

		if ( $vMenuCont.length ) {
			var $accordion_secondary = $('.menu-accordion-secondary', $vMenuCont);
		} else {
			var $accordion_secondary = $('.menu-accordion-secondary', $menuCont);
		}
		if ( $accordion_secondary.length ) {
			var $accordion_secondary_ph = $vMenuCont.add($menuCont).find('.accordion-secondary-ph');
			if (UNCODE.wwidth < UNCODE.mediaQuery) {
				if ( !$accordion_secondary_ph.length ) {
					$accordion_secondary.after('<span class="accordion-secondary-ph" />');
				}
				if ( $vMenuCont.length ) {
					$('.menu-sidebar-inner', $vMenuCont).first().find('.menu-accordion:not(.menu-accordion-secondary):not(.menu-accordion-extra-icons)').last().after($accordion_secondary);
				} else {
					if ( $('.navbar-nav.navbar-cta:not(.mobile-hidden)', $menuCont).length ) {
						$('.navbar-nav.navbar-cta', $menuCont).after($accordion_secondary);
					} else {
						$('.navbar-nav.navbar-main', $menuCont).after($accordion_secondary);
					}
				}
			} else {
				if ( typeof $accordion_secondary_ph !== 'undefined' && $accordion_secondary_ph.length ) {
					$accordion_secondary_ph.before($accordion_secondary);
				}
			}
		}

		if ( $vMenuCont.length ) {
			var $extra_icons = $('.menu-accordion-extra-icons', $vMenuCont);
		} else {
			var $extra_icons = $('.navbar-extra-icons', $menuCont);
		}

		if ( $extra_icons.length ) {
			if ( $vMenuCont.length ) {
				if ( $('li:not(.social-icon)', $extra_icons).length ) {
					if (UNCODE.wwidth < UNCODE.mediaQuery) {
						var $not_social = $('> ul > li:not(.social-icon)', $extra_icons),
							$primary_after = $('.menu-accordion-primary-after', $vMenuCont);
						$not_social.each(function(){
							if ( ! $primary_after.length ) {
								$('.menu-accordion-primary', $vMenuCont).after('<div class="menu-accordion menu-accordion-primary-after" />');
								$primary_after = $('.menu-accordion-primary-after', $vMenuCont);
								$primary_after.append('<ul class="menu-smart sm sm-vertical menu-smart-social" />');
							}
							var $extra_li = $(this);
							$primary_after.find('> ul').append($extra_li);
						});
					} else {
						var $primary_after = $('.menu-accordion-primary-after', $vMenuCont),
							$not_social = $('> ul > li:not(.social-icon)', $primary_after);
						$not_social.each(function(){
							var $extra_li = $(this);
							$extra_icons.find('> ul').append($extra_li);
						});
					}
				} /*else {
					var $extra_icons_ph = $vMenuCont.add($menuCont).find('.extra-icons-ph');
					if (UNCODE.wwidth < UNCODE.mediaQuery) {
						if ( !$extra_icons_ph.length ) {
							$extra_icons.after('<span class="extra-icons-ph" />');
						}
						if ( $('.navbar-accordion-cta', $vMenuCont).length ) {
							$('.navbar-accordion-cta', $vMenuCont).after($extra_icons);
						} else {
							$('.menu-accordion-primary', $vMenuCont).after($extra_icons);
						}
					} else {
						if ( typeof $extra_icons_ph !== 'undefined' && $extra_icons_ph.length ) {
							$extra_icons_ph.before($extra_icons);
						}
					}
				}*/
			} else {
				if ( ! $body.hasClass('hmenu-center-double') ) {
					if (UNCODE.wwidth < UNCODE.mediaQuery) {
						var $not_social = $('> ul > li:not(.social-icon)', $extra_icons),
							$primary_after = $('.nav.navbar-main-after', $menuCont);

						if ( ! $primary_after.length && $not_social.length ) {
							if ( $('.navbar-nav.navbar-cta:not(.mobile-hidden)', $menuCont).length ) {
								$('.navbar-nav.navbar-cta', $menuCont).after('<div class="nav navbar-main-after" />');
							} else {
								$('.navbar-nav.navbar-main', $menuCont).after('<div class="nav navbar-main-after" />');
							}
							$primary_after = $('.nav.navbar-main-after', $menuCont);
							$primary_after.append('<ul class="menu-smart sm menu-smart-social" role="menu" />');
						}
						var tablet_hidden = true,
							mobile_hidden = true;
						$not_social.each(function(){
							var $extra_li = $(this);
							$primary_after.find('> ul').append($extra_li);
							if ( ! $extra_li.hasClass('tablet-hidden') ) {
								tablet_hidden = false;
							}
							if ( ! $extra_li.hasClass('mobile-hidden') ) {
								mobile_hidden = false;
							}
						});
						if ( tablet_hidden === true && $not_social.length ) {
							$primary_after.addClass('tablet-hidden');
						}
						if ( mobile_hidden === true && $not_social.length ) {
							$primary_after.addClass('mobile-hidden');
						}
					} else {
						var $primary_after = $('.nav.navbar-main-after', $menuCont);

						if ( $primary_after.length ) {
							var $not_social = $('> ul > li:not(.social-icon)', $primary_after);
							$not_social.each(function(){
								var $extra_li = $(this);
								$extra_icons.find('> ul').append($extra_li);
							});
							$primary_after.remove();
						}
					}
				}
			}
		}

		if ( ( $body.hasClass('hmenu-center-double') ) ) {
			appendSplit = function(){
				if (UNCODE.wwidth < UNCODE.mediaQuery) {
					if ( $extra_icons.length ) {
						if ( $('li:not(.social-icon):not(.tablet-hidden):not(.mobile-hidden)', $extra_icons).length ) {
							var $not_social = $('> ul > li:not(.social-icon)', $extra_icons),
								$append_ul = $('<ul class="menu-smart sm sm-vertical append-extra-icons" />');
							$not_social.each(function(){
								var $extra_li = $(this);
								$append_ul.append($extra_li);
							});
							if ( $secondNav.length ) {
								$secondNav.append($append_ul);
							} else {
								$('.menu-horizontal-inner', $menuCont).prepend($append_ul);
							}
						}
					}
					if ( $secondNav.length ) {
						$secondNav.prepend($ulFirst);
					} else {
						$('.menu-horizontal-inner', $menuCont).prepend($ulFirst);
					}
					$firstMenu.hide();
				} else {
					$firstNav.append($ulFirst);
					var $append_ul = $('.menu-horizontal-inner ul.append-extra-icons', $menuCont).eq(0);
					if ( $append_ul.length ) {
						var $not_social = $('> li:not(.social-icon)', $append_ul);
						$not_social.each(function(){
							var $extra_li = $(this);
							$extra_icons.find('> ul').append($extra_li);
						});
					}
					$('.menu-horizontal-inner ul.append-extra-icons', $menuCont).remove();
					$('.menu-horizontal-inner > .menu-primary-inner', $menuCont).remove();
					$firstMenu.css({
						'display': 'table-cell'
					});
				}
			}
		}
		appendSplit();

		$(window).on( 'wwresize', function(){
			clearRequestTimeout(setCTA);
			setCTA = requestTimeout( function() {
				appendCTA();
				appendSocials();
				appendSplit();
			}, 10 );
		});
	}
	//menuMobileButton();
	menuMobile();
	menuOffCanvas();
	menuAppend();
	menuOverlay();

	var stickyDropdownSearch = function(){
		var $masthead = $('#masthead'),
			$ddSearch = $('.overlay.overlay-search', $masthead),
			$styles = $('#stickyDropdownSearch').remove();
		if ( $('body.hmenu-center.menu-sticky-mobile').length && $ddSearch.length ) {
			var $menuWrapper = $('.menu-wrapper'),
				$navbar = $('.menu-container-mobile', $menuWrapper),
				navbarH = $navbar.outerHeight(),
				//$topbar = $('.top-menu', $menuWrapper),
				//topbarH = $topbar.outerHeight(),
				_css;

			_css = '<style id="stickyDropdownSearch">';
			_css += '@media (max-width: 959px) {';
			_css += 'body.hmenu-center.menu-sticky-mobile #masthead .overlay.overlay-search {';
			_css += 'margin-top: ' + parseFloat(navbarH) + 'px !important;';
			_css += '}';
			_css += 'body.hmenu-center.menu-sticky-mobile .navbar.is_stuck + #masthead .overlay.overlay-search {';
			_css += 'position: fixed;';
			_css += 'top: 0;';
			_css += '}';
			_css += '</style>';

			$(_css).appendTo($('head'));
		}
	}
	stickyDropdownSearch();

	var setMenuOverlay;
	$(window).on( 'wwResize', function(){
		if ( $('.overlay').length && $(window).width() > 1024 ) {
			$('.overlay').addClass('hidden');
		}
		clearRequestTimeout(setMenuOverlay);
		setMenuOverlay = requestTimeout( function(){
			menuOverlay();
			menuAppend();
			stickyDropdownSearch();
		}, 150 );
	});
	UNCODE.menuSmartInit();
};

UNCODE.menuSmartInit = function() {
	var $menusmart = $('[class*="menu-smart"]'),
		$masthead = $('#masthead'),
		$hMenu = $('.menu-horizontal-inner', $masthead),
		$focus = $('.overlay-menu-focus'),
		showTimeout = 50,
		hideTimeout = 50,
		showTimeoutFunc, hideTimeoutFunc;

	$('> li.menu-item-has-children', $menusmart).hover(function(){
		$(this).data('hover', true);
	}, function(){
		$(this).data('hover', false);
	});

	$('> li.menu-item-has-children', $menusmart).each(function(){
		var $a = $('> a', this).attr('aria-haspopup', 'true').attr('aria-expanded', 'false')
	});

	$('> li.menu-item a[href="#"]', $menusmart).on('click', function(e){
		e.preventDefault();
	});

	if ( $(window).width() >= UNCODE.mediaQuery && $('.overlay-menu-focus').length ) {
		var $notLis = $('> .nav > ul > li a', $hMenu),
			$menuA = $('a', $masthead).not($notLis),
			$hoverSelector = $('> .nav > ul > li', $hMenu).has('> ul'),
			showFuncCond = function() { return true };

		if ( $('body').hasClass('focus-megamenu') ) {
			$hoverSelector = $('> .nav > ul > li', $hMenu).has('.mega-menu-inner');
			showFuncCond = function($ul) { return $ul.hasClass('mega-menu-inner') };
		} else if ( $('body').hasClass('focus-links') ) {
			$hoverSelector = $('> .nav > ul > li', $hMenu).add($menuA);
		}

		$hoverSelector.hover(function(){
			clearRequestTimeout(hideTimeoutFunc);
			showTimeoutFunc = requestTimeout(function(){
				$('body').addClass('navbar-hover');
			}, showTimeout*2);
		}, function(){
			hideTimeoutFunc = requestTimeout(function(){
				if ( ! $('.overlay-search.open', $masthead).length ) {
					$('body').removeClass('navbar-hover');
				}
			}, hideTimeout*2);
		});
	} else {
		showFuncCond = function() { return false };
	}

	if ($menusmart.length > 0) {
		$menusmart.smartmenus({
			subIndicators: false,
			subIndicatorsPos: 'append',
			//subMenusMinWidth: '13em',
			subIndicatorsText: '',
			showTimeout: showTimeout,
			hideTimeout: hideTimeout,
			scrollStep: 8,
			showFunction: function($ul, complete) {
				clearRequestTimeout(showTimeoutFunc);
				$ul.fadeIn(0, 'linear', function(){
					complete();
					if ( $ul.hasClass('vc_row') ) {
						$ul.css({
							'display': 'table'
						});
					}
					if ( $('.overlay-menu-focus').length && $ul.hasClass('mega-menu-inner') ) {
						$('body').addClass('open-megamenu');
					}
					if ( $('.overlay-menu-focus').length && showFuncCond($ul) && $(window).width() >= UNCODE.mediaQuery && $ul.closest('.main-menu-container').length ) {
						$('body').addClass('navbar-hover');
					}
				}).addClass('open-animated');
			},
			hideFunction: function($ul, complete) {
				if ( $('.overlay-menu-focus').length && $ul.hasClass('mega-menu-inner') && ! $('.overlay-search.open', $masthead).length ) {
					$('body').removeClass('open-megamenu');
				}
				var fixIE = $('html.ie').length;
				if (fixIE) {
					var $rowParent = $($ul).closest('.main-menu-container');
					$rowParent.height('auto');
				}
				$ul.fadeOut(0, 'linear', function(){
					complete();
					$ul.removeClass('open-animated');
					if ( $ul.closest('li.menu-item-has-children').data('hover') === false ) {
						$('body').removeClass('open-submenu');
					}
				});
			},
			collapsibleShowFunction: function($ul, complete) {
				$ul.slideDown(400, 'easeInOutCirc', complete);
			},
			collapsibleHideFunction: function($ul, complete) {
				$ul.slideUp(200, 'easeInOutCirc', complete);
			},
			hideOnClick: SiteParameters.menuHideOnClick,
		});

		if ( $('body').hasClass('menu-accordion-active') ) {
			$menusmart.each(function(key, menu){
				$(menu).addClass('menu-smart-init');
				$(menu).smartmenus( 'itemActivate', $(menu).find( '.current-menu-item > a' ).eq( -1 ) );
			});
		}
		
		$(document).on( 'uncode.smartmenu-appended', function(){
			requestTimeout(function(){
				$menusmart.smartmenus( 'refresh' );
			}, 1000);
		});
	}

	$('.main-menu-container').each(function(){
		var $main_cont = $(this),
			$uls = $('ul', $main_cont);

		$uls.each(function(){
			var $ul = $(this),
				mobile_hidden = true,
				tablet_hidden = true;
			$('> li:not(.hidden)', $ul).each(function(){
				if ( !$(this).hasClass('mobile-hidden') ) {
					mobile_hidden = false;
					return false;
				}
			});
			$('> li:not(.hidden)', $ul).each(function(){
				if ( !$(this).hasClass('tablet-hidden') ) {
					tablet_hidden = false;
					return false;
				}
			});
			if ( mobile_hidden ) {
				$ul.addClass('mobile-hidden');
			}
			if ( tablet_hidden ) {
				$ul.addClass('tablet-hidden');
			}
		});

		var $divUlsMB = $('div:has(>ul.mobile-hidden)');

		$divUlsMB.each(function(){
			var $divUlMB = $(this),
				div_mobile_hidden = true,
				div_tablet_hidden = true;

			$('> ul:not(.hidden)', $divUlMB).each(function(){
				if ( !$(this).hasClass('mobile-hidden') ) {
					div_mobile_hidden = false;
					return false;
				}
			});
			$('> ul:not(.hidden)', $divUlMB).each(function(){
				if ( !$(this).hasClass('tablet-hidden') ) {
					div_tablet_hidden = false;
					return false;
				}
			});
			if ( div_mobile_hidden ) {
				$divUlMB.addClass('mobile-hidden');
			}
			if ( div_tablet_hidden ) {
				$divUlMB.addClass('tablet-hidden');
			}
		});
	});

	var overlaySearchButton = function(){
		var $search_wrap = $('.overlay.overlay-search, .widget_search');

		$search_wrap.each(function(){
			var $form = $('form', this),
				$icon = $('i', $form);

			$icon.on('click', function(){
				$form.submit();
			});
		});
	};
	overlaySearchButton();
}


})(jQuery);
