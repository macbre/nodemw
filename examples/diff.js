#!/usr/bin/env node
/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
 */
'use strict';

var bot = require('..'),
	client = new bot({
		server: '8bit.wikia.com',
		path: ''
	});

var prev = 'foo 123 bar',
	current = '[[foo]] bar';

console.log("Old:  " + prev);
console.log("New:  " + current);
console.log("Diff: " + client.diff(prev, current));

