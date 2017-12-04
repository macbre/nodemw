/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: 'en.wikipedia.org',
		path: '/w'
	} );

client.getPagesInCategory( 'Sports_cars', function ( err, pages ) {
	client.log( 'Pages in category: %d', pages.length );
	client.logData( pages );

	pages.forEach( function ( page ) {
		client.getArticle( page.title, function ( err, content ) {
			console.log( '%s: %s', page.title, content.substr( 0, 75 ).replace( /\n/g, ' ' ) );
		} );
	} );
} );
