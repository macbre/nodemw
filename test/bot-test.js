'use strict';

var vows = require( 'vows' ),
	assert = require( 'assert' ),
	Bot = require( '../lib/bot' );

vows.describe( 'bot class' ).addBatch( {
	'supports config object': {
		topic: function () {
			return new Bot( {
				server: 'pl.wikipedia.org',
				path: '/w'
			} );
		},
		'server is properly passed': function ( client ) {
			assert.equal( client.api.server, 'pl.wikipedia.org' );
		},
		'path is properly passed': function ( client ) {
			assert.equal( client.api.path, '/w' );
		}
	},
	'supports config file': {
		topic: function () {
			return new Bot( __dirname + '/config.json' );
		},
		'server is properly passed': function ( client ) {
			assert.equal( client.api.server, 'pl.wikipedia.org' );
		},
		'path is properly passed': function ( client ) {
			assert.equal( client.api.path, '/w' );
		}
	},
	'getConfig()': {
		topic: function () {
			return new Bot( __dirname + '/config.json' );
		},
		'gets a correct value': function ( client ) {
			assert.equal( client.getConfig( 'server' ), 'pl.wikipedia.org' );
			assert.equal( client.getConfig( 'goo' ), 123 );
		},
		'gets a default value': function ( client ) {
			assert.isUndefined( client.getConfig( 'foo' ) );
			assert.equal( client.getConfig( 'foo', 'bar' ), 'bar' );
		}
	},
	'setConfig()': {
		topic: function () {
			return new Bot( __dirname + '/config.json' );
		},
		'sets a value': function ( client ) {
			assert.isUndefined( client.getConfig( 'foo' ) );

			client.setConfig( 'foo', 'bar' );

			assert.equal( client.getConfig( 'foo' ), 'bar' );
			assert.equal( client.getConfig( 'foo', 123 ), 'bar' );
		}
	},
	'user agent': {
		topic: function () {
			return new Bot( {
				userAgent: 'Custom UA'
			} );
		},
		'can be customized': function ( client ) {
			assert.equal( client.api.userAgent, 'Custom UA' );
		}
	},
	'dry run mode': {
		topic: function () {
			var client = new Bot( {
				server: 'pl.wikipedia.org',
				path: '/w',
				dryRun: true
			} );

			client.edit( 'Page', 'Content', 'Summary', false, function ( e ) {
				this.callback( null, e );
			}.bind( this ) );
		},
		'is correctly handled by edit()': function ( fake, err ) {
			assert.isTrue( err instanceof Error );
			assert.equal( 'In dry-run mode', err.message );
		}
	},
	'client.diff': {
		topic: function () {
			var client = new Bot( __dirname + '/config.json' ),
				prev = 'foo 123 bar',
				current = '[[foo]] bar';

			return client.diff( prev, current );
		},
		'is correctly generated': function ( diff ) {
			assert.equal( true, diff.indexOf( 'foo' ) > -1 );
			assert.equal( true, diff.indexOf( 'bar' ) > -1 );
		}
	}
} ).export( module );
