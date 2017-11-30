#!/usr/bin/env node

var Bot = require( '..' ),
	client = new Bot( '../config.js' ),
	title = 'User:Pyrabot/brudnopis';

client.logIn( function () {

	client.edit( title, '== foo bar ==\ntest', 'edit test', () => {
		client.prepend( title, 'before', 'prepend', () => {} );
		client.append( title, 'after', 'append', () => {} );
	} );
} );
