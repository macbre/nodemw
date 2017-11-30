/**
 * Example script getting wiki information
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: '8bit.wikia.com',
		path: '',
		debug: true
	} );

client.getSiteInfo( [ 'general', 'namespaces' ], function ( err, info ) {
	client.log( 'General:', info.general );
	client.log( 'Namespaces:', info.namespaces );
} );

client.getSiteStats( function ( err, stats ) {
	client.log( 'Statistics:', stats );
} );

// Wikia-specific stuff
client.wikia.getWikiVariables( function ( err, vars ) {
	client.log( 'Site name:', vars.siteName );
	client.log( 'Theme:', vars.theme );
} );

client.wikia.getUsers( [ 2, 1, 16 ], function ( err, users ) {
	console.log( users );
} );

client.wikia.getUser( 119245, function ( err, userInfo ) {
	client.log( 'My Wikia avatar:', userInfo.avatar );
} );
