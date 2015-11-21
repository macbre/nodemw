#!/usr/bin/env node
/**
 * Example script that parser given wikitext
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		debug: true
	});

var wikitext = [
	'== Foo ==',
	'123 456',
	'* abc',
	'* {{SITENAME}}'
].join('\n');

client.parse(wikitext, 'Foo', function(err, html, images) {
	if (err) {
		console.error(err);
		return;
	}

	client.log('HTML', html);
	client.log('Images', images);
});
