/**
 * Example script getting the list of categories
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: '8bit.wikia.com',
		path: '',
		debug: true
	});

client.getCategories(function(err, cats) {
	console.log('All categories:');
	console.log(JSON.stringify(cats));
});

client.getCategories('K', function(err, cats) {
	console.log('All categories starting with K:');
	console.log(JSON.stringify(cats));
});
