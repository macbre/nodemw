/**
 * Helper functions
 */
'use strict';

module.exports = {
	parseVideoUrl( url ) {
		function getIdFromUrl( url, re ) {
			let matches = url.match( re );
			return ( matches && matches[ 1 ] ) || null;
		}

		let id;

		// https://www.youtube.com/watch?v=24X9FpeSASY
		// http://stackoverflow.com/questions/5830387/how-to-find-all-youtube-video-ids-in-a-string-using-a-regex/5831191#5831191
		if ( url.indexOf( 'youtube.com/' ) > -1 ) {
			id = getIdFromUrl( url, /\/watch\?v=([A-Z0-9_-]+)/i );

			return id ? [ 'youtube', id ] : null;
		}

		// https://vimeo.com/27986705
		if ( url.indexOf( 'vimeo.com/' ) > -1 ) {
			id = getIdFromUrl( url, /\/([0-9]+)/ );

			return id ? [ 'vimeo', id ] : null;
		}

		return null;
	}
};
