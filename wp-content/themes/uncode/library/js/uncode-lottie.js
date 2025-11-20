(function($) {
	"use strict";

	UNCODE.lottie = function() {
    if ( SiteParameters.is_frontend_editor ) {
        var $lottie_wraps = $('div.uncode-lottie-wrap');
        $lottie_wraps.each(function(){
            var $lottie_wrap = $(this),
                $div_player = $('div.uncode-lottie-player', $lottie_wrap),
                $player_clone = $div_player.clone(),
                player_id = $div_player.attr('data-id'),
                $lottie_players = $('lottie-player', $lottie_wrap).remove();
            if ( $div_player.attr('data-init') !== true && $player_clone.length ) {
                if ( $('#'+player_id).length ) {
                    player_id += '_' + Math.floor(Math.random() * 10000000000000000);
                }
                $player_clone.attr('id', player_id);
                $player_clone = $player_clone[0].outerHTML.replace("<div", "<lottie-player").replace("</div", "</lottie-player");
                $div_player.after($player_clone);
                $div_player.attr('data-init',true);
            }
        });
    }
    var $players = $('.uncode-lottie-wrap lottie-player');
    $players.each(function(){
        var player = this,
            this_id = $(player).attr('id'),
            _player = document.getElementById(this_id),
            trigger = $(player).attr('data-trigger'),
            pFrames = $(player).attr('data-frames').split(','),
            srcPlayer = $(player).attr('src');

        _player.load(srcPlayer);

        _player.addEventListener("ready", function() {

            var $_shadow = _player.shadowRoot;
            $($_shadow).find('.error').remove();

            var tFrames = _player.getLottie().totalFrames / 100,
                pFrame_from = Math.round(tFrames * pFrames[0]),
                pFrame_to = Math.round( tFrames * pFrames[1] ) - 1,
                loop = $(player).attr('loop'),
                mode,
                actions;

            if ( typeof trigger !== 'undefined' && typeof LottieInteractivity !== 'undefined' ) {
                if ( trigger === 'scroll' ) {
                    mode = 'scroll';
                    actions = [
                        {
                            visibility:[0, 1.0],
                            type: "seek",
                            frames: [pFrame_from, pFrame_to],
                        }
                    ];
                } else if ( trigger === 'viewport') {
                    mode = 'scroll';
                    actions = [
                        {
                            visibility: [0.20, 1.0],
                            frames: [pFrame_from, pFrame_to],
                            type: loop ? "loop" : "play"
                        }
                    ];
                } else if ( trigger === 'hover') {
                    $(player).on('mouseenter', function(){
                        _player.play();
                    }).on('mouseleave', function(){
                        _player.pause();
                    });
                    if ( pFrame_from > 0 && pFrame_from < 99 ) {
                        _player.seek(pFrame_from);
                        _player.addEventListener("frame", function(){
                            if ( _player.getLottie().currentFrame >= pFrame_to ) {
                                _player.seek(pFrame_from);
                            }
                        });
                    }
                }
                LottieInteractivity.create({
                    player: '#' + this_id,
                    mode: mode,
                    actions: actions
                });
            } else {
                if ( pFrame_from > 0 && pFrame_from < 99 ) {
                    _player.seek(pFrame_from);
                    _player.addEventListener("frame", function(){
                        if ( _player.getLottie().currentFrame >= pFrame_to ) {
                            _player.seek(pFrame_from);
                        }
                    });
                }
            }
        });

        $(window).on('unlottie-destroy', function(){
            _player.destroy();
        });
    });
};


})(jQuery);
