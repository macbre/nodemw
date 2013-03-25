/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: !true
	});

client.getPagesInCategory('Polskie_ofiary_represji_stalinowskich', function(pages) {
	console.log(JSON.stringify(pages, null, '\t'));

	pages.forEach(function(page) {
		client.getArticle(page.title, function(content) {
			if (content.indexOf('Poznan') > -1) {
				console.log('* [[wikipedia:pl:' + page.title.replace(/ /g, '_') + '|' + page.title + ']]');
			}
		});
	});
});
