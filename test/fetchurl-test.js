var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

var client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		silent: true
	});

vows.describe('URL fetching').addBatch({
	'client,fetchUrl()': {
		topic: function() {
			var self = this;
			client.fetchUrl('http://example.com', function(res) {
				self.callback(null, res);
			});
		},
		'should pass page content to a callback': function(e, res) {
			assert.isString(res);
			assert.isTrue(res.indexOf('<h1>Example Domain</h1>') > -1);
		}
	},
	'client,fetchUrl() when successful': {
		topic: function() {
			var self = this;
			client.fetchUrl('http://example.com').then(function(res) {
				self.callback(null, res);
			});
		},
		'should resolve a promise': function(e, res) {
			assert.isString(res);
		},
		'should pass page content': function(e, res) {
			assert.isTrue(res.indexOf('<h1>Example Domain</h1>') > -1);
		}
	},
	'client,fetchUrl() when failed': {
		topic: function() {
			var self = this;
			client.fetchUrl('foo://bar').fail(function(res) {
				self.callback(null, res);
			});
		},
		'should reject a promise': function(e, res) {
			assert.isObject(res.value);
		},
		'should pass error details': function(e, res) {
			assert.isTrue(res.value.err.indexOf('fetchUrl failed with') > -1);
		}
	},
	'binary data': {
		topic: function() {
			var self = this;
			client.api.fetchUrl('http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png', 'binary').then(function(res) {
				self.callback(null, res);
			});
		},
		'should be passed to a callback in raw form': function(e, res) {
			assert.isTrue(res instanceof Buffer);
			assert.equal(19670, res.length);
		}
	}
}).export(module);
