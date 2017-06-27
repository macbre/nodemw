#!/usr/bin/env node
const bot = require('..'),
	client = new bot({
		protocol: 'https',
		server: 'www.mediawiki.org',
		path: '/w',
		debug: true
	});

client.append('Project:Sandbox', '\n\nnodemw test --~~~~', 'nodemw test edit', function(err, res) {
	if (err) {
		console.error(err);
	}
	else {
		client.log('Sandbox edited');
		client.log(res);
	}
});

