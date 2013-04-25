var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

var client = new bot({
		server: 'en.wikipedia.org',
		path: '/w'
	});

vows.describe('URL fetching').addBatch({
	'client,fetchUrl()': {
		topic: function() {
			var self = this;
			client.fetchUrl('http://example.com', function(res) {
				self.callback(null, res);
			});
		},
		'page content is passed to callback': function(e, res) {
			assert.isString(res);
			assert.isTrue(res.indexOf('<h1>Example Domain</h1>') !== false);
		}
	},
	'binary data': {
		topic: function() {
			var self = this;
			client.api.fetchUrl('http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png', 'binary').then(function(res) {
				self.callback(null, res);
			});
		},
		'buffer with raw data is passed to callback': function(e, res) {
			assert.isTrue(res instanceof Buffer);
			assert.equal(19670, res.length);
		}
	}
}).export(module);
