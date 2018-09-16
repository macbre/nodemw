#!/usr/bin/env node
/**
 * Example script getting MW version
 */

const Bot = require( '..' ),
	wikipedia = new Bot( {
		protocol: 'https',
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	} );

wikipedia.getArticleRevisions( 'Tórshavna', ( err, data ) => {
	if ( err ) {
		wikipedia.log( 'An error occured!' );
		wikipedia.log( err );
		return;
	}

	wikipedia.log( 'Article metadata:', data );
} );
