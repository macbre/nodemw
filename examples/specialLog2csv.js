#!/usr/bin/env node
/**
 * Example script generating TSV file from Special:Log entries
 *
 * @see https://pl.wikipedia.org/w/api.php?action=help&modules=query%2Blogevents
 */
const async = require( 'async' ),
	Bot = require( '..' ),
	csv = require( 'csv-string' ),
	client = new Bot( {
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	} ),
	// logType = 'thanks';
	logType = 'review/approve';

// @see https://github.com/caolan/async#whilsttest-fn-callback
var start = '';

// @see https://www.npmjs.com/package/csv-string#stringifyinput--object-separator--string--string
function writeCsvLine( data ) {
	process.stdout.write( csv.stringify( data, '\t' ) );
}

async.whilst(
	() => true, // run as long as there's more data
	function ( callback ) {
		console.error( 'Getting %s logs since %s...', logType, start );

		client.getLog( logType, start, function ( err, data, next ) {
			const len = data && data.length;

			client.log( 'Got %s log entries', len );

			if ( len > 0 ) {
				// it's our first batch of data - format CSV header
				if ( start === '' ) {
					writeCsvLine( Object.keys( data[ 0 ] ) );
				}

				// print rows
				data.forEach( writeCsvLine );
			}

			// next time get next batch
			start = next;
			callback( next ? null : 'no more data' );
		} );
	},
	function ( err ) {
		if ( err ) { throw err; }

		client.log( 'Done' );
	}
);
