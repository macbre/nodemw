/**
 * Example script of Semantic MediaWiki integration
 *
 * @see http://semantic-mediawiki.org/wiki/Ask_API
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: 'semantic-mediawiki.org',
		path: '/w'
	}),
	params = {
		action: 'ask',
		query: '[[Modification date::+]]|?Modification date|sort=Modification date|order=desc'
	};

client.api.call(params, function(info, next, data) {
	console.log(data && data.query && data.query.results);
});
