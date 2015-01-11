/**
 * Example script getting contributions done by Pyrabot
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: 'poznan.wikia.com'
	});

client.getUserContribs({
	user: 'Pyrabot'
}, function(err, data) {
	if (err) {
		console.error(err);
	}
	else {
		console.log(data);
	}
});
