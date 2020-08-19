/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */
'use strict';

const Bot = require( '..' ),
	client = new Bot( 'config.js' );

client.logIn( function ( err ) {
	if ( err ) {
		console.log( err );
		return;
	}

	// get current account information
	client.whoami( function ( _err, userData ) {
		if ( _err ) {
			console.log( _err );
			return;
		}

		console.log( JSON.stringify( userData, null, '\t' ) );
	} );
} );
