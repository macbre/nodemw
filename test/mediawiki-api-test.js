var vows = require('vows'),
	assert = require('assert'),
	bot = require('../lib/bot');

var client = new bot({
		server: 'en.wikipedia.org',
		path: '/w',
		silent: true
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
	'client,api.call()': {
		topic: function() {
			// http://en.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=namespaces&format=json
			var params = {
				action: 'query',
				meta: 'siteinfo',
				siprop: 'namespaces'
			};

			client.api.call(params, callback.apply(this));
		},
		'correct arguments are passed to callback': function(e, info /* processed query result */, next, data /* raw data */) {
			assert.isObject(info);
			assert.isUndefined(next); // no more pages
			assert.isObject(data);
		},
		'valid processed data is passed to callback': function(e, info /* processed query result */, next, data /* raw data */) {
			// processed data
			assert.isObject(info.namespaces);
			assert.isObject(info.namespaces[0]);
		},
		'valid raw data is passed to callback': function(e, info /* processed query result */, next, data /* raw data */) {
			// raw data
			assert.isObject(data.query);
			assert.isObject(data.query.namespaces);
			assert.isObject(data.query.namespaces[0]);
		}
	},
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
	},
	'getImagesFromArticle()': {
		topic: function() {
			client.getImagesFromArticle(ARTICLE, callback.apply(this));
		},
		'array is passed to callback': function(e, res) {
			assert.isArray(res);
		},
		'valid list of images is passed to callback': function(e, res) {
			var firstItem = res[0];

			assert.isTrue(firstItem.ns === 6);
			assert.isTrue(firstItem.title.indexOf("File:") === 0);
		}
	},
	'getExternalLinks()': {
		topic: function() {
			client.getExternalLinks(ARTICLE, callback.apply(this));
		},
		'array is passed to callback': function(e, res) {
			assert.isArray(res);
		},
		'valid list of external links is passed to callback': function(e, res) {
			var firstItem = res[0];

			assert.isString(firstItem['*']);
		}
	}
}).export(module);
