/**
 * Example script for file uploads
 *
 * @see http://www.mediawiki.org/wiki/API:Upload
 */

const bot = require('..'),
	client = new bot('config.js');

const url = 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png',
	fileName = 'UploadTest.png',
	summary = 'Testing upload ąęź...';

client.logIn(function(err) {
	console.log(`Uploading ${url}...`);

	client.uploadByUrl(fileName, url, summary, function(err, res) {
		console.log('Upload completed!');

		client.edit(`File:${fileName}`, 'File description goes here ąęź\n\n[[Category:Foo]]', 'Adding a file description', function(err, res) {
			console.log('File description edited');
		});
	});
});
