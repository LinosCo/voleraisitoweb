!function($) {
	$('.uncode-inner-tabs').each(function(){
		var $tabs = $(this),
			$lis = $('li', $tabs),
			$active = $('li.active', $tabs),
			activeTab = $active.attr('data-tab'),
			$parent = $tabs.parents('.vc_edit-form-tab').eq(0);

		activeTab = $active.attr('data-tab'),
		activeJSON = JSON.parse(activeTab);

		$parent.find('.advanced-color-wrapper').hide();

		var showHideParams = function(activeJSON, start){
			$('.vc_shortcode-param', $parent).each(function(){
				var $shortcode_param = $(this),
					param_settings = $shortcode_param.attr('data-param_settings'),
					paramJSON = JSON.parse(param_settings),
					arrVal;

				if ( typeof paramJSON.tab != 'undefined' && typeof paramJSON.tab.element != 'undefined' && paramJSON.tab.element == activeJSON.param  ) {
					arrVal = paramJSON.tab.value;
		            arrVal.indexOf(activeJSON.tab)
		            if ( arrVal.indexOf(activeJSON.tab) < 0 ) {
		            	if ( start ) {
		            		if ($shortcode_param.hasClass('advanced-colorpicker-container')) {
		            			$shortcode_param.closest('.advanced-color-wrapper').hide();
		            		} else {
				            	$shortcode_param.hide();
				            }
			            } else {
			            	if ($shortcode_param.hasClass('advanced-colorpicker-container')) {
			            		$shortcode_param.closest('.advanced-color-wrapper').fadeOut(150);
			            	} else {
				            	$shortcode_param.fadeOut(150);
				            }
			            }
		            } else {
		            	if ( start ) {
		            		if ($shortcode_param.hasClass('advanced-colorpicker-container')) {
		            			$shortcode_param.closest('.advanced-color-wrapper').show();

		            		} else {
				            	$shortcode_param.show();
				            }
			            } else {
			            	setTimeout(function(){
			            		if ($shortcode_param.hasClass('advanced-colorpicker-container')) {
			            			$shortcode_param.closest('.advanced-color-wrapper').fadeIn(150);
			            		} else {
					            	$shortcode_param.fadeIn(150);
					            }
			            	}, 150)
			            }
		            }

				}

			});
		}

		showHideParams(activeJSON, true);

		$lis.on('click', function(e){
			e.preventDefault();
			$lis.removeClass('active');
			var $li = $(this).addClass('active'),
				dataTab = $li.attr('data-tab'),
				tabJSON = JSON.parse(dataTab);

			showHideParams(tabJSON, false);
		});
	});
}(window.jQuery);
