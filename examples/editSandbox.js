#!/usr/bin/env node
const Bot = require( '..' ),
	client = new Bot( {
		protocol: 'https',
		server: 'www.mediawiki.org',
		path: '/w',
		debug: true
	} ),
	// text = 'nodemw test';
	text = 'nodemw test http://clicky.pk/foo'; // https://github.com/macbre/nodemw/issues/131

client.append( 'Project:Sandbox', '\n\n' + text + ' --~~~~', 'nodemw test edit', function ( err, res ) {
	if ( err ) {
		client.log( 'Sandbox edit failed: ' + JSON.stringify( err ) );
	} else {
		client.log( 'Sandbox edited' );
		client.log( res );
	}
} );
