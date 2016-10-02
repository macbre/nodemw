#!/usr/bin/env node

var bot = require('..'),
	client = new bot('../config.js'),
	title = 'User:Pyrabot/brudnopis';

client.logIn(function() {

	client.edit(title, '== foo bar ==\ntest', 'edit test', (err, data) => {
		client.prepend(title, 'before', 'prepend', (err, data) => {});
		client.append(title, 'after', 'append', (err, data) => {});
	});
});
