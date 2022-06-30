#!/usr/bin/env node
// @ts-check
'use strict';

// This example makes an edit tp https://test.wikipedia.org/wiki/Test
const Bot = require( '..' );
const client = new Bot( {
	protocol: 'https',
	server: 'test.wikipedia.org',
	path: '/w',
	debug: true
} );

const text = 'nodemw test';

client.append( 'Test', '\n\n' + text + ' --~~~~', 'nodemw test edit', function ( err, res ) {
	if ( err ) {
		client.log( 'Sandbox edit failed: ' + JSON.stringify( err ) );
	} else {
		client.log( `Edited "${res.title}" as revision #${res.newrevid} on ${res.newtimestamp}.` );

		// console.log( Object.keys(res).map( key => `${key}: ${typeof res[key]};`).join('\n') );
	}
} );
