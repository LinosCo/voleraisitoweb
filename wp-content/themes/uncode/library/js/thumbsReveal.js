(function($) {
	"use strict";

	UNCODE.thumbsReveal = function() {
    var recalc = false,
    revealThumbs = function( $el ){
        if ( typeof $el === 'undefined' || $el === null || !$el.length ) {
            $el = $('body');
        }
        $('.grid-wrapper, .custom-grid-container, .single-wrapper, .owl-carousel-wrapper, .linear-wrapper', $el).has('.tmb-mask').each(function(){
            var $container = $(this),
                $stickys = $('.tmb-mask:not(.tmb-mask-init)', $container),
                isContainer = false;

            if ( !$('body').hasClass('compose-mode') || typeof window.parent.vc === 'undefined' ) {
                $stickys.each(function(){
                    var $sticky = $(this).addClass('tmb-mask-init'),
                        $rellax = $sticky.closest('.parallax-el'),
                        $inside = $('.t-inside', $sticky),
                        $media = $('img, video, .fluid-object', $sticky).attr('loading', ''),
                        val = parseFloat( $inside.attr('data-scroll-val') );

                    if ( $rellax.length ) {
                        recalc = true;
                    }

                    val = (isNaN(val) || val == null || val == 0 || typeof val === 'undefined') ? 5 : val;
                    
                    if ( $sticky.hasClass('tmb-mask-scroll') ) {

                        var zoom = ($sticky.hasClass('tmb-mask-scroll-zoom') || $sticky.hasClass('tmb-mask-scroll-both'))
                        ? val*0.05 : 0;
                        var parax = ($sticky.hasClass('tmb-mask-scroll-parallax') || $sticky.hasClass('tmb-mask-scroll-both'))
                            ? val*4 : 0;
                        var extra = ($sticky.hasClass('tmb-mask-scroll-parallax') || $sticky.hasClass('tmb-mask-scroll-both')) ? parax*0.01 : 0;

                        var tl = gsap.timeline({
                            scrollTrigger: {
                                trigger: $sticky,
                                scrub: true,
                            }
                        });

                        tl.fromTo($media, {
                            yPercent: -(parax),
                            scale: 1 + zoom + extra,
                        }, {
                            yPercent: parax,
                            scale: 1 + extra,
                            ease: "none",
                        });

                        if ( recalc ) {
                            $(window).on('uncode-thumbsreveal-refresh', function(){
                                if ( tl !== null && tl !== 'undefined' && tl.scrollTrigger !== null ) {
                                    tl.scrollTrigger.refresh();
                                }
                            });
                        }
                    }
                });
            }

            if ( $container.has('.tmb-mask-reveal') ) {
                var $markTrigger = ".tmb-mask-reveal .t-entry-visual",
                staggerTime = 0.1;

                $('.t-inside', $container).each(function(){
                    var checkEasing = $(this).attr('data-easing');
                    if (checkEasing === '' || checkEasing == null || typeof checkEasing === 'undefined') {
                        gsap.registerPlugin(CustomEase);
                        return false;
                    }
                });

                if ( $container.hasClass('cssgrid-system') && !$container.hasClass('cssgrid-animate-sequential') ) {
                    $markTrigger = $container;
                    isContainer = true;
                    staggerTime = 0;
                }

                ScrollTrigger.batch( $markTrigger, {
                    start: function( el ){
                        /*if ( el.trigger.offsetHeight < (window.innerHeight/2) ) {
                            return "bottom bottom";
                        } else {*/
                            return  "top 96%";
                        //}
                    },
                    onEnter: function(batch){
                        var $inside = $(batch).closest('.t-inside');

                        if ( isContainer ) {
                            var $inside = $(batch).find('.t-inside').first();
                        }

                        var delay = parseFloat( $inside.attr('data-delay') ),
                            speed = parseFloat( $inside.attr('data-speed') ),
                            easing = $inside.attr('data-easing'),
                            bgDelay = parseFloat( $inside.attr('data-bg-delay') );

                        delay = (isNaN(delay) || delay == null || typeof delay === 'undefined') ? 0 : delay/1000;
                        speed = (isNaN(speed) || speed == null || typeof speed === 'undefined') ? 0.4 : speed/1000;
                        easing = (easing === '' || easing == null || typeof easing === 'undefined') ? CustomEase.create("custom", "0.76, 0, 0.24, 1") : easing;
                        bgDelay = (isNaN(bgDelay) || bgDelay == null || typeof bgDelay === 'undefined') ? '' : bgDelay;

                        if ( $(batch).closest('.tmb-has-hex').length && bgDelay !== '' ) {
                            gsap.to($('.t-entry-visual-tc', batch), speed, {
                                clipPath: 'inset(0% 0% 0% 0%)',
                                stagger: staggerTime,
                                delay: delay,
                                ease: easing,
                            });
                            gsap.to($('.t-entry-visual-cont, .uncode-single-media-wrapper', batch), speed, {
                                clipPath: 'inset(0% 0% 0% 0%)',
                                stagger: staggerTime,
                                scale: 1,
                                delay: delay + (speed*bgDelay),
                                ease: easing,
                            });
                        } else {
                            gsap.to($('.t-entry-visual-cont, .uncode-single-media-wrapper', batch), speed, {
                                clipPath: 'inset(0% 0% 0% 0%)',
                                stagger: staggerTime,
                                scale: 1,
                                delay: delay,
                                ease: easing,
                            });
                        }
                                                    
                    }
                });
            }

        });

        function raf(time) {
            requestAnimationFrame(raf)
            $(window).trigger('uncode-thumbsreveal-refresh');
        }

        if ( recalc ) {
            requestAnimationFrame(raf)
        }

    };
    $(window).on( 'load more-items-loaded', function(){
        revealThumbs();
    });

    $(document).on('uncode-ajax-filtered', function(){
        revealThumbs();
    });

    if ( $('body').hasClass('compose-mode') && typeof window.parent.vc !== 'undefined' ) {
        window.parent.vc.events.on( 'shortcodeView:updated shortcodeView:ready', function(model){
            var $el = model.view.$el,
                shortcode = model.attributes.shortcode;

            if ( $el.is('.custom-grid-container') ) {
                $el = $el.parent();
            }

            if (shortcode === 'uncode_index' || shortcode === 'vc_gallery' || shortcode === 'vc_single_image') {
                revealThumbs($el);
            }
        });
    }

};


})(jQuery);
