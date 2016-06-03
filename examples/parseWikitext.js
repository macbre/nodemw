#!/usr/bin/env node
/**
 * Example script that parser given wikitext
 */

const bot = require('..'),
	client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		debug: true
	});

const wikitext = [
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
