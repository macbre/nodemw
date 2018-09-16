/**
 * Example script getting user information on a specific user
 *
 * @see https://www.mediawiki.org/wiki/API:Users
 */

const Bot = require( '..' ),
	client = new Bot( 'config.js' );

// get current account information
client.whois( 'Jimbo Wales', function ( err, userData ) {
	if ( err ) {
		console.log( err );
		return;
	}

	console.log( JSON.stringify( userData, null, '\t' ) );
} );
