/**
 * Example script on how to create account
 *
 * @see https://www.mediawiki.org/wiki/API:Account_creation
 */

const Bot = require( '..' ),
	client = new Bot( 'config.js' );

// create account
client.createAccount( 'user123', 'password123', function ( err, userData ) {
	if ( err ) {
		console.log( err );
		return;
	}

	console.log( JSON.stringify( userData, null, '\t' ) );
} );
