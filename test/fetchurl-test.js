'use strict';

var vows = require( 'vows' ),
	assert = require( 'assert' ),
	Bot = require( '../lib/bot' ),
	client = new Bot( {
		server: 'en.wikipedia.org',
		path: '/w'
	} );

vows.describe( 'URL fetching' ).addBatch( {
	'client.fetchUrl()': {
		topic: function () {
			client.fetchUrl( 'http://example.com', this.callback );
		},
		'should pass page content to a callback': function ( e, res ) {
			assert.isString( res );
			assert.isTrue( res.indexOf( '<h1>Example Domain</h1>' ) > -1 );
		}
	},
	'client.fetchUrl() when not found': {
		topic: function () {
			client.fetchUrl( 'http://google.com/404', function ( e ) {
				this.callback( null, e );
			}.bind( this ) );
		},
		'should pass an Error to the callback': function ( fake, err ) {
			assert.isTrue( err instanceof Error );
		},
		'should pass error details': function ( fake, err ) {
			assert.isTrue( err.message.indexOf( 'HTTP status 404' ) > -1 );
		}
	},
	'client.fetchUrl() when failed': {
		topic: function () {
			client.fetchUrl( 'foo://bar', function ( e ) {
				this.callback( null, e );
			}.bind( this ) );
		},
		'should pass an Error to the callback': function ( fake, err ) {
			assert.isTrue( err instanceof Error );
		},
		'should pass error details': function ( fake, err ) {
			assert.isTrue( err.message.indexOf( 'Invalid protocol' ) > -1 );
		}
	},
	'binary data': {
		topic: function () {
			client.fetchUrl( 'http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png', this.callback, 'binary' );
		},
		'should be passed to a callback in raw form': function ( e, res ) {
			assert.isTrue( res instanceof Buffer );
			assert.equal( 19670, res.length );
		}
	}
} ).export( module );
