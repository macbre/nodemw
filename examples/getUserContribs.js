/**
 * Example script getting contributions done by Pyrabot
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: 'poznan.wikia.com'
	} );

client.getUserContribs( {
	user: 'Pyrabot'
}, function ( err, data ) {
	if ( err ) {
		console.error( err );
	} else {
		console.log( data );
	}
} );
