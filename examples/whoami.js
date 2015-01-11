/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */
'use strict';

var bot = require('..'),
	client = new bot('config.js');

client.logIn(function(err) {
	if (err) {
		console.log(err);
		return;
	}

	// get current account information
	client.whoami(function(err, userData) {
		if (err) {
			console.log(err);
			return;
		}

		console.log(JSON.stringify(userData, null, '\t'));
	});
});
