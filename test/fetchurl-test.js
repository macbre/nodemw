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
	}
}).export(module);
