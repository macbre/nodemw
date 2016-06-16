/**
 * Example script of Semantic MediaWiki integration
 *
 * @see http://semantic-mediawiki.org/wiki/Ask_API
 */

const bot = require('..'),
	client = new bot({
		server: 'semantic-mediawiki.org',
		path: '/w'
	}),
	params = {
		action: 'ask',
		query: '[[Modification date::+]]|?Modification date|sort=Modification date|order=desc'
	};

client.api.call(params, function(err, info, next, data) {
	console.log(data && data.query && data.query.results);
});
