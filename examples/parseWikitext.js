#!/usr/bin/env node
/**
 * Example script that parser given wikitext
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: 'en.wikipedia.org',
		path: '/w',
		debug: true
	} ),
	wikitext = [
		'== Foo ==',
		'123 456',
		'* abc',
		'* {{SITENAME}}'
	].join( '\n' );

client.parse( wikitext, 'Foo', function ( err, html, images ) {
	if ( err ) {
		console.error( err );
		return;
	}

	client.log( 'HTML', html );
	client.log( 'Images', images );
} );
