/**
 * Example script getting the list of all pages
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: 'poznan.wikia.com',
		path: '',
		debug: true
	} );

client.getAllPages( function ( err, pages ) {
	console.log( 'All pages: %d', pages.length );
	console.log( JSON.stringify( pages.slice( 0, 50 ) ) );

	// get all revisions of a single article
	const pageId = parseInt( pages[ 0 ].pageid, 10 );

	client.getArticleRevisions( pageId, function ( err, revisions ) {
		console.log( JSON.stringify( revisions ) );
	} );
} );
