/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */

var bot = require('../lib/bot').bot;

var client = new bot({
	server: 'en.wikipedia.org',
 	path: '/w',
	debug: false
});

client.whoami(function(userData) {
	console.log(JSON.stringify(userData, null, '\t'));
});
