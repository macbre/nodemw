'use strict';

var vows = require('vows'),
	assert = require('assert'),
	utils = require('../lib/utils');

vows.describe('utils.parseVideoUrl').addBatch({
	'YouTube URL': {
		topic: function() {
			return utils.parseVideoUrl('https://www.youtube.com/watch?v=24X9FpeSASY');
		},
		'is properly parsed': function(id) {
			assert.deepEqual(id, ['youtube', '24X9FpeSASY']);
		}
	},
	'Vimeo URL': {
		topic: function() {
			return utils.parseVideoUrl('https://vimeo.com/27986705');
		},
		'is properly parsed': function(id) {
			assert.deepEqual(id, ['vimeo', '27986705']);
		}
	},

}).export(module);
