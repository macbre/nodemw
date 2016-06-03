/**
 * Example script getting MW version
 */

const bot = require('..'),
	wikia = new bot({
		server: 'wikia.com',
		path: '',
		debug: true
	}),
	wikipedia = new bot({
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	});

/**
 * info:    Wikipedia: MediaWiki 1.27.0-wmf.19 -> 1.27.0
 * info:    Wikia: MediaWiki 1.19.24 -> 1.19.24
*/
wikia.getMediaWikiVersion(function(err, version) {
	wikia.log('Wikia:', version);
});

wikipedia.getMediaWikiVersion(function(err, version) {
	wikipedia.log('Wikipedia:', version);
});

