/**
 * Example script getting wiki information
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: '8bit.wikia.com',
		path: '',
		debug: true
	});

client.getSiteInfo(['general', 'namespaces'], function(err, info) {
	client.log('General:',    info.general);
	client.log('Namespaces:', info.namespaces);
});

client.getSiteStats(function(err, stats) {
	client.log('Statistics:', stats);
});
