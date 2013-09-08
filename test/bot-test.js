var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

vows.describe('bot class').addBatch({
	'supports config object': {
		topic: function() {
			return new bot({
				server: 'pl.wikipedia.org',
				path: '/w',
				silent: true
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
	},
	'getConfig()': {
		topic: function() {
			return new bot(__dirname + '/config.json');
		},
		'gets a correct value': function(client) {
			assert.equal(client.getConfig('server'), 'pl.wikipedia.org');
			assert.equal(client.getConfig('goo'), 123);
		},
		'gets a default value': function(client) {
			assert.isUndefined(client.getConfig('foo'));
			assert.equal(client.getConfig('foo', 'bar'), 'bar');
		}
	},
	'setConfig()': {
		topic: function() {
			return new bot(__dirname + '/config.json');
		},
		'sets a value': function(client) {
			assert.isUndefined(client.getConfig('foo'));

			client.setConfig('foo', 'bar');

			assert.equal(client.getConfig('foo'), 'bar');
			assert.equal(client.getConfig('foo', 123), 'bar');
		}
	}
}).export(module);
