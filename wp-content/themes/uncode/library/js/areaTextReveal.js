(function($) {
	"use strict";

	UNCODE.areaTextReveal = function() {
    if ( ! $('.text-reveal, .scroll-trigger-el').length ) {
        return;
    }
	if ( ! SiteParameters.is_frontend_editor ) {
        var iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream,
            android = /Android/.test(navigator.userAgent) && !window.MSStream,
            prevW = Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth ),
            prevH = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight ),
            firstObs = true,
            isMobileUsing = false;

        var observer = new ResizeObserver(function(){
            var newW = Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth ),
                newH = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                    document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight ),
                set = false;
            if ( prevW !== newW && ( iPhone || (android && Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 750) ) ) {
                set = true;
                prevW = newW;
            } else if ( prevH !== newH && !iPhone && !(android && Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 750) ) {
                set = true;
                prevH = newH;
            }
            if ( set || firstObs ) {
                window.dispatchEvent(new CustomEvent('uncode-sticky-trigger-observe'));
                firstObs = false;
            }
        }).observe(document.body);

        if ( iPhone || (android && Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0) < 750) ) {
            window.scrollTo = function() {
                return;
            };
            isMobileUsing = true;

            $('html, body').css({
                'overscroll-behavior': 'none'
            });
        }

        var setTriggerObserve;

        ScrollTrigger.observe({
            trigger: 'body',
            type: "touch,pointer", // comma-delimited list of what to listen for ("wheel,touch,scroll,pointer")
            onUp: function() { ScrollTrigger.update(); },
        });
    }

    var textReveal = function(){

        if ( SiteParameters.is_frontend_editor ) {
            return;
        }

        var setTxtReveal,
            txtTrggrStart = false;

        function headingReveal($sel){
            txtTrggrStart = true;
            $('.text-reveal', $sel).each(function(val, key){
                var $txtReveal = $(this).attr('data-init-reveal', true),
                    $trigger = $txtReveal,
                    $rowParent = $txtReveal.closest('.row-container[data-parent]'),
                    hReveal = $txtReveal.outerHeight(),
                    $pin = $txtReveal.closest('.scroll-trigger-el[data-anim-sticky="yes"], .scroll-trigger-el[data-sticky-trigger="inner-rows"]'),
                    $sticky = $txtReveal.closest('.sticky-element'),
                    dataReveal = $('[data-reveal]', $txtReveal).attr('data-reveal'),
                    dataRevealOpacity = $('[data-reveal]', $txtReveal).attr('data-reveal-opacity'),
                    dataTop = parseFloat($('[data-reveal-top]', $txtReveal).attr('data-reveal-top')),
                    $lines = $('.heading-line-wrap', $txtReveal),
                    $words = $('.split-word-inner', $txtReveal),
                    $chars = $('.split-char', $txtReveal),
                    $elToReveal = $words;

                if ( $pin.length ) {
                    return;
                } else if ( $sticky.length ) {
                    hReveal = $sticky.parent().outerHeight() - (window.innerHeight - window.innerHeight/100*dataTop);
                    $trigger = $sticky.parent();
                }

                if ( dataReveal === 'chars' ) {
                    $elToReveal = $chars;
                } else if ( dataReveal === 'lines' ) {
                    $elToReveal = $lines;
                }
                
                var tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: $trigger,
                        start: "top +=" + (window.innerHeight/100*dataTop) + "px",
                        end: "+=" + hReveal + "px",
                        id: "txt_reveal_" + key,
                        scrub: true,
                    }
                });
                gsap.set(
                    $elToReveal, {
                        opacity: dataRevealOpacity,
                    }
                )
                tl.fromTo($elToReveal, {
                    opacity: dataRevealOpacity,
                    duration: 1,
                }, {
                    opacity: 1,
                    stagger: 0.05,
                    duration: 1,

                });
                $(window).on('uncode.tl-refresh', function(){
                    if ( tl !== null && tl !== 'undefined' && tl.scrollTrigger !== null ) {
                        tl.scrollTrigger.refresh();
                    }
                });

                $rowParent.one( 'uncodeWordLines', function(){
                    clearRequestTimeout(setTxtReveal);
                    setTxtReveal = requestTimeout( function(){
                        gsap.set($elToReveal, {clearProps: true});
                        tl.kill(true);
                        if ( typeof ScrollTrigger.getById('txt_reveal_' + key) !== 'undefined' ) {
                            ScrollTrigger.getById("txt_reveal_" + key).kill(true);
                        }
                        headingReveal($sel)
                    }, 100);
                });

            });
        };

        window.addEventListener("load", function (e) {
            if (!txtTrggrStart) {
                headingReveal($("body"));
                $(window).trigger("resize");
            }
        });

        $('.row-container[data-parent]').each(function(){
            if (!txtTrggrStart) {
                var $this = $(this);
                $this.on('uncodeWordLines', function(){
                    headingReveal($this);
                });
            }
        });

        $(window).on('uncode-sticky-trigger-observe', function(e){
            clearRequestTimeout(setTriggerObserve);
            setTriggerObserve = requestTimeout( function(){
                $(window).trigger('uncode.tl-refresh');
            }, 2000 );
        });
    
    };
    textReveal();

    var areaReveal = function(){
        if ( SiteParameters.is_frontend_editor ) {
            return;
        }

        $('.scroll-trigger-el').each(function(){
            var $scrollTrgrEl = $(this),
                $row = $('> .row', $scrollTrgrEl),
                $row_in = $('> .row-inner', $row),
                cardL = $('.vc_row.row-internal:not(.row-no-card)', $scrollTrgrEl).length,
                stickyCards = cardL && $scrollTrgrEl.attr('data-sticky-trigger') === 'inner-rows',
                animLast = $scrollTrgrEl.attr('data-no-anim-last') !== 'yes',
                stickyOpts = stickyCards ? $scrollTrgrEl.attr('data-anim-inner-rows-options') : false,
                $animateTrgrEl = $scrollTrgrEl,
                noMobile = $scrollTrgrEl.attr('data-sticky-no-mobile') === 'yes',
                noTablet = $scrollTrgrEl.attr('data-sticky-no-tablet'),
                els = $scrollTrgrEl.attr('data-anim-els'),
                sticky = $scrollTrgrEl.attr('data-anim-sticky'),
                noSpace = $scrollTrgrEl.attr('data-anim-no-space'),
                state = $scrollTrgrEl.attr('data-anim-state'),
                target = $scrollTrgrEl.attr('data-anim-target'),
                origin = $scrollTrgrEl.attr('data-anim-origin'),
                mask = $scrollTrgrEl.attr('data-anim-mask'),
                _scale = $scrollTrgrEl.attr('data-anim-scale'),
                stepScale = stickyCards && $scrollTrgrEl.attr('data-anim-scale-step') === 'yes',
                opacity = $scrollTrgrEl.attr('data-anim-opacity'),
                radius = $scrollTrgrEl.attr('data-anim-radius'),
                radius_unit = $scrollTrgrEl.attr('data-anim-radius-unit'),
                clip_path = $scrollTrgrEl.attr('data-clip-path'),
                animation_x = $scrollTrgrEl.attr('data-anim-x'),
                animation_x_alt = $scrollTrgrEl.attr('data-anim-x-alt'),
                animation_y = $scrollTrgrEl.attr('data-anim-y'),
                blur = $scrollTrgrEl.attr('data-anim-blur'),
                perspective = $scrollTrgrEl.attr('data-anim-perspective'),			
                rotate = $scrollTrgrEl.attr('data-anim-rotate'),	
                rotate_alt = $scrollTrgrEl.attr('data-anim-rotate-alt'),
                topBottom = $scrollTrgrEl.attr('data-anim-start'),	
                offTop = $scrollTrgrEl.attr('data-anim-top'),
                offBottom = $scrollTrgrEl.attr('data-anim-bottom'),
                safe = $scrollTrgrEl.attr('data-anim-safe') === 'yes' ? (window.innerHeight/100*(100-offTop)) : 0,
                animation_rows_start = $scrollTrgrEl.attr('data-anim-start-point'),
                easeOut = $scrollTrgrEl.attr('data-anim-ease'),
                offSetCard = $scrollTrgrEl.attr('data-anim-rows-offset'),
                stickyLast = $scrollTrgrEl.attr('data-anim-sticky-last') === 'yes' && stickyCards,
                $lastEl = $('.vc_row.row-internal:not(.row-no-card)', $scrollTrgrEl).last(),
                setTxtReveal,
                txtTrggrStart = false,
                alreadyareaAnimateScrollTl = false;
    
            _scale = _scale === '' ? 0 : parseFloat( _scale );
            perspective = perspective === '' ? 0.001 : parseFloat(perspective) + 0.001;	
            offTop = offTop === '' ? 0 : parseFloat( offTop );
            offBottom = offBottom === '' ? 0 : parseFloat( offBottom );
            offSetCard = offSetCard === '' ? 0 : parseFloat( offSetCard );

            function areaAnimateScrollTl($el, id, last) {
                alreadyareaAnimateScrollTl = true;

                var pTop = parseFloat( $row.css('padding-top') ),
                    innerGap = pTop + offSetCard * id,
                    scale = _scale;

                if ( isMobileUsing ) {
                    innerGap = 0;
                }

                if ( stepScale ) {
                    if ( _scale < 100 ) {
                        scale = _scale + ( ( 100 - _scale ) / (cardL) * (id) );
                    }
                }

                if ( els === 'content' ) {
                    $animateTrgrEl = $('> .row', $scrollTrgrEl);
                } else if ( els === 'bg' ) {
                    $animateTrgrEl = $('> .row-background, > .uncode-multi-bgs', $scrollTrgrEl);
                } else {
                    $animateTrgrEl = $el;
                }

                if ( rotate_alt === 'yes') {
                    rotate *= -1;
                    perspective *= -1;
                }
                
                if ( animation_x_alt === 'yes') {
                    animation_x *= -1;
                }

                var $parentDiv = $el.closest('div[data-sticky]');

                var start_topBottom = topBottom === 'bottom' ? "bottom bottom-=" + (window.innerHeight/100*offTop) + "px" : "top top+=" + (window.innerHeight/100*offTop) + "px";

                var scrllTrggr = {
                    trigger: $parentDiv,
                    end: function(){
                        return ("+=" + (offBottom === 0 ? $scrollTrgrEl.outerHeight() - safe : (window.innerHeight/100*offBottom)))
                    },
                    start: stickyCards ? "top top+=" + (innerGap) : start_topBottom,
                    pin: sticky === 'yes' || stickyCards ? true : false,
                    pinSpacing: ((noSpace !== "yes" && !stickyCards) || (state !== 'end' && last)) && !(stickyCards && state !== 'end' && !animLast && id === 0),
                    scrub: true,
                    id: 'sticky_' + id,
                    anticipatePin: 1,
                    invalidateOnRefresh: true,
                    // markers: {
                    //     indent: 150 * id
                    // },
                    onToggle: function(){
                        $scrollTrgrEl.attr('data-revealed', true);
                    },
                };

                if ( !stickyLast && state === 'end' ) {
                    last = false;
                } 

                if ( stickyCards ) {
                    if ( state !== 'end' ) {
                        if ( animation_rows_start === 'center' ) {
                            scrllTrggr.start = "center center";
                            scrllTrggr.end = "bottom bottom-=" + (window.innerHeight);
                        } else if ( animation_rows_start === 'bottom' ) {
                            if ( stickyOpts !== 'no' ) {
                                scrllTrggr.start = "bottom bottom";
                                scrllTrggr.end = "bottom bottom";
                            }
                        } else {
                            scrllTrggr.end = "bottom bottom-=" + (window.innerHeight/2);
                        } 
                        if ( stickyOpts === 'no' ) {
                            scrllTrggr.endTrigger = $el;
                            scrllTrggr.end = "+=100%";
                        } else {
                            scrllTrggr.endTrigger = $row;
                        }
                    } else {
                        if ( animation_rows_start === 'center' ) {
                            scrllTrggr.start = "center center";
                        } else if ( animation_rows_start === 'bottom' ) {
                            scrllTrggr.start = "bottom bottom";
                        } 
                        if ( stickyOpts !== 'no' ) {
                            scrllTrggr.end = "top top+=" + (pTop + offSetCard * (cardL-1));
                            scrllTrggr.endTrigger = $lastEl;
                        } else {
                            scrllTrggr.end = "bottom bottom";
                        }
                    }
                }
                
                var tl = gsap.timeline({
                    scrollTrigger: scrllTrggr
                });

                // var mark = last ? {
                //         startColor:"blue",
                //         endColor:"orange",
                //     } : false;

                if ( !stickyCards ) {
                    var tlConds = tl;
                } else {
                    var scrllTrggrConds = {
                        trigger: $parentDiv,
                        end: function(){
                            return ("+=" + (offBottom === 0 || stickyCards ? window.innerHeight - safe : (window.innerHeight/100*offBottom)))
                        }, 
                        pin: (state === 'end' && last),
                        pinSpacing: false,
                        scrub: true,
                        id: 'card_' + id,
                        invalidateOnRefresh: true,
                        // markers: true,
                    };
                    if ( stickyCards ) {
                        if ( state !== 'end' ) {
                            if ( stickyOpts === '' ) {
                                scrllTrggrConds.end = "bottom bottom-=100%";
                                scrllTrggrConds.endTrigger = $row_in;
                            }

                            if ( animation_rows_start === 'bottom' ) {
                                if ( stickyOpts !== 'no') {
                                    scrllTrggrConds.start = "top top+=" + window.innerHeight;
                                    scrllTrggrConds.end = "bottom bottom";
                                }
                            } else if ( animation_rows_start === 'center' ) {
                                scrllTrggrConds.start =  "center center";
                            } else {
                                scrllTrggrConds.start = "top top+=" + (innerGap + 1);
                            }
                            
                        } else {
                            if ( stickyOpts === '' ) {
                                if ( animLast ) {
                                    scrllTrggrConds.end = "bottom bottom-=100%";
                                } else {
                                    scrllTrggrConds.end = "bottom bottom";
                                }
                                scrllTrggrConds.endTrigger = $lastEl;
                            }

                            if ( animation_rows_start === 'bottom' && stickyOpts !== 'no' ) {
                                if ( UNCODE.wwidth <= UNCODE.mediaQuery ) {
                                    scrllTrggrConds.start = "bottom bottom";
                                } else {
                                    scrllTrggrConds.start = "top top+=" + $el.outerHeight();
                                }
                            } else if ( animation_rows_start === 'center' ) {
                                if ( UNCODE.wwidth <= UNCODE.mediaQuery ) {
                                    scrllTrggrConds.start =  "center center";
                                } else {
                                scrllTrggrConds.start =  "top+=" + ($el.outerHeight()/2) + " top+=" + window.innerHeight/2;
                                }
                            } else {
                                if ( UNCODE.wwidth <= UNCODE.mediaQuery ) {
                                    scrllTrggrConds.start = "top top";
                                } else {
                                    scrllTrggrConds.start = "top top+=" + (innerGap + 1);
                                }
                            }

                        }

                    } else {
                        scrllTrggrConds.start =  start_topBottom;
                    }

                    var tlConds = gsap.timeline({
                        scrollTrigger: scrllTrggrConds
                    });
                }

                if ( !(stickyCards && state !== 'end' && !animLast && id === 0) ) {
                    if ( target === 'mask' ) {
                        if ( state !== 'end' ) {
                            if ( mask === 'auto' ) {
                                gsap.set(
                                    $animateTrgrEl, {
                                        clipPath: 'inset(0% ' + (( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                        opacity: parseFloat(opacity)/100,
                                        filter: 'blur(' + blur + 'px)',
                                        visibility: 'visible',
                                    }
                                )
                                tlConds.fromTo($animateTrgrEl, {
                                    clipPath: 'inset(0% ' + (( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                    opacity: parseFloat(opacity)/100,
                                    filter: 'blur(' + blur + 'px)',
                                    duration: 1,
                                }, {
                                    opacity: 1,
                                    clipPath: 'inset(0% 0px round 0' + radius_unit + ')',
                                    filter: 'blur(0px)',
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });	
                            } else {
                                tlConds.fromTo($animateTrgrEl, {
                                    opacity: parseFloat(opacity)/100,
                                    clipPath: clip_path,
                                    filter: 'blur(' + blur + 'px)',
                                    duration: 1,
                                }, {
                                    opacity: 1,
                                    clipPath: 'inset(0% 0% 0% 0% round 0' + radius_unit + ')',
                                    filter: 'blur(0px)',
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });	
                            }
                        } else {
                            if ( mask === 'auto' ) {
                                tlConds.fromTo($animateTrgrEl, {
                                    opacity: 1,
                                    clipPath: 'inset(0% 0px round 0' + radius_unit + ')',
                                    filter: 'blur(0px)',
                                    duration: 1,
                                },{
                                    opacity: parseFloat(opacity)/100,
                                    clipPath: 'inset(0% ' + (( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) )/2) + 'px round ' + radius + radius_unit + ')',
                                    filter: 'blur(' + blur + 'px)',
                                    ease: easeOut,
                                    duration: 1,
                                    //delay: 0.1
                                });	
                            } else {
                                tlConds.fromTo($animateTrgrEl, {
                                    opacity: 1,
                                    clipPath: 'inset(0% 0% 0% 0% round 0' + radius_unit + ')',
                                    filter: 'blur(0px)',
                                    duration: 1,
                                },{
                                    opacity: parseFloat(opacity)/100,
                                    clipPath: clip_path,
                                    filter: 'blur(' + blur + 'px)',
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                });	
                            }
                        }
                    } else {
                        if ( state !== 'end' ) {
                            if ( scale === 'auto' ) {
                                if ( radius ) {
                                    gsap.set(
                                        $animateTrgrEl, {
                                            scaleX: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                            scaleY: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                            x: animation_x + 'vw',
                                            y: animation_y + 'vh',
                                            filter: 'blur(' + blur + 'px)',
                                            rotation: rotate,
                                            rotationX: rotate == 0 ? perspective : 0,
                                            transformPerspective: '100vw',
                                            opacity: parseFloat(opacity)/100,
                                            transformOrigin: origin,
                                            borderRadius: radius + radius_unit,
                                            visibility: 'visible',
                                        }
                                    )
                                    tlConds.fromTo($animateTrgrEl, {
                                        scaleX: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                        scaleY: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        opacity: parseFloat(opacity)/100,
                                        borderRadius: radius + radius_unit,
                                        transformOrigin: origin,
                                        duration: 1,
                                    }, {
                                        scaleX: 1,
                                        scaleY: 1,
                                        x: 0,
                                        y: 0,
                                        filter: 'blur(0px)',
                                        rotation: 0,
                                        rotationX: 0,
                                        opacity: 1,
                                        borderRadius: 0 + radius_unit,
                                        transformOrigin: origin,
                                        duration: 1,
                                        ease: easeOut,
                                        //delay: 0.1
                                    });	
                                } else {
                                    gsap.set(
                                        $animateTrgrEl, {
                                            scaleX: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                            scaleY: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                            x: animation_x + 'vw',
                                            y: animation_y + 'vh',
                                            filter: 'blur(' + blur + 'px)',
                                            rotation: rotate,
                                            rotationX: rotate == 0 ? perspective : 0,
                                            transformPerspective: '100vw',
                                            opacity: parseFloat(opacity)/100,
                                            transformOrigin: origin,
                                            visibility: 'visible',
                                        }
                                    )
                                    tlConds.fromTo($animateTrgrEl, {
                                        scaleX: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                        scaleY: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        opacity: parseFloat(opacity)/100,
                                        transformOrigin: origin,
                                        duration: 1,
                                    }, {
                                        scaleX: 1,
                                        scaleY: 1,
                                        x: 0,
                                        y: 0,
                                        filter: 'blur(0px)',
                                        rotation: 0,
                                        rotationX: 0,
                                        opacity: 1,
                                        transformOrigin: origin,
                                        duration: 1,
                                        ease: easeOut,
                                        //delay: 0.1
                                    });	
                                }
                            } else {
                                if ( radius ) {
                                    gsap.set(
                                        $animateTrgrEl, {
                                            scaleX: parseFloat( scale ) / 100,
                                            scaleY: parseFloat( scale ) / 100,
                                            opacity: parseFloat(opacity)/100,
                                            x: animation_x + 'vw',
                                            y: animation_y + 'vh',
                                            filter: 'blur(' + blur + 'px)',
                                            rotation: rotate,
                                            rotationX: rotate == 0 ? perspective : 0,
                                            transformPerspective: '100vw',
                                            transformOrigin: origin,
                                            borderRadius: radius + radius_unit,
                                            visibility: 'visible',
                                        }
                                    )
                                    tlConds.fromTo($animateTrgrEl, {
                                        scaleX: parseFloat( scale ) / 100,
                                        scaleY: parseFloat( scale ) / 100,
                                        opacity: parseFloat(opacity)/100,
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        borderRadius: radius + radius_unit,
                                        transformOrigin: origin,
                                        duration: 1,
                                    }, {
                                        scaleX: 1,
                                        scaleY: 1,
                                        opacity: 1,
                                        x: 0,
                                        y: 0,
                                        filter: 'blur(0px)',
                                        rotation: 0,
                                        rotationX: 0,
                                        transformOrigin: origin,
                                        ease: easeOut,
                                        duration: 1,
                                        borderRadius: 0 + radius_unit,
                                        //delay: 0.1
                                    });	
                                } else {
                                    gsap.set(
                                        $animateTrgrEl, {
                                            scaleX: parseFloat( scale ) / 100,
                                            scaleY: parseFloat( scale ) / 100,
                                            opacity: parseFloat(opacity)/100,
                                            x: animation_x + 'vw',
                                            y: animation_y + 'vh',
                                            filter: 'blur(' + blur + 'px)',
                                            rotation: rotate,
                                            rotationX: rotate == 0 ? perspective : 0,
                                            transformPerspective: '100vw',
                                            transformOrigin: origin,
                                            visibility: 'visible',
                                        }
                                    )
                                    tlConds.fromTo($animateTrgrEl, {
                                        scaleX: parseFloat( scale ) / 100,
                                        scaleY: parseFloat( scale ) / 100,
                                        opacity: parseFloat(opacity)/100,
                                        x: animation_x + 'vw',
                                        y: animation_y + 'vh',
                                        filter: 'blur(' + blur + 'px)',
                                        rotation: rotate,
                                        rotationX: rotate == 0 ? perspective : 0,
                                        transformPerspective: '100vw',
                                        transformOrigin: origin,
                                        duration: 1,
                                    }, {
                                        scaleX: 1,
                                        scaleY: 1,
                                        opacity: 1,
                                        x: 0,
                                        y: 0,
                                        filter: 'blur(0px)',
                                        rotation: 0,
                                        rotationX: 0,
                                        transformOrigin: origin,
                                        duration: 1,
                                        ease: easeOut,
                                        //delay: 0.1
                                    });
                                }
                            }
                        } else {
                            if ( scale === 'auto' ) {
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    transformOrigin: origin,
                                    duration: 1,
                                }, {
                                    scaleX: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                    scaleY: 1 - ( ( UNCODE.wwidth - parseFloat(SiteParameters.uncode_limit_width) ) /UNCODE.wwidth ),
                                    opacity: parseFloat(opacity)/100,
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    transformOrigin: origin,
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                })
                            } else {
                                tlConds.fromTo($animateTrgrEl, {
                                    scaleX: 1,
                                    scaleY: 1,
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    filter: 'blur(0px)',
                                    rotation: 0,
                                    rotationX: 0,
                                    transformPerspective: '100vw',
                                    transformOrigin: origin,
                                    borderRadius: 0 + radius_unit,
                                    duration: 1,
                                }, {
                                    scaleX: parseFloat( scale ) / 100,
                                    scaleY: parseFloat( scale ) / 100,
                                    opacity: parseFloat(opacity)/100,
                                    x: animation_x + 'vw',
                                    y: animation_y + 'vh',
                                    filter: 'blur(' + blur + 'px)',
                                    rotation: rotate,
                                    rotationX: rotate == 0 ? perspective : 0,
                                    transformPerspective: '100vw',
                                    transformOrigin: origin,
                                    borderRadius: radius + radius_unit,
                                    duration: 1,
                                    ease: easeOut,
                                    //delay: 0.1
                                })
                            }
                        }
                    }
                }

                function headingReveal($el){
                    txtTrggrStart = true;
                    $('.text-reveal', $el).each(function(_key, _val){
                        var $txtReveal = $(_val),
                            dataReveal = $('[data-reveal]', $txtReveal).attr('data-reveal'),
                            dataRevealOpacity = $('[data-reveal]', $txtReveal).attr('data-reveal-opacity'),
                            $lines = $('.heading-line-wrap', $txtReveal),
                            $words = $('.split-word-inner', $txtReveal),
                            $chars = $('.split-char', $txtReveal),
                            _setTxtReveal,
                            $elToReveal = $words;

                        if ( !(sticky === 'yes' || stickyCards) ) {
                            return;
                        }
            
                        easeOut = easeOut !== 'none' ? easeOut + '.out' : easeOut;

                        if ( dataReveal === 'chars' ) {
                            $elToReveal = $chars;
                        } else if ( dataReveal === 'lines' ) {
                            $elToReveal = $lines;
                        }

                        var scrllTrggrTxt = typeof scrllTrggrConds !== 'undefined' || scrllTrggr;
                        scrllTrggrTxt.id = "txt_reveal_" + _key; 
                        scrllTrggrTxt.pin = false;

                        gsap.set($elToReveal, {opacity: dataRevealOpacity});
                        var _tl = gsap.timeline({
                            scrollTrigger: scrllTrggrTxt
                        });
                        _tl.fromTo($elToReveal, {
                            opacity: dataRevealOpacity,
                        }, {
                            opacity: 1,
                            stagger: 0.05
                        });

                        $scrollTrgrEl.one( 'uncodeWordLines', function(){
                            clearRequestTimeout(_setTxtReveal);
                            _setTxtReveal = requestTimeout( function(){
                                gsap.set($elToReveal, {clearProps: true});
                                _tl.kill(true);
                                if ( typeof ScrollTrigger.getById('txt_reveal_' + _key) !== 'undefined' ) {
                                    ScrollTrigger.getById("txt_reveal_" + _key).kill(true);
                                }
                                headingReveal($el)
                            }, 100);
                        });

                    });
                };

                if (!txtTrggrStart) {
                    headingReveal($el);
                }

                $scrollTrgrEl.one( 'uncodeWordLines', function(){
                    if (!txtTrggrStart) {
                        headingReveal($el);
                    }
                });
                
                var _height = Math.max( document.body.scrollHeight, document.body.offsetHeight, 
                    document.documentElement.clientHeight,  document.documentElement.scrollHeight,  document.documentElement.offsetHeight );
                var _width = Math.max( document.body.scrollWidth, document.body.offsetWidth, 
                    document.documentElement.clientWidth,  document.documentElement.scrollWidth,  document.documentElement.offsetWidth );
                    
                $(window).on('uncode-sticky-trigger-observe', function(e){
                    var __height = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                    var __width = Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth );
                    $('.pin-spacer, [data-sticky]', $scrollTrgrEl).css({height: false, maxHeight: false});
                    //$('.tmb, .row-inner[style*=height]', $scrollTrgrEl).removeAttr('style');
                    if ( stickyCards ) {
                        $('.tmb', $scrollTrgrEl).removeAttr('style');
                    }
                    var scrollnow = document.body.scrollTop || document.documentElement.scrollTop;
                    clearRequestTimeout(setTxtReveal);
                    setTxtReveal = requestTimeout( function(){
                        $(document).trigger('uncode-scrolltrigger-refresh');
                        if ( isMobileUsing ) {
                            if ( typeof tl !== 'undefined' ) {
                                tl.scrollTrigger.refresh();
                            }
                            if ( typeof tlConds !== 'undefined' ) {
                                tlConds.scrollTrigger.refresh();
                            }
                            $(window).trigger('scroll');
                            _width = __width;
                        } else if ( _width !== __width && ( isMobileUsing ) ) {
                            window.dispatchEvent(new CustomEvent('vc-resize'));
                            if ( typeof window.lenis !== 'undefined' && window.lenis !== null ) {
                                window.lenis.scrollTo(0, {duration: 0.01, onComplete: function(){
                                    if ( typeof tl !== 'undefined' ) {
                                        tl.scrollTrigger.refresh();
                                    }
                                    if ( typeof tlConds !== 'undefined' ) {
                                        tlConds.scrollTrigger.refresh();
                                    }
                                    window.lenis.scrollTo(scrollnow, {duration: 0.01});
                                }});
                            } else {
                                if ( typeof tl !== 'undefined' ) {
                                    tl.scrollTrigger.refresh();
                                }
                                if ( typeof tlConds !== 'undefined' ) {
                                    tlConds.scrollTrigger.refresh();
                                }
                                $(window).trigger('scroll');
                            }
                            _height = __height;
                        }
                    }, 500);
                });


                $(window).on('load ', function(e){
                    var ___height = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
                    if ( _height !== ___height ) {
                        $scrollTrgrEl.attr('data-toggled', true);
                        $(window).trigger('resize');
                        if ( typeof tl !== 'undefined' ) {
                            tl.scrollTrigger.refresh();
                        }
                        if ( typeof tlConds !== 'undefined' ) {
                            tlConds.scrollTrigger.refresh();
                        }
                        _height = ___height;
                    }

                    
                    
                    $(document).trigger('uncode-scrolltrigger-refresh');

                });

            };

            var callAreaAnimateScrollTl = function() {
                if ( stickyCards ) {
                    $('.vc_row.row-internal:not(.row-no-card)', $scrollTrgrEl).each(function(key, val){
                        if ( key+1 < cardL || animLast || state !== 'end' ) {
                            var $this = $(val),
                                last = key+1===cardL;
                            areaAnimateScrollTl($this, key, last);
                        }
                    });
                } else {
                    areaAnimateScrollTl($scrollTrgrEl, 0, false);
                }    
            };

            $(window).on('wwResize', function(){
                if ( !alreadyareaAnimateScrollTl ) {
                    if ( noMobile ) {
                        if ( noTablet && UNCODE.wwidth <= UNCODE.mediaQuery ) {
                            return;
                        } else if ( UNCODE.wwidth <= UNCODE.mediaQueryMobile ) {
                            return;
                        }
                    }
                    
                    callAreaAnimateScrollTl();
                }
            })

            if ( noMobile ) {
                if ( noTablet && UNCODE.wwidth <= UNCODE.mediaQuery ) {
                    return;
                } else if ( UNCODE.wwidth <= UNCODE.mediaQueryMobile ) {
                    return;
                }
            }

            callAreaAnimateScrollTl();

        });

    };

    areaReveal();

};


})(jQuery);
