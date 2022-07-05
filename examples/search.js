// @ts-check
/**
 * Example script getting MW version
 */
'use strict';

const Bot = require( '..' );

const wikipedia = new Bot( {
	server: 'pl.wikipedia.org',
	path: '/w'
	// debug: true
} );

wikipedia.search( 'Tórshavn', ( err, results ) => {
	if ( err ) {
		console.error( err );
		return;
	}

	console.log( `Got ${results.length} results:` );

	results.slice( 0, 25 ).forEach( ( res ) => {
		console.log( `* ${res.title}` );
	} );

	// wikipedia.log( 'Search results:', results.slice(0, 5) );

	// const { dumpObjectTypes }  = require( '../lib/utils');
	// dumpObjectTypes('SearchResult', results[0]);
} );
