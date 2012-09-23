/**
 * Example script for file uploads
 *
 * @see http://www.mediawiki.org/wiki/API:Upload
 */

var bot = require('../lib/bot').bot,
	client = new bot('config.js');

var url = 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png',
	fileName = 'UploadTest.png',
	summary = 'Testing upload...';

client.logIn(function() {
	console.log('Uploading ' + url + '...');

	client.uploadByUrl(fileName, url, summary, function(res) {
		console.log('Upload completed!');
	});
});
