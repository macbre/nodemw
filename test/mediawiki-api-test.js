'use strict';

var vows = require( 'vows' ),
	assert = require( 'assert' ),
	Bot = require( '..' ),
	client = new Bot( {
		server: 'en.wikipedia.org',
		path: '/w'
	} ),
	ARTICLE = 'Albert Einstein';

vows.describe( 'Mediawiki API' ).addBatch( {
	'client.api.call()': {
		topic: function () {
			// http://en.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=namespaces&format=json
			var params = {
				action: 'query',
				meta: 'siteinfo',
				siprop: 'namespaces'
			};

			client.api.call( params, this.callback );
		},
		'correct arguments are passed to callback': function ( e, info /* processed query result */, next, data /* raw data */ ) {
			assert.isObject( info );
			assert.isUndefined( next ); // no more pages
			assert.isObject( data );
		},
		'valid processed data is passed to callback': function ( e, info /* processed query result */ ) {
			// processed data
			assert.isObject( info.namespaces );
			assert.isObject( info.namespaces[ 0 ] );
		},
		'valid raw data is passed to callback': function ( e, info /* processed query result */, next, data /* raw data */ ) {
			// raw data
			assert.isObject( data.query );
			assert.isObject( data.query.namespaces );
			assert.isObject( data.query.namespaces[ 0 ] );
		}
	},
	'client,api.call() fails': {
		topic: function () {
			// http://en.wikipedia.org/w/api.php?action=query&meta=siteinfo&siprop=namespaces&format=json
			var params = {
				action: 'foo'
			};

			// we need to push the "real" error one position to the right
			// to satisfy vows
			client.api.call( params, function ( err ) {
				this.callback( null, err );
			}.bind( this ) );
		},
		'raise an error': function ( _fake, err ) {
			assert.isTrue( err !== null );
		}
	},
	'getArticle()': {
		topic: function () {
			client.getArticle( ARTICLE, this.callback );
		},
		'string is passed to callback': function ( e, res ) {
			assert.isString( res );
		},
		'valid content is passed to callback': function ( e, res ) {
			assert.isTrue( res.indexOf( '\'\'\'Albert Einstein\'\'\'' ) > -1 );
		}
	},
	'getArticle() with a redirect': {
		topic: function () {
			client.getArticle( 'Einstein', true, this.callback );
		},
		'string is passed to callback': function ( e, res ) {
			assert.isString( res );
		},
		'valid content is passed to callback': function ( e, res ) {
			assert.isTrue( res.indexOf( '\'\'\'Albert Einstein\'\'\'' ) > -1 );
		},
		'redirect info is passed to callback': function ( e, res, redirectInfo ) {
			assert.isObject( redirectInfo );
			assert.isString( redirectInfo.to );
			assert.isString( redirectInfo.from );

			assert.equal( redirectInfo.to, 'Albert Einstein' );
			assert.equal( redirectInfo.from, 'Einstein' );
		}
	},
	'getImagesFromArticle()': {
		topic: function () {
			client.getImagesFromArticle( ARTICLE, this.callback );
		},
		'array is passed to callback': function ( e, res ) {
			assert.isArray( res );
		},
		'valid list of images is passed to callback': function ( e, res ) {
			var firstItem = res[ 0 ];

			assert.isTrue( firstItem.ns === 6 );
			assert.isTrue( firstItem.title.indexOf( 'File:' ) === 0 );
		}
	},
	'getExternalLinks()': {
		topic: function () {
			client.getExternalLinks( ARTICLE, this.callback );
		},
		'array is passed to callback': function ( e, res ) {
			assert.isArray( res );
		},
		'valid list of external links is passed to callback': function ( e, res ) {
			var firstItem = res[ 0 ];

			assert.isString( firstItem[ '*' ] );
		}
	},
	'search()': {
		topic: function () {
			client.search( ARTICLE, this.callback );
		},
		'array is passed to callback': function ( e, res ) {
			assert.isArray( res );
		},
		'the required item is in th results': function ( e, res ) {
			var firstItem = res[ 0 ];

			assert.isTrue( firstItem.ns === 0 );
			assert.isTrue( firstItem.title.indexOf( 'Albert Einstein' ) > -1 );
		}
	}
} ).export( module );
