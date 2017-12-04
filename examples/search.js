/**
 * Example script getting MW version
 */

const Bot = require( '..' ),
	wikipedia = new Bot( {
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	} );

wikipedia.search( 'Tórshavn', ( err, results ) => {
	wikipedia.log( 'Search results:', results );
} );
