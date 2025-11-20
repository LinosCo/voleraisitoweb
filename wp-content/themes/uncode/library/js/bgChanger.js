(function($) {
	"use strict";

	UNCODE.bgChanger = function() {
	var $bg_changers = $('.vc_row[data-bg-changer]:visible'),
		$bg_first = $('.vc_row[data-bg-remove]'),
		bg_remove = $bg_first.attr('data-bg-remove'),
		$first = $bg_changers.first(),
		$last = $bg_changers.last(),
		$bg_wrapper = $('#changer-back-color'),
		$bg_changings = $('div[data-bg-changing]', $bg_wrapper),
		setCTA, localH = UNCODE.wheight,
		isScrolling;

	$bg_first.removeClass(bg_remove);

	var bgChange = function($col, bgColor, skin, tmbskin){
		$bg_wrapper.attr( 'class', bgColor );
		var menuskin;
		if ( typeof skin !== 'undefined' ) {
			menuskin = skin.replace('style', 'menu')
		}

		if ( $col.length ) {
			$('.uncol[data-skin-change]').each(function(){
				var $isoFooter = $('.isotope-footer', this);
				$(this).add($isoFooter).removeClass('style-dark').removeClass('style-light').addClass(skin);
				if ( menuskin !== '' ) {
					$(this).find('.isotope-filters:not(.with-bg)').removeClass('menu-dark').removeClass('menu-light').addClass(menuskin);
				}
			});

			$('.tmb[data-skin-change]').each(function(){
				$(this).removeClass('tmb-dark').removeClass('tmb-light').addClass(tmbskin);
			});
		}
	};

	var $masthead = $('#masthead'),
		transDesktop,
		transMobile,
		changeSkin,

	checkTransparencyAndChange = function( skin ){
		transDesktop = $masthead.hasClass('menu-desktop-transparent') && UNCODE.wwidth >= UNCODE.mediaQuery;
		transMobile = $masthead.hasClass('menu-mobile-transparent') && UNCODE.wwidth < UNCODE.mediaQuery;
		changeSkin = $masthead.hasClass('menu-change-skin');

		if ( ! transDesktop && ! transMobile ) {
			return false;
		}

		if ( ! changeSkin ) {
			return false;
		}

		if ( skin === 'style-light' ){
			$masthead.removeClass('style-dark-override').addClass('style-light-override');
			return false;
		} else if ( skin === 'style-dark' ) {
			$masthead.removeClass('style-light-override').addClass('style-dark-override');
			return false;
		}
	};

	var bg_waypoints = function(){
		if ( $bg_changers.length && !SiteParameters.is_frontend_editor ) {

			$.each($bg_changers, function(index, row) {

				var $row = $(row),
					$col = $('.uncol[data-skin-change]', $row).eq(0),
					skin,
					$tmbs,
					tmbskin,
					bgColor = $row.attr('data-bg-color');

				if ( ! $row.is(':visible') ) {
					return false;
				}

				if ( $col.length ) {
					skin = $col.attr('data-skin-change');
					$tmbs = $('.tmb[data-skin-change]', $row);
					tmbskin = skin.replace('style', 'tmb');
				}

				if ( ! $row.hasClass('unscroll-horizontal') ) {
					$row.waypoint(function( dir ) {
						if ( dir === 'down' ) {
							bgChange($col, bgColor, skin, tmbskin);
							checkTransparencyAndChange(skin);
						} else {
							return;
						}
					}, {
						offset: '50%'
		  			});

					$row.waypoint(function( dir ) {
						if ( dir === 'up' ) {
							bgChange($col, bgColor, skin, tmbskin);
							checkTransparencyAndChange(skin);
						} else {
							return;
						}
					}, {
						offset: function() {
							var clH = this.element.clientHeight,
								wH = window.innerHeight,
								ret = clH > 200 ? -100 : clH * -0.5;
							return ( wH / 2 ) - clH;
						}
					});
				}

			});

			$('body').addClass('bg-changer-init');

		}
	};

	var body = document.body,
	edges = false;

	var throttle = function(fn, wait) {
		var time = Date.now();
		return function() {
			if ((time + wait - Date.now()) < 0) {
				fn();
				time = Date.now();
			}
		}
	}

	var $wrapper = document.querySelector(".main-wrapper"),
		currentPixel = window.pageYOffset || window.document.documentElement.scrollTop;

	var $title = document.querySelector('#rotating');
	if ( $title !== null ) {
		$title.style.whiteSpace = 'nowrap';
		$title.style.transition = 'transform 200ms linear';
	}

	window.addEventListener( 'scroll', throttle( function() {
		window.clearRequestTimeout( isScrolling );

		isScrolling = requestTimeout(function() { //trick to make understand Waypoints when it reaches a small first or last row

			var scrolled = window.pageYOffset || window.document.documentElement.scrollTop,
				body = document.body,
				html = document.documentElement,
				docH = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight ),
				$row = false,
				firstOff,
				lastOff;

			if ( scrolled < 100 && $first.length ) {
				firstOff = $first.offset().top;
				if ( firstOff < 100 ) {
					var $row = $first;
				}
			} else if ( ( scrolled + UNCODE.wheight ) > ( docH - 100 ) && $last.length ) {
				lastOff = $last.offset().top + $last.outerHeight();
				if ( lastOff > ( docH - 100 ) ) {
					var $row = $last;
				}
			}

			if ( $row.length ) {
				var $col = $('.uncol[data-skin-change]', $row).eq(0),
					skin,
					$tmbs,
					tmbskin,
					bgColor = $row.attr('data-bg-color');

				if ( $col.length ) {
					skin = $col.attr('data-skin-change');
					$tmbs = $('.tmb[data-skin-change]', $row);
					tmbskin = skin.replace('style', 'tmb');
				}

				bgChange($col, bgColor, skin, tmbskin);
				checkTransparencyAndChange(skin);
				edges = true;
			}

		}, 150);

		if ( edges === true ) { //trick to make understand Waypoints when, after reaching a small first or last row, it has to start detecting again
			bg_waypoints();
			Waypoint.refreshAll();
			edges = false;
		}

	}, 100), false);

	$(window).on('resize', function() {
		clearRequestTimeout(setCTA);
		setCTA = requestTimeout(function() {
			if ( localH != UNCODE.wheight ) {
				localH = UNCODE.wheight;
				bg_waypoints();
				Waypoint.refreshAll();
			}
		}, 100);
	});

	bg_waypoints();

};


})(jQuery);
