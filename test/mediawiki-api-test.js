var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

var client = new bot({
		server: 'en.wikipedia.org',
		path: '/w'
	}),
	ARTICLE = 'Albert Einstein';

/**
 * this.callback wrapper for asynchronous topics
 * wovs assumes the first callback argument to be an error
 *
 * @see https://github.com/cloudhead/vows/issues/187
 */
function callback() {
	var scope = this;
	return function() {
		var args = Array.prototype.slice.apply(arguments);
		args.unshift(null);
		scope.callback.apply(scope, args);
	};
}

vows.describe('Mediawiki API').addBatch({
	'getArticle()': {
		topic: function() {
			client.getArticle(ARTICLE, callback.apply(this));
		},
		'string is passed to callback': function(e, res) {
			assert.isString(res);
		},
		'valid content is passed to callback': function(e, res) {
			assert.isTrue(res.indexOf("'''Albert Einstein'''") !== false);
		}
	}
}).export(module);
