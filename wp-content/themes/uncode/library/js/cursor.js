(function($) {
	"use strict";

	UNCODE.magicCursor = function(){
	var $customCursor = $('#uncode-custom-cursor'),
		$customPilot = $('#uncode-custom-cursor-pilot'),
		$tooltip = $('.title-tooltip', $customCursor),
		$cursorSpan = $('> span', $tooltip),
		currentBg = false,
		fromTitle = false,
		setTime,
		mouseEvent;

		var spanW, spanH,
		maxW = false;

	function delayChangeCursor(cursorType, cursorTitle, cursorBg, delayt_time, dataTitle, fontClass){
		if ( currentBg !== false && cursorBg === false && cursorType === 'auto' ) {
			$tooltip.css({opacity: 0});
			delayt_time += 400;
		}
		clearRequestTimeout(setTime);
		setTime = requestTimeout(function() {

			$tooltip.css({opacity: ''});

			$customCursor.find('> span:first-child').add($tooltip).removeClass('tooltip-boing');

			if ( cursorTitle !== '' ) {
				if ( fromTitle && dataTitle === 'boing' ) {
					setTimeout(function(){
						$customCursor.find('> span:first-child').add($tooltip).addClass('tooltip-boing');
					}, 5);
				}
				$cursorSpan.attr('class', fontClass).html( cursorTitle );
			} else {
				if ( cursorType !== 'auto' ) {
					$cursorSpan.html('');
				}
			}

			$cursorSpan.addClass('in-tooltip');

			$customCursor.attr('data-cursor', cursorType);

			if ( fromTitle ) {
				$customCursor.addClass('from-tooltip-title');
			} else {
				$customCursor.removeClass('from-tooltip-title');
			}

			if ( cursorBg !== false ) {
				$customCursor.attr('data-bg', 'transparent');
			} else {
				$customCursor.removeAttr('data-bg');
			}

			currentBg = cursorBg;

			if ( cursorTitle !== '' ) {
				fromTitle = true;
				$customCursor.attr('data-cursor', cursorType);
				$customCursor.attr('data-title', 'true');
				$cursorSpan.css({width: ''});
			} else {
				fromTitle = false;
				$customCursor.removeAttr('data-title');
			}
			spanW = $cursorSpan.outerWidth();
			
			if ( spanW >= maxW && maxW !== false ) {
				$customCursor.find('> span:first-child').add($tooltip).addClass('max-width');	
				$customCursor.find('> span:first-child').add($tooltip).add($cursorSpan).css({
					width: maxW
				});
				spanW = maxW;
			} else {
				$customCursor.find('> span:first-child').removeClass('max-width');
			}
			spanH = $cursorSpan.outerHeight();
			if ( spanW && spanH && cursorTitle !== '' && cursorType.indexOf('icon-') >= 0 ) {
				$customCursor.find('> span:first-child').add($tooltip).css({
					width: spanW,
					height: spanH
				});
			} else {
				$customCursor.find('> span:first-child').add($tooltip).removeAttr("style");
			}
			if ( $customPilot.length ) {
				$customPilot.attr('data-cursor', cursorType);
			}
		}, delayt_time);
	}

	function changeCursor($wrap){
		$wrap = typeof $wrap === 'undefined' ? $('body') : $wrap;
		var href = SiteParameters.custom_cursor_selector != '' ? SiteParameters.custom_cursor_selector : '[href], a[data-lbox]',
			$href = $wrap.find(href),
			cursorType,
			cursorTitle = '',
			tooltip_class = '',
			cursorBg = false;

		$wrap.filter(":not(.cursor-init)").on("mouseenter.cursor", href, function (e) {
			var $this = $(this).addClass("cursor-init"),
				$tmb = $this.closest('.tmb'),
				data_cursor = $this.closest('[data-cursor]').attr('data-cursor') || $this.attr('data-cursor'),
				cursor_bg = $this.closest('[data-cursor]').attr('data-cursor-transparent') || $this.attr('data-cursor-transparent'),
				data_title = $this.closest('[data-cursor]').attr('data-cursor-title') || $this.attr('data-cursor-title'),
				data_class = $this.closest('[data-cursor]').attr('data-tooltip-class') || $this.attr('data-tooltip-class'),
				custom_text = ($this.closest('[data-cursor]').attr('data-tooltip-text') || $this.attr('data-tooltip-text')),
				$title = $('.t-entry-title', $tmb),
				is_frontend_editor = $this.closest('.vc_controls').length,
				hasSrcOrClck = $('[src]', $this).length || $('.t-background-cover', $this).length || $this.closest('.tmb-click-row').length,
				$parent_cursor = $this.closest('[class*="custom-cursor"]');

			if ( is_frontend_editor ) {
				cursorType = 'auto';
			} else if ( typeof data_cursor !== 'undefined' && data_cursor !== '' && hasSrcOrClck ) {
				cursorType = data_cursor;
			} else if ( $parent_cursor.length ) {
				if ( $parent_cursor.hasClass('custom-cursor-light') ) {
					cursorType = 'icon-light';
				} else if ( $parent_cursor.hasClass('custom-cursor-diff') ) {
					cursorType = 'icon-diff';
				} else if ( $parent_cursor.hasClass('custom-cursor-accent') ) {
					cursorType = 'icon-accent';
				} else {
					cursorType = 'icon-dark';
				}
			} else {
				cursorType = 'pointer';
			}

			if ( typeof data_title !== 'undefined' && data_title !== '' ) {
				if ( typeof custom_text !== 'undefined' && custom_text !== '' ) {
					cursorTitle = custom_text;
				} else {
					cursorTitle = $title.clone();
					$('a', cursorTitle).replaceWith(function() {
						return this.childNodes;
					});
					$('*', cursorTitle).replaceWith(function(){
						return $(this).removeAttr('class');
					});
					cursorTitle = cursorTitle.html();
				}
			} else {
				cursorTitle = '';
			}

			if ( typeof data_class !== 'undefined' && data_class !== '' ) {
				tooltip_class = data_class;
			} else {
				tooltip_class = '';
			}

			if ( cursor_bg == 'true' ) {
				cursorBg = true;
			} else {
				cursorBg = false;
			}

			delayChangeCursor(cursorType, cursorTitle, cursorBg, 0, data_title, tooltip_class);
		}).on("mouseleave.cursor", href, function(e) {
			var outTime = 150;
			if ( currentBg !== false && cursorBg === false ) {
				outTime = 0;
			}
			delayChangeCursor('auto', '', false, outTime, false, '');
		});

		$(window).on('disable-hover', function(event) {
			document.addEventListener("mousemove", function(e) {
				mouseEvent = e;
			});
			delayChangeCursor('auto', cursorTitle, cursorBg, 0, false, '');
		});

		$(window).on('enable-hover', function(event) {
			if ( typeof mouseEvent !== 'undefined' ) {
				var x = mouseEvent.clientX,
					y = mouseEvent.clientY;

				var elements = document.elementsFromPoint(x, y),
					$element = $(elements[0]);

				$element.closest(href).trigger('mouseenter');
			}
		});

	}

	$(window).on('load uncode-custom-cursor uncode-quick-view-loaded', function(event) {
		changeCursor();
	});

	$(document).ajaxComplete(function( event, xhr, settings ) {
		changeCursor();
	});

	$('.isotope-container').on('isotope-layout-complete', function() {
		var $this = $(this);
		changeCursor($this);
	});

};


})(jQuery);
