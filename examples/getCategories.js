/**
 * Example script getting the list of categories
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: '8bit.wikia.com',
		path: '',
		debug: true
	} );

client.getArticleCategories( 'Commodore 64', function ( err, categories ) {
	if ( err ) {
		console.error( err );
		return;
	}
	console.log( '"Commodore 64" categories:' );
	console.log( categories );
} );

client.getCategories( function ( err, cats ) {
	console.log( 'All categories:' );
	console.log( JSON.stringify( cats ) );
} );

client.getCategories( 'K', function ( err, cats ) {
	console.log( 'All categories starting with K:' );
	console.log( JSON.stringify( cats ) );
} );
