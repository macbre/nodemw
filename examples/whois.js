/**
 * Example script getting user information on a specific user
 *
 * @see https://www.mediawiki.org/wiki/API:Users
 */
'use strict';

var bot = require('..'),
	client = new bot('config.js');

	// get current account information
	client.whois("Jimbo Wales", function(err, userData) {
		if (err) {
			console.log(err);
			return;
		}

		console.log(JSON.stringify(userData, null, '\t'));
	});
