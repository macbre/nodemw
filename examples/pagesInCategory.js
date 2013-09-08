/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		debug: true
	});

client.getPagesInCategory('Bosons', function(pages) {
	client.log('Pages in category');
	client.logData(pages);

	pages.forEach(function(page) {
		client.getArticle(page.title, function(content) {
			client.log('%s: %s', page.title, content.substr(0, 75).replace(/\n/g, ' '));
		});
	});
});
