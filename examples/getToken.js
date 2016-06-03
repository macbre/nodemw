/**
 * Example script getting the edit token
 */

const bot = require('..'),
	wikia = new bot({
		server: 'nordycka.wikia.com',
		path: '',
		debug: true
	}),
	wikipedia = new bot({
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	});

wikia.getToken('Main_page', 'edit', function(err, token) {
	if (err) wikia.log(err);
	wikia.log('Wikia:', token);
});

wikipedia.getToken('Main_page', 'edit', function(err, token) {
	if (err) wikipedia.log(err);
	wikipedia.log('Wikipedia:', token);
});
