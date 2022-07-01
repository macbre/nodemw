// @ts-check
/**
 * Example script for file uploads
 *
 * @see http://www.mediawiki.org/wiki/API:Upload
 */
'use strict';

const Bot = require( '..' );

const client = new Bot( __dirname + '/config.wikipedia.json' );
const url = 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png';
const fileName = 'UploadTest.png';
const summary = 'Testing upload ąęź...';

client.logIn( ( _, res ) => {
	console.log( `Uploading ${url}...` );
	console.log( res );

	client.uploadByUrl( fileName, url, summary, ( __, uploadRes ) => {
		console.log( 'Upload completed!' );
		console.log( uploadRes );

		client.edit( `File:${fileName}`, 'File description goes here ąęź\n\n[[Category:Foo]]', 'Adding a file description', ( ___, editRes ) => {
			console.log( 'File description edited' );
			console.log( editRes );
		} );
	} );
} );
