/* global vc, YoastSEO, _, jQuery */
(function ( $ ) {
	'use strict';
	'use strict';
	var relevantData = {};
	var contentModification = _.memoize( function ( data ) {
		data = _.reduce( relevantData, function ( memo, value, key ) {
			if ( value.html ) {
				memo = memo.replace( ']' + value.text + '[', value.html );
			}
			if ( value.image && value.param ) {
				var i, imagesString = '', attachment;
				for ( i = 0; value.image.length > i; i ++ ) {
					attachment = window.wp.media.model.Attachment.get( value.image[ i ] );
					if ( attachment.get( 'url' ) ) {
						imagesString += '<img src=\'' + attachment.get( 'url' ) + '\' alt=\'' + (attachment.get( 'alt' ) || attachment.get( 'caption' ) || attachment.get( 'title' )) + '\'>';
					}
				}
				memo += imagesString;
			}
			return memo;
		}, data );

		return data;
	} );

	// Add relevant data to headings
	vc.events.on( 'shortcodes:vc_custom_heading', function ( model, event ) {
		var params, tagSearch;
		params = model.get( 'params' );
		params = _.extend( {}, vc.getDefaults( model.get( 'shortcode' ) ), params );

		if ( 'destroy' === event ) {
			delete relevantData[ model.get( 'id' ) ];
		} else if ( params.content ) {
			var heading_semantic = params.heading_semantic === '' ? 'h2' : params.heading_semantic,
				headings = ['h1','h2','h3','h4','h5','h6'];
			if ( headings.indexOf(heading_semantic) > 0 ) {
				relevantData[ model.get( 'id' ) ] = {
					html: '<' + heading_semantic + '>' + params.content + '</' + heading_semantic + '>',
					text: params.content
				};
			}
		}
	} );

	$( document ).ready( function () {
		if ( window.wp && wp.hooks && wp.hooks.addFilter ) {
			wp.hooks.addFilter( 'rank_math_content', 'wpbRankMath', contentModification );
		}
	} );
})( window.jQuery );
