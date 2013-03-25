/**
 * Example script for file uploads
 *
 * @see http://www.mediawiki.org/wiki/API:Upload
 */

var bot = require('../lib/bot'),
	client = new bot('config.js');

var url = 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png',
	fileName = 'UploadTest.png',
	summary = 'Testing upload ąęź...';

client.logIn(function() {
	console.log('Uploading ' + url + '...');

	client.uploadByUrl(fileName, url, summary, function(res) {
		console.log('Upload completed!');

		client.edit('File:' + fileName, 'File description goes here ąęź\n\n[[Category:Foo]]', 'Adding a file description', function(res) {
			console.log('File description edited');
		});
	});
});
