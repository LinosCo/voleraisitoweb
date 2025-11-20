(function($) {
	"use strict";

	UNCODE.changeSkinOnScroll = function(){
	if ( UNCODE.isFullPage && ! UNCODE.isFullPageSnap ) {
		return;
	}
	var $masthead = $('#masthead'),
		transDesktop,
		transMobile,
		changeSkin,

	checkTransparencyAndChange = function( $col ){
		transDesktop = $masthead.hasClass('menu-desktop-transparent') && UNCODE.wwidth >= UNCODE.mediaQuery;
		transMobile = $masthead.hasClass('menu-mobile-transparent') && UNCODE.wwidth < UNCODE.mediaQuery;
		changeSkin = $masthead.hasClass('menu-change-skin');

		if ( ! transDesktop && ! transMobile ) {
			return false;
		}

		if ( ! changeSkin ) {
			return false;
		}

		if ( $col.hasClass('style-light') ){
			$masthead.removeClass('style-dark-override').addClass('style-light-override');
			return false;
		} else if ( $col.hasClass('style-dark') ) {
			$masthead.removeClass('style-light-override').addClass('style-dark-override');
			return false;
		}
	};

	var prev_row = 'normal',
		odd = true,
		$rows = $('.vc_row[data-parent]:visible');
	$.each($rows, function(index, row){
		var $row = $(row),
			$col = $('.uncol', $row).first(),
			$slider = $('.uncode-slider', $row);

		var wayDown = new Waypoint({
			context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
			element: row,
			handler: function(direction) {
				if ( direction == 'down' && ( prev_row !== 'normal' || !row.hasAttribute('data-bg-changer') ) ) {
					if ( $slider.length ) {
						$col = $('.owl-item.index-active .uncol', $slider).first();
					}
					checkTransparencyAndChange($col);
				}
				if ( odd === false ) {
					if ( row.hasAttribute('data-bg-changer') ) {
						prev_row = 'bg-changer';
					} else {
						prev_row = 'normal';
					}
					odd = true;
				} else {
					odd = false;
				}
			},
			offset: function() {
				return UNCODE.menuHeight / 2
			}
		});
		var wayUp = new Waypoint({
			context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
			element: row,
			handler: function(direction) {
				if ( direction == 'up' && ( prev_row !== 'normal' || !row.hasAttribute('data-bg-changer') ) ) {
					if ( $slider.length ) {
						$col = $('.owl-item.index-active .uncol', $slider).first();
					}
					checkTransparencyAndChange($col);
				}
				if ( odd === false ) {
					if ( row.hasAttribute('data-bg-changer') ) {
						prev_row = 'bg-changer';
					} else {
						prev_row = 'normal';
					}
					odd = true;
				} else {
					odd = false;
				}
			},
			offset: function() {
				return -row.clientHeight + ( UNCODE.menuHeight / 2 )
			}
		});
	});

};


})(jQuery);
