/**
 * Example script getting contributions done by Pyrabot
 */
'use strict';

var bot = require('../lib/bot'),
	client = new bot({
		server: 'poznan.wikia.com'
	});

client.getUserContribs({
	user: 'Pyrabot'
}, function(data, next) {
	console.log(data);
});
