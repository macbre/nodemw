// @ts-check
/**
 * Example script getting contributions done by Pyrabot
 */
'use strict';

const Bot = require( '..' );
const client = new Bot( {
	server: 'poznan.wikia.com'
} );

client.getUserContribs( {
	user: 'Pyrabot'
}, function ( err, data ) {
	if ( err ) {
		console.error( err );
	} else {
		const contrib = data[ 0 ];
		console.log( `${contrib.user} made an edit to ${contrib.title} on ${contrib.timestamp} (${contrib.comment}).` );
	}
} );
