// @ts-check
/**
 * Example script getting user information on a specific user
 *
 * @see https://www.mediawiki.org/wiki/API:Users
 */
'use strict';

const Bot = require( '..' );
const client = new Bot( __dirname + '/config.wikipedia.json' );

// get current account information
client.whois( 'Jimbo Wales', function ( err, userData ) {
	if ( err ) {
		console.log( err );
		return;
	}

	console.log(
		`${userData.name} made ${userData.editcount} edits since registering on ${userData.registration}.`
	);

	// console.log( JSON.stringify( userData, null, '\t' ) );
} );
