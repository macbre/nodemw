/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */

var bot = require('../lib/bot'),
	client = new bot('config.js');

client.logIn(function() {
	// get current account information
	client.whoami(function(userData) {
		console.log(JSON.stringify(userData, null, '\t'));
	});
});
