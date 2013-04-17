var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

var client = new bot({
		server: 'en.wikipedia.org',
		path: '/w'
	}),
	ARTICLE = 'Albert Einstein';

vows.describe('Mediawiki API').addBatch({
	'getArticle()': {
		topic: function() {
			var self = this;
			client.getArticle(ARTICLE, function(res) {
				self.callback(null, res);
			});
		},
		'string is passed to callback': function(e, res) {
			assert.isString(res);
		},
		'valid content is passed to callback': function(e, res) {
			assert.isTrue(res.indexOf("'''Albert Einstein'''") !== false);
		}
	}
}).export(module);
