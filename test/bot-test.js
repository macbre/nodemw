var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

vows.describe('bot class').addBatch({
	'supports config object': {
		topic: function() {
			return new bot({
				server: 'pl.wikipedia.org',
				path: '/w'
			});
		},
		'server is properly passed': function(client) {
			assert.equal(client.api.server, 'pl.wikipedia.org');
		},
		'path is properly passed': function(client) {
			assert.equal(client.api.path, '/w');
		}
	},
	'supports config file': {
		topic: function() {
			return new bot(__dirname + '/config.json');
		},
		'server is properly passed': function(client) {
			assert.equal(client.api.server, 'pl.wikipedia.org');
		},
		'path is properly passed': function(client) {
			assert.equal(client.api.path, '/w');
		}
	}
}).export(module);
