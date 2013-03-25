/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: '8bit.wikia.com',
		path: '',
		debug: false
	});

client.getCategories(function(cats) {
	console.log('All categories:');
	console.log(JSON.stringify(cats));
});

client.getCategories('K', function(cats) {
	console.log('All categories starting with K:');
	console.log(JSON.stringify(cats));
});
