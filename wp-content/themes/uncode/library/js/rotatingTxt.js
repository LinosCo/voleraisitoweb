(function($) {
	"use strict";

	UNCODE.rotatingTxt = function($ctxt) {

	if ( $('body').hasClass('compose-mode') ) {
		return;
	}

	$ctxt = typeof $ctxt == 'undefined' ? $('body') : $ctxt;
	var setCTA;

	$('.el-text', $ctxt).has('.uncode-rotating-text-start[data-text]').each(function(){
		var $heading = $(this),
			// debug = 0,
			cycle = 0,
			$trgt,
			$toMove,
			$highl,
			$col = $heading.closest('.uncont'),
			txt,
			arrTxt,
			textFadeIn, textFadeOut,
			removeWraps;

		var defineObjs = function() {
			$('.uncode-rotating-text-start[data-text]', $heading).each(function(){
				var $rtx = $(this),
					fx = $rtx.attr('data-fx'),
					wait = $rtx.attr('data-wait'),
					$prev = $(this).prev().addClass('prev-rotating-start'),
					splitToMove = [],
					splitArray = [],
					lineArray = [],
					lineIndex = 0,
					lineStart = true,
					lineEnd = false,
					startSplit = false,
					$line_wrap = $rtx.closest('.heading-line-wrap'),
					same_line = true,
					$splits = $rtx.closest('.el-text').find('.split-word').removeClass('empty-span-hidden'),
					indexRtx = $splits.index($rtx);

				fx = typeof fx === 'undefined' ? '' : fx;
				wait = typeof wait === 'undefined' ? '' : wait;

				$splits.each(function(key, val){
					var $split = $(this),
						$new_line_wrap = $split.closest('.heading-line-wrap');

					if ( $split.text() == '' && !$split.hasClass('uncode-rotating-text-end') && !$split.hasClass('uncode-rotating-text-start') && !splitArray.length ) {
						splitArray.push( $split );
					}

					if ( $split.hasClass('uncode-rotating-text-end') && startSplit === true ) {
						startSplit = false;
					}

					if ( ! $split.hasClass('uncode-rotating-text-end') && startSplit === true ) {
						splitArray.push( $split );

						if ( same_line && ( !$new_line_wrap.length || $line_wrap[0] == $new_line_wrap[0] ) ) {
							same_line = true;
						} else {
							same_line = false;
						}
					}

					if ( key == indexRtx ) {
						if ( /\S/.test($split.text()) ) {
							startSplit = true;
							$line_wrap = $split.closest('.heading-line-wrap');
							splitArray.push( $split );
						} else {
							indexRtx++;
						}
					}

					$line_wrap = $new_line_wrap;
				});

				$toMove = $($.map(splitToMove, function(el){return el.get();}));
				$trgt = $($.map(splitArray, function(el){return el.get();}));

				if ( same_line ) {
					$trgt.wrapAll('<span class="uncode-rotating-wrap" data-fx="' + fx + '" data-wait="' + wait + '" />');
					$trgt.wrapAll('<span class="uncode-rotating-wrap-inner" />');
				}

				if ( $prev.hasClass('split-word-empty') && $rtx.is(':last-child') ) {
					$prev.addClass('empty-span-hidden');
				}

				$highl = $('.heading-text-highlight-inner', $trgt);

				$rtx.attr('data-animated', 'true');
				if ( cycle == 0 ) {
					$( document.body ).trigger('defer-highlights');
					cycle++;
					defineObjs();
					return;
				}
				cycle++;

				txt = $rtx.attr('data-text');
				arrTxt = txt.split("|");

				textFadeOut($trgt);

			});
		};

		removeWraps = function(){

			// if ( debug == 1 ) return;
			var $wraps = $heading[0].querySelectorAll('.uncode-rotating-wrap, .uncode-rotating-wrap-inner');
			for (var wrap_k = 0; wrap_k < $wraps.length; wrap_k++) {


				var $temp_highl = $($wraps[wrap_k]).find('> .heading-text-highlight-inner').clone(),
					$splitFlow = $($wraps[wrap_k]).find('.split-word-flow');

				$($wraps[wrap_k]).find('> .heading-text-highlight-inner').remove();

				$splitFlow.each(function(){
					$(this).append($temp_highl);
				});

				var $line_wrap = $wraps[wrap_k];
				var $parent_wrap = $line_wrap.parentNode;
				if ( $parent_wrap !== null ) {
					while ( $line_wrap.firstChild ) {
						$parent_wrap.insertBefore($line_wrap.firstChild, $line_wrap);
					}
					$parent_wrap.removeChild($line_wrap);
				}
			}
			// debug++;
			defineObjs();
		};

		var loop = 0;
		textFadeIn = function($trgt){
			var word = arrTxt[loop].split(" "),
				worsSpan = '',
				$wrap = $trgt.closest('.uncode-rotating-wrap'),
				$wrap_inner = $trgt.closest('.uncode-rotating-wrap-inner'),
				fx = $trgt.closest('.uncode-rotating-wrap').attr('data-fx');

			for (var w = 0; w < word.length; w++) {
				var highl;
				if ( $highl.length ) {
					highl = $highl[0].outerHTML;
				} else {
					highl = '';
				}

				if ( w > 0 ) {
					worsSpan += '<span class="split-word"><span class="split-word-flow"><span class="split-word-inner split-empty-inner">&nbsp;</span>' + highl + '</span></span>';
				}
				var charachters = word[w].split('');
				worsSpan += '<span class="split-word"><span class="split-word-flow"><span class="split-word-inner">';
				if ( ! SiteParameters.uncode_has_ligatures ) {
					for (var c = 0; c < charachters.length; c++) {
						worsSpan += '<span class="split-char">' + charachters[c] + '</span>';
					}
				} else {
					worsSpan += word[w];
				}
				worsSpan += '</span>' + highl + '</span></span>';
			}

			if ( $wrap.length && $wrap_inner.length ) {
				var words_w = $wrap_inner.outerWidth();
				$wrap.css({
					width: words_w
				});

				$highl = $('.heading-text-highlight-inner', $wrap);
				$highl.prependTo($wrap);

				$wrap_inner.css({
					opacity: 0
				});

				$wrap_inner.html(worsSpan);
				$('.heading-text-highlight-inner', $wrap_inner).remove();
				words_w = $wrap_inner.innerWidth();

				var duration = 0.45;

				$heading.removeClass('auto-width');
				if ( words_w > $col.width() ) {
					$heading.addClass('auto-width');
					words_w = 'auto';
					duration = 0;
				}

				$wrap.css({
					'width': words_w,
					'transition': 'width ' + (duration*1000) + 'ms cubic-bezier(0.16, 1, 0.3, 1)',
				});

				var $word_inner = $('.split-word-inner', $wrap_inner),
					$extra_wrap_inner = $wrap_inner.closest('.uncode-rotating-wrap-inner');

				var $target_fx = fx === 'zoom' ? $wrap_inner : $word_inner;

				if ( !$target_fx.length ) {
					return;
				}

				gsap.killTweensOf($target_fx);

				if ( fx !== 'zoom' ) {
					gsap.fromTo( $target_fx, {
						y: fx === 'opacity' ? '0%' : '-10%'
					},{
						delay: duration,
						duration: 0.25,
						y: '0%',
						ease: Circ.easeOut,
					});

					if ( !$wrap_inner.length ) {
						return;
					}

					gsap.fromTo( $wrap_inner, {
						opacity: 0,
					},{
						delay: duration,
						duration: 0.25,
						opacity: 1,
						ease: Circ.easeOut,
						onComplete: function(){
							$('> .heading-text-highlight-inner', $wrap).remove();
							$wrap_inner.html(worsSpan);
							removeWraps();
						}
					})

				} else {
					gsap.fromTo( $target_fx, {
						transformOrigin: '50%',
						opacity: 0,
						scale: 0.875,
					},{
						opacity: 1,
						delay: duration,
						duration: 0.25,
						scale: 1,
						ease: Circ.easeOut,
						onComplete: function(){
							$('> .heading-text-highlight-inner', $wrap).remove();
							$wrap_inner.html(worsSpan);
							removeWraps();
						}
					});
				}

			} else {

				if ( !$wrap_inner.length ) {
					return;
				}

				gsap.to( $wrap_inner, {
					duration: 0.4,
					opacity: 0,
					ease: Power1.easeOut,
					onComplete: function(){
						$wrap_inner.html(worsSpan);
						words_w = $wrap_inner.innerWidth();

						gsap.to( $wrap_inner, {
							duration: 0.2,
							opacity: 1,
							ease: Power1.easeOut,
							onComplete: function(){
								$('> .heading-text-highlight-inner', $wrap).remove();
								$wrap_inner.html(worsSpan);
								removeWraps();
							}
						})
					}
				});
			}

			if ( loop < arrTxt.length-1 ) {
				loop++;
			} else {
				loop = 0;
			}

		};

		textFadeOut = function($trgt){
			var $word_inner = $('.split-word-inner', $trgt),
				$wrap = $trgt.closest('.uncode-rotating-wrap'),
				$wrap_inner = $trgt.closest('.uncode-rotating-wrap-inner'),
				fx = $trgt.closest('.uncode-rotating-wrap').attr('data-fx'),
				wait = $trgt.closest('.uncode-rotating-wrap').attr('data-wait');

			wait = typeof wait === 'undefined' || wait === '' ? 3 : parseFloat(wait)/1000;

			var gsap_param = {
					delay: wait,
					duration: 0.25,
					y: fx === '' ? '10%' : '0%',
					opacity: 0,
					ease: Circ.easeOut,
					onStart: function(){
						if ( $wrap.length && $wrap_inner.length && fx === 'zoom' ) {
							$highl = $('.heading-text-highlight-inner', $wrap);
							$highl.prependTo($wrap);
						}
					},
					onComplete: textFadeIn,
					onCompleteParams: [$trgt]
				};

			var $target_fx = fx === 'zoom' ? $wrap_inner : $word_inner;

			if ( fx === '' ) {
				gsap_param.y = '10%';
			} else if ( fx === 'zoom' ) {
				gsap_param.scale = '1.045';
			}

			if ( !$target_fx.length ) {
				return;
			}

			if ( $heading.data('waypoint') !== true ) {
				var textInView = new Waypoint.Inview({
					context: UNCODE.isUnmodalOpen ? document.getElementById('unmodal-content') : window,
					element: $heading[0],
					enter: function(direction) {
						$heading.data('waypoint',true);
						gsap.fromTo( $target_fx, {
							transformOrigin: '50%'
						}, gsap_param );
					}
				});
			} else {
				gsap.fromTo( $target_fx, {
					transformOrigin: '50%'
				}, gsap_param );
			}
		};

		if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
			window.parent.vc.events.on( 'shortcodeView:updated shortcodeView:ready', function(model){
				var $el = model.view.$el,
					shortcode = model.attributes.shortcode;

				UNCODE.rotatingTxt($el);
			});
		} else {
			if ( $heading.hasClass('animate_inner_when_almost_visible') ) {
				$heading.on('already-animated', function(){
					removeWraps();
					window.addEventListener('removeOldLines', function(){
						clearRequestTimeout(setCTA);
						setCTA = requestTimeout( removeWraps, 150 );
					});
				});
			} else {
				$(window).on('load', function(){
					removeWraps();
					window.addEventListener('removeOldLines', function(){
						clearRequestTimeout(setCTA);
						setCTA = requestTimeout( removeWraps, 150 );
					});
				});
			}
		}
	});

};


})(jQuery);
