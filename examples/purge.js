#!/usr/bin/env node
/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: 'poznan.wikia.com',
		path: '',
		debug: true
	});

client.purge(['Pomnik_Bamberki', 'Ratusz'], function(err, data) {
	if (err) client.log(err);
	console.log(data);
});

// purge all articles in a given category (note a "Category:" prefix)
client.purge('Category:Ratusz', function(err, data) {
	if (err) client.log(err);
	console.log(data);
});

// purge all articles in a given category the old way (before MW 1.21)
client.getPagesInCategory('Ratusz', function(err, pages) {
	if (err) return;

	var pageIds = pages.
		filter(function(page) {
			return page.ns === 0; // NS_MAIN
		}).
		map(function(page) {
			return page.pageid;
		});

	client.purge(pageIds, function(err, data) {
		if (err) client.log(err);
		console.log(data);
	});
});

