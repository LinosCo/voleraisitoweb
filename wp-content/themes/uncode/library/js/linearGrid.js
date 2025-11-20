(function($) {
	"use strict";

	UNCODE.linearGrid = function(){
	$('.linear-wrapper').each(function(){
		var $wrap = $(this),
			$system = $wrap.closest('.linear-system'),
			$dragger = $('[data-dragger]', $system),
			$row = $wrap.closest('.vc_row[data-parent]'),
			_row = $row[0],
			$cont = $('.linear-container.cont-leader:not(.cont-appended)', $wrap),
			vertical = $cont.hasClass('linear-or-vertical'),
			clone = $wrap.attr('data-infinite') === 'yes' || vertical,
			freezedDesktop = $wrap.attr('data-freeze') === 'always' || $wrap.attr('data-freeze') === 'desktop',
			freezedMobile = $wrap.attr('data-freeze') === 'always' || $wrap.attr('data-freeze') === 'mobile',
			dataSpeed = parseFloat( $wrap.attr('data-speed') ),
			isInViewport = false,
			isHover = false,
			init = false,
			stableHeight = UNCODE.wheight,
			wCont, hCont, docH, marqueeTL;

		if ( ! $('.tmb', $cont).length ) {
			return;
		}

		dataSpeed = isNaN(dataSpeed) ? 0 : dataSpeed;
		var dataX = dataSpeed;

		dataSpeed += 5;

		var checkLinearGridSize = function(){
			if ( !$wrap.is(':visible') )  {
				return;
			}
			$wrap.find('.cont-appended').remove();

			if ( vertical ) {
				if ( ! SiteParameters.is_frontend_editor ) {
					hCont = $cont.outerHeight();
					docH = Math.max($row.outerHeight(), stableHeight) + ( hCont * dataSpeed );
					if ( hCont < docH ) {
						var res = docH - hCont * 3,
							times = 2 * Math.round((res/hCont+1) / 2);
					}
					for ( var i = 0; i < times; i++ ) {
						var $cloneCont = $cont.clone(),
							$cloneCont2 = $cont.clone(),
							trans = ( (i+2) ) * 100;
						$wrap.append($cloneCont.addClass('cont-appended').css({'transform':'translateY('+ trans +'%)'}));
						$wrap.append($cloneCont2.addClass('cont-appended').css({'transform':'translateY(-'+ trans +'%)'}));
						$cloneCont.find('a[data-lbox]').each(function(){
							var dataLbox = $(this).attr('data-lbox');
							$(this).attr('data-lbox', dataLbox + '_' + i);
						});
						$cloneCont.find('.wp-video-shortcode').each(function(){
							var thisID = $(this).attr('id');
							$(this).attr('id', thisID + '_' + i);
						});
						$cloneCont2.find('a[data-lbox]').each(function(){
							var dataLbox = $(this).attr('data-lbox');
							$(this).attr('data-lbox', dataLbox + '_2' + i);
						});
						$cloneCont2.find('.wp-video-shortcode').each(function(){
							var thisID = $(this).attr('id');
							$(this).attr('id', thisID + '__' + i);
						});
						if ( $('.lbox-trigger-item', $cloneCont).length ) {
							UNCODE.lightgallery($cloneCont);
							UNCODE.lightgallery($cloneCont2);
						}
					}
                }
			} else {
				wCont = $cont.outerWidth();
				if ( (wCont) < UNCODE.wwidth*2 ) {
					var res = UNCODE.wwidth*2 - (wCont),
						times = 2 * Math.round((res/wCont+1) / 2);
				}
				for ( var i = 0; i < times; i++ ) {
					var $cloneCont = $cont.clone(),
						$cloneCont2 = $cont.clone(),
						trans = ( (i+2) ) * 100;
					$wrap.append($cloneCont.addClass('cont-appended').css({'transform':'translateX('+ trans +'%)'}));
					$wrap.append($cloneCont2.addClass('cont-appended').css({'transform':'translateX(-'+ trans +'%)'}));
					$cloneCont.find('a[data-lbox]').each(function(){
						var dataLbox = $(this).attr('data-lbox');
						$(this).attr('data-lbox', dataLbox + '_' + i);
					});
					$cloneCont.find('[id]').each(function(){
						var thisID = $(this).attr('id');
						$(this).attr('id', thisID + '_' + i);
					});
					$cloneCont2.find('a[data-lbox]').each(function(){
						var dataLbox = $(this).attr('data-lbox');
						$(this).attr('data-lbox', dataLbox + '_2' + i);
					});
					$cloneCont2.find('[id]').each(function(){
						var thisID = $(this).attr('id');
						$(this).attr('id', thisID + '__' + i);
					});
                    if ( $('.lbox-trigger-item', $cloneCont).length ) {
                        UNCODE.lightgallery($cloneCont);
                        UNCODE.lightgallery($cloneCont2);
                    }
                }
			}
		};
		if ( clone ) {
			checkLinearGridSize();
			$(window).on('resize.linearGrid', function(){
				checkLinearGridSize();
			});
		}

		var continuousLinearMarquee = function(_xStrt){
			if ( !$wrap.is(':visible') )  {
				return;
			}
			var ease = 'none';
			wCont = $cont.outerWidth();
			hCont = $cont.outerHeight();

			var xStrt = typeof _xStrt === 'undefined' ?  0 : _xStrt,
				xEnd = vertical ? hCont : wCont,
				direction = $wrap.attr('data-animation').indexOf('opposite') > 0 ? -1 : 1,
				speed = (xEnd + xStrt) / (dataSpeed*dataSpeed*dataSpeed) / 5*dataSpeed,
				speedSlow = (xEnd + xStrt) / 45,
				freezed = freezedDesktop && UNCODE.wwidth >= UNCODE.mediaQuery || freezedMobile && UNCODE.wwidth < UNCODE.mediaQuery;

			marqueeTL = new TimelineMax({paused:true, reversed:true});

			if ( isInViewport && !isHover && !freezed ) {
				marqueeTL.play();

				if ( $wrap.attr('data-hover') === 'yes' || $wrap.attr('data-hover') === 'pause' ) {
					var $column = $wrap.closest('.wpb_column'),
						$col_link = $('.col-link', $column),
						$hover_sel = $wrap;

					if ( $col_link.length ) {
						$hover_sel = $wrap.add($column);
					}

					$hover_sel.on('mouseover', function(){
						if ( $wrap.attr('data-hover') === 'yes' ) {
							//speed = ( 10 - dataSpeed ) * 5;
							ease = 'power2.out';
							marqueeTL.duration( speedSlow );
						} else {
							marqueeTL.pause();
						}
						isHover = true;
					}).on('mouseout', function(){
						if ( $wrap.attr('data-hover') === 'yes' ) {
							speed = (xEnd + xStrt) / (dataSpeed*dataSpeed*dataSpeed) / 5*dataSpeed;
							ease = 'power2.in';
							marqueeTL.duration( speed );
						} else {
							marqueeTL.play();
						}
						isHover = false;
					});
				}

			}
	
			gsap.killTweensOf($wrap);
			if ( vertical ) {
				marqueeTL.fromTo( $wrap, {
					y: xStrt * direction
				},
				{
					duration: speed,
					y: xEnd * direction * -1,
					onComplete: function(){
						continuousLinearMarquee();
					},
					ease: ease,
					paused: freezed
				});
			} else {
				marqueeTL.fromTo( $wrap, {
					x: xStrt * direction
				},
				{
					duration: speed,
					x: xEnd * direction * -1,
					onComplete: function(){
						continuousLinearMarquee();
					},
					ease: ease,
					paused: freezed
				});
			}
		};

		var dragLinearContinuous = function(){
			if ( !$wrap.is(':visible') )  {
				return;
			}
			var matrix, _x, _y,
				dragAction = false;
			Draggable.create($wrap[0], {
				type: vertical ? "y" : "x",
				bounds: document.getElementById("container"),
				inertia: false,
				onPress: function (e) {
				},
				onRelease: function (e) {
					if ( dragAction === true ) {
						matrix = $wrap.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
						_x = matrix[12] || matrix[4];
						_y = matrix[13] || matrix[5];
						if ( vertical ) {
							continuousLinearMarquee(_y * -1);
						} else {
							continuousLinearMarquee(_x * -1);
						}
						$wrap.removeClass('linear-dragging');
					}
				},
				onDrag: function (e) {
					dragAction = true;
					$wrap.addClass('linear-dragging');
				},
				onDragEnd: function (e) {
					matrix = $wrap.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					_x = matrix[12] || matrix[4];
					_y = matrix[13] || matrix[5];
					wCont = $cont.outerWidth();
					hCont = $cont.outerHeight();
					if ( vertical ) {
						if ( Math.abs(_y) > hCont ) {
							if ( _y < 0 ) {
								_y = hCont + parseFloat( _y );
							} else {
								_y = parseFloat( _y ) - hCont;
							}
						}
						continuousLinearMarquee(_y * -1);
					} else {
						if ( Math.abs(_x) > wCont ) {
							if ( _x < 0 ) {
								_x = wCont + parseFloat( _x );
							} else {
								_x = parseFloat( _x ) - wCont;
							}
						}
						continuousLinearMarquee(_x * -1);
					}
					$wrap.removeClass('linear-dragging');
					dragAction = false;
				},
			});
		};

		var runScrollLinear = function(){
			var freezed = freezedDesktop && UNCODE.wwidth >= UNCODE.mediaQuery || freezedMobile && UNCODE.wwidth < UNCODE.mediaQuery;
			if ( !$wrap.is(':visible') || freezed )  {
				return;
			}
			var direction = $wrap.attr('data-animation').indexOf('opposite') > 0 ? -1 : 1,
				dataMove = dataX >= 0 ? 1 + dataX : -1 * ( 5 / (dataX - 0.5) * 0.25);
			
			var linearGridScroll = function(){
				if ( isInViewport ) {
					var bound = _row.getBoundingClientRect();

					var bound_top = bound.top,
						gsap_calc = parseFloat( ( ( stableHeight * 0.35 - bound_top ) * dataMove ) * 0.5 * direction );

					if ( vertical ) {
						$wrap.css({ 'transform': 'translateY(' + gsap_calc * -1 + 'px) translateZ(0px)'})
					} else {
						$wrap.css({ 'transform': 'translateX(' + gsap_calc * -1 + 'px) translateZ(0px)'})
					}
					if ( 'IntersectionObserver' in window && ! UNCODE.isMobile ) {
						requestAnimationFrame(linearGridScroll);
					}
				}
				if ( ! ( 'IntersectionObserver' in window && ! UNCODE.isMobile ) ) {
					window.addEventListener("scroll", linearGridScroll);
				}
			};

			$(window).on( 'load wwResize', function(e) {
				stableHeight = UNCODE.wheight;
				linearGridScroll();
			});
			if ( 'IntersectionObserver' in window && ! UNCODE.isMobile ) {
				requestAnimationFrame(linearGridScroll);
			}
		};
		
		var dragLinear = function(){
			if ( !$wrap.is(':visible') )  {
				return;
			}
			var matrix, _x, _y;
			Draggable.create($dragger[0], {
				type: vertical ? "y" : "x",
				bounds: document.getElementById("container"),
				inertia: false,
				onPress: function (e) {
				},
				onRelease: function (e) {
				},
				onDrag: function (e) {
					$wrap.addClass('linear-dragging');
				},
				onDragEnd: function (e) {
					matrix = $dragger.css('transform').replace(/[^0-9\-.,]/g, '').split(',');
					_x = matrix[12] || matrix[4];
					_y = matrix[13] || matrix[5];
					wCont = $cont.outerWidth();
					hCont = $cont.outerHeight();
					if ( vertical ) {
						if ( Math.abs(_y) > hCont ) {
							if ( _y < 0 ) {
								_y = hCont + parseFloat( _y );
							} else {
								_y = parseFloat( _y ) - hCont;
							}
							gsap.to( $dragger[0], {
								duration: 0,
								y: _y,
							});
						}
					} else {
						if ( Math.abs(_x) > wCont ) {
							if ( _x < 0 ) {
								_x = wCont + parseFloat( _x );
							} else {
								_x = parseFloat( _x ) - wCont;
							}
							gsap.to( $dragger[0], {
								duration: 0,
								x: _x,
							});
						}
					}
					$wrap.removeClass('linear-dragging');
				},
			});
		};

		if ( ! $('body').hasClass('compose-mode') ) {
			if ( $wrap.attr('data-animation') === 'marquee' ||  $wrap.attr('data-animation') === 'marquee-opposite' ) {
				continuousLinearMarquee();
				$(window).on( 'wwResize', function(e) {
					continuousLinearMarquee();
				});	
				if ( $wrap.attr('data-draggable') === 'yes' ) {
					dragLinearContinuous();
				}
			}

			if ( $wrap.attr('data-animation') === 'marquee-scroll' ||  $wrap.attr('data-animation') === 'marquee-scroll-opposite' ) {
				runScrollLinear();
				if ( $wrap.attr('data-draggable') === 'yes' ) {
					dragLinear();
				}
			}

			if( 'IntersectionObserver' in window && ! UNCODE.isMobile ) {
				var observer = new IntersectionObserver(function(entries) {
						
					entries.forEach(function(entry){
						if ( entry.isIntersecting ) {
							isInViewport = true;
							if ( !init ) {
								init = true;
								continuousLinearMarquee();
							} else {
								if ( typeof marqueeTL !== 'undefined' ) {
									marqueeTL.play();
								}
							}
							if ( $wrap.attr('data-animation') === 'marquee-scroll' ||  $wrap.attr('data-animation') === 'marquee-scroll-opposite' ) {
								requestAnimFrame(runScrollLinear);
							}
						} else {
							isInViewport = false;
							if ( typeof marqueeTL !== 'undefined' ) {
								marqueeTL.pause();
							}
						}
					});
				}, { 
					root: document,
				});

				observer.observe(_row);

			} else {

				var checkVisible = function( el, off ) {
					if (typeof jQuery === "function" && el instanceof jQuery) {
						el = el[0];
					}
			
					off = typeof off=='undefined' ? 50 : off;
			
					var rect = el.getBoundingClientRect();
			
					return (
						(
							( rect.top >= 0 && (rect.top + off) <= (window.innerHeight || document.documentElement.clientHeight) ) ||
							( rect.bottom >= off && (rect.bottom) <= (window.innerHeight || document.documentElement.clientHeight) ) ||
							( rect.top <= 0 && (rect.bottom) >= (window.innerHeight || document.documentElement.clientHeight) )
						)
					);
				};
				
				var checkVisibility = function(){

					if ( checkVisible($row) ) {
						isInViewport = true;
						if ( typeof marqueeTL !== 'undefined' ) {
							marqueeTL.play();
						}
					} else {
						isInViewport = false;
						if ( typeof marqueeTL !== 'undefined' ) {
							marqueeTL.pause();
						}
					}
				}

				window.addEventListener("scroll", checkVisibility);
				checkVisibility();

			}
		}
	});
};

})(jQuery);
