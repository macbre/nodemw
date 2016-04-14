/**
 * Example script getting MW version
 */

const bot = require('..'),
	wikipedia = new bot({
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	});

wikipedia.search('Tórshavn', (err, results) => {
	wikipedia.log('Search results:', results);
});
