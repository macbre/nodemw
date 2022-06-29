// @ts-check
/**
 * Example script getting MW version
 */
'use strict';

const Bot = require( '..' );

const wikia = new Bot( {
	server: 'wikia.com',
	path: '',
	debug: true
} );

const wikipedia = new Bot( {
	server: 'pl.wikipedia.org',
	path: '/w',
	debug: true
} );

/**
 * info:    Wikipedia: MediaWiki 1.27.0-wmf.19 -> 1.27.0
 * info:    Wikia: MediaWiki 1.19.24 -> 1.19.24
 */
wikia.getMediaWikiVersion( function ( _, version ) {
	wikia.log( 'Wikia:', version );
} );

wikipedia.getMediaWikiVersion( function ( _, version ) {
	wikipedia.log( 'Wikipedia:', version );
} );
