/**
 * Example script getting the edit token
 */

const Bot = require( '..' ),
	wikia = new Bot( {
		server: 'nordycka.wikia.com',
		path: '',
		debug: true
	} ),
	wikipedia = new Bot( {
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	} );

wikia.getToken( 'Main_page', 'edit', function ( err, token ) {
	if ( err ) { wikia.log( err ); }
	wikia.log( 'Wikia:', token );
} );

wikipedia.getToken( 'Main_page', 'edit', function ( err, token ) {
	if ( err ) { wikipedia.log( err ); }
	wikipedia.log( 'Wikipedia:', token );
} );
