/* eslint max-len: ["error", { "code": 150 }] */
/**
 * @typedef { import('./types').BotOptions } BotOptions
 */
/**
 * Defines bot API
 */
'use strict';

const Api = require( './api' ),
	_ = require( 'underscore' ),
	async = require( 'async' ),
	fs = require( 'fs' ),
	querystring = require( 'querystring' ),
	// the upper limit for bots (will be reduced by MW for users without a bot right)
	API_LIMIT = 5000;

// get the object being the first key/value entry of a given object
function getFirstItem( obj ) {
	const key = Object.keys( obj ).shift();
	return obj[ key ];
}

/**
 * Bot public API
 */
class Bot {
	/**
	 * @param {string | BotOptions } params
	 */
	constructor( params ) {
		let env = process.env;
		/** @type { BotOptions } */
		let options;

		// read configuration from the file
		if ( typeof params === 'string' ) {
			let configFile,
				configParsed;

			try {
				configFile = fs.readFileSync( params, 'utf-8' );
				configParsed = JSON.parse( configFile );
			} catch ( e ) {
				throw new Error( `Loading config failed: ${e.message}` );
			}

			if ( typeof configParsed === 'object' ) {
				options = configParsed;
			}
		} else if ( typeof params === 'object' ) { // configuration provided as an object
			options = params;
		}

		if ( !params ) {
			throw new Error( 'No configuration was provided!' );
		}

		this.protocol = options.protocol;
		this.server = options.server;

		const protocol = options.protocol || 'http';
		this.api = new Api( {
			protocol,
			port: options.port,
			server: options.server,
			path: options.path || '',
			proxy: options.proxy,
			userAgent: options.userAgent,
			concurrency: options.concurrency,
			debug: ( options.debug === true || env.DEBUG === '1' )
		} );

		this.version = this.api.version;

		// store options
		this.options = options;

		// in dry-run mode? (issue #48)
		this.dryRun = ( options.dryRun === true || env.DRY_RUN === '1' );

		if ( this.dryRun ) {
			this.log( 'Running in dry-run mode' );
		}

		// bind provider-specific "namespaces"
		this.wikia.call = this.wikia.call.bind( this );
	}
	log() {
		this.api.info.apply( this.api, arguments );
	}

	logData( obj ) {
		this.log( JSON.stringify( obj, undefined, 2 ) );
	}

	error() {
		this.api.error.apply( this.api, arguments );
	}

	getConfig( key, def ) {
		return this.options[ key ] || def;
	}

	setConfig( key, val ) {
		this.options[ key ] = val;
	}

	getRand() {
		return Math.random().toString().split( '.' ).pop();
	}

	getAll( params, key, callback ) {
		let res = [],
			// @see https://www.mediawiki.org/wiki/API:Query#Continuing_queries
			continueParams = { continue: '' };
		let titles, pageids = params.pageids;
		if ( params.titles ) {
			if ( params.titles.length === 0 ) {
				delete params.titles;
			} else {
				titles = params.titles;
			}
		}
		if ( params.pageids ) {
			if ( params.pageids.length === 0 ) {
				delete params.pageids;
			} else {
				pageids = params.pageids;
				if ( titles ) {
					delete params.pageids;
				}
			}
		}

		async.whilst(
			( cb ) => { cb( null, true ); },
			( cb ) => {
				this.api.call( _.extend( params, continueParams ), ( err, data, next ) => {
					if ( err ) {
						cb( err );
					} else {
						// append batch data
						const batchData = ( typeof key === 'function' ) ? key( data ) : data[ key ];

						res = res.concat( batchData );

						// more pages?
						continueParams = next;
						cb( next ? null : true );
					}
				} );
				if ( titles && pageids ) {
					params.pageids = pageids;
					delete params.titles;
					this.api.call( _.extend( params, continueParams ), ( err, data, next ) => {
						if ( err ) {
							cb( err );
						} else {
							// append batch data
							const batchData = ( typeof key === 'function' ) ? key( data ) : data[ key ];

							res = res.concat( batchData );

							// more pages?
							continueParams = next;
							cb( next ? null : true );
						}
					} );
				}
			},
			( err ) => {
				if ( err instanceof Error ) {
					callback( err );
				} else {
					callback( null, res );
				}
			}
		);
	}

	logIn( username, password, callback /* or just callback */ ) {

		// assign domain if applicable
		let domain = this.options.domain || '';

		// username and password params can be omitted
		if ( typeof username !== 'string' ) {
			callback = username;

			// use data from config
			username = this.options.username;
			password = this.options.password;
		}

		this.log( 'Obtaining login token...' );

		const logInCallback = ( err, data ) => {
			if ( data === null || typeof data === 'undefined' ) {
				this.error( 'Logging in failed: no data received' );
				callback( err || new Error( 'Logging in failed: no data received' ) );
			} else if ( !err && typeof data.lgusername !== 'undefined' ) {
				this.log( `Logged in as ${data.lgusername}` );
				callback( null, data );
			} else if ( typeof data.reason === 'undefined' ) {
				this.error( 'Logging in failed' );
				this.error( data.result );
				callback( err || new Error( `Logging in failed: ${data.result}` ) );
			} else {
				this.error( 'Logging in failed' );
				this.error( data.result );
				this.error( data.reason );
				callback( err || new Error( `Logging in failed: ${data.result} - ${data.reason}` ) );
			}
		};

		// request a token
		this.api.call( {
			action: 'login',
			lgname: username,
			lgpassword: password,
			lgdomain: domain
		}, ( err, data ) => {
			if ( err ) {
				callback( err );
				return;
			}

			if ( data.result === 'NeedToken' ) {
				const token = data.token;

				this.log( `Got token ${token}` );

				// log in using a token
				this.api.call( {
					action: 'login',
					lgname: username,
					lgpassword: password,
					lgtoken: token,
					lgdomain: domain
				}, logInCallback, 'POST' );
			} else {
				logInCallback( err, data );
			}
		}, 'POST' );
	}

	getCategories( prefix, callback ) {
		if ( typeof prefix === 'function' ) {
			callback = prefix;
		}

		this.getAll(
			{
				action: 'query',
				list: 'allcategories',
				acprefix: prefix || '',
				aclimit: API_LIMIT
			},
			( data ) => data.allcategories.map( ( cat ) => cat[ '*' ] ),
			callback
		);
	}

	getUsers( data, callback ) {
		if ( typeof data === 'function' ) {
			callback = data;
		}

		data = data || {};

		this.api.call( {
			action: 'query',
			list: 'allusers',
			auprefix: data.prefix || '',
			auwitheditsonly: data.witheditsonly || false,
			aulimit: API_LIMIT
		}, function ( err, _data ) {
			callback( err, _data && _data.allusers || [] );
		} );
	}

	getAllPages( callback ) {
		this.log( 'Getting all pages...' );
		this.getAll(
			{
				action: 'query',
				list: 'allpages',
				apfilterredir: 'nonredirects',
				aplimit: API_LIMIT
			},
			'allpages',
			callback
		);
	}

	getPagesInCategory( category, callback ) {
		category = `Category:${category}`;
		this.log( `Getting pages from ${category}...` );

		this.getAll(
			{
				action: 'query',
				list: 'categorymembers',
				cmtitle: category,
				cmlimit: API_LIMIT
			},
			'categorymembers',
			callback
		);
	}

	getPagesInNamespace( namespace, callback ) {
		this.log( `Getting pages in namespace ${namespace}` );

		this.getAll(
			{
				action: 'query',
				list: 'allpages',
				apnamespace: namespace,
				apfilterredir: 'nonredirects',
				aplimit: API_LIMIT
			},
			'allpages',
			callback
		);
	}

	getPagesByPrefix( prefix, callback ) {
		this.log( `Getting pages by ${prefix} prefix...` );

		this.api.call( {
			action: 'query',
			list: 'allpages',
			apprefix: prefix,
			aplimit: API_LIMIT
		}, function ( err, data ) {
			callback( err, data && data.allpages || [] );
		} );
	}

	getPagesTranscluding( template, callback ) {
		this.log( `Getting pages from ${template}...` );

		this.getAll(
			{
				action: 'query',
				prop: 'transcludedin',
				titles: template
			},
			( data ) => getFirstItem( getFirstItem( data ) ).transcludedin,
			callback
		);
	}

	getArticle( title, redirect, callback ) {
		let params = {
			action: 'query',
			prop: 'revisions',
			rvprop: 'content',
			rand: this.getRand()
		};

		if ( typeof redirect === 'function' ) {
			callback = redirect;
			redirect = undefined;
		}

		// @see https://www.mediawiki.org/wiki/API:Query#Resolving_redirects
		if ( redirect === true ) {
			params.redirects = '';
		}

		// both page ID or title can be provided
		if ( typeof title === 'number' ) {
			this.log( `Getting content of article #${title}...` );
			params.pageids = title;
		} else {
			this.log( `Getting content of ${title}...` );
			params.titles = title;
		}

		this.api.call( params, function ( err, data ) {
			if ( err ) {
				callback( err );
				return;
			}

			const page = getFirstItem( data.pages ),
				revision = page.revisions && page.revisions.shift(),
				content = revision && revision[ '*' ],
				redirectInfo = data.redirects && data.redirects.shift() || undefined;

			callback( null, content, redirectInfo );
		} );
	}

	getArticleRevisions( title, callback ) {
		const params = {
			action: 'query',
			prop: 'revisions',
			rvprop: [ 'ids', 'timestamp', 'size', 'flags', 'comment', 'user' ].join( '|' ),
			rvdir: 'newer',
			rvlimit: API_LIMIT
		};

		// both page ID or title can be provided
		if ( typeof title === 'number' ) {
			this.log( `Getting revisions of article #${title}...` );
			params.pageids = title;
		} else {
			this.log( `Getting revisions of ${title}...` );
			params.titles = title;
		}

		this.getAll(
			params,
			function ( batch ) {
				const page = getFirstItem( batch.pages );
				return page.revisions;
			},
			callback
		);
	}

	getArticleCategories( title, callback ) {
		this.api.call( {
			action: 'query',
			prop: 'categories',
			cllimit: API_LIMIT,
			titles: title
		}, function ( err, data ) {
			if ( err ) {
				callback( err );
				return;
			}

			if ( data === null ) {
				callback( new Error( `"${title}" page does not exist` ) );
				return;
			}

			const page = getFirstItem( data.pages );

			callback(
				null,
				( page.categories || [] ).map( ( cat ) =>
					// { ns: 14, title: 'Kategoria:XX wiek' }
					cat.title
				)
			);
		} );
	}

	getArticleProperties( title, callback ) {
		// https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&titles=Saksun&prop=pageprops
		const params = {
			action: 'query',
			prop: 'pageprops',
			titles: title
		};

		this.api.call( params, ( err, data ) => {
			if ( err ) {
				callback( err );
				return;
			}

			/**
			 * page_image_free: 'Einstein_1921_by_F_Schmutzer_-_restoration.jpg',
			 * 'wikibase-badge-Q17437798': '1',
			 * 'wikibase-shortdesc': 'German-born scientist (1879–1955)',
			 * wikibase_item: 'Q937'
			 */
			const properties = getFirstItem( data.pages );

			callback( err, properties.pageprops );
		} );
	}

	getArticleInfo( title, options, callback ) {
		if ( typeof options === 'function' ) { // This is the callback; options was nonexistant
			callback = options;
			options = {};
		}
		if ( !options ) {
			options = {};
		}
		if ( options.inprop === undefined ) { // If not specified, get almost everything.
			options.inprop = [
				'associatedpage',
				'displaytitle',
				'notificationtimestamp',
				'preload',
				'protection',
				'subjectid',
				'talkid',
				'url',
				'varianttitles',
				'visitingwatchers',
				'watched',
				'watchers'
			];
		}
		const params = {
			action: 'query',
			prop: 'info',
			inprop: options.inprop.join( '|' ),
			titles: []
		};

		const titles = [];
		if ( options.intestactions && options.intestactions.length !== 0 ) {
			params.intestactions = options.intestactions.join( '|' );
		}
		if ( typeof title === 'string' ) {
			titles.push( title );
		}
		if ( typeof title === 'number' ) {
			titles.push( title );
		}
		if ( typeof title === 'object' ) {
			let objTitle = title;
			for ( let key in objTitle ) {
				titles.push( objTitle[ key ] );
			}
		}
		titles.forEach( ( t ) => {
			if ( typeof t === 'string' ) {
				params.titles.push( t );
			}
			if ( typeof t === 'number' ) {
				params.pageids.push( t );
			}
		} );

		this.getAll(
			params,
			function ( batch ) {
				const page = getFirstItem( batch.pages );
				return page;
			},
			callback
		);
	}

	search( keyword, callback ) {
		this.getAll(
			{
				action: 'query',
				list: 'search',
				srsearch: keyword,
				srprop: 'timestamp',
				srlimit: 5000
			},
			'search',
			callback
		);
	}

	// get token required to perform a given action
	getToken( title, action, callback ) {
		this.log( `Getting ${action} token (for ${title})...` );

		this.getMediaWikiVersion( ( ( err, version ) => {
			let compare = require( 'node-version-compare' ),
				params,
				useTokenApi = compare( version, '1.24.0' ) > -1;

			// @see https://www.mediawiki.org/wiki/API:Tokens (for MW 1.24+)
			if ( useTokenApi ) {
				params = {
					action: 'query',
					meta: 'tokens',
					type: 'csrf'
				};
			} else {
				params = {
					action: 'query',
					prop: 'info',
					intoken: action,
					titles: title
				};
			}

			this.api.call( params, ( ( _err, data, next, raw ) => {
				let token;

				if ( _err ) {
					callback( _err );
					return;
				}

				if ( useTokenApi ) {
					token = data.tokens.csrftoken.toString(); // MW 1.24+
				} else {
					token = getFirstItem( data.pages )[ action + 'token' ]; // older MW version
				}

				if ( !token ) {
					const msg = raw.warnings.info[ '*' ];
					this.log( `getToken: ${msg}` );
					err = new Error( `Can't get "${action}" token for "${title}" page - ${msg}` );
					token = undefined;
				}

				callback( err, token );
			} ) );
		} ) );
	}

	// this should only be used internally (see #84)
	doEdit( type, title, summary, params, callback ) {
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		// @see http://www.mediawiki.org/wiki/API:Edit
		this.getToken( title, 'edit', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( `Editing '${title}' with a summary '${summary}' (${type})...` );

			const editParams = _.extend( {
				action: 'edit',
				bot: '',
				title,
				summary
			}, params, { token } );

			this.api.call( editParams, ( _err, data ) => {
				if ( !_err && data.result && data.result === 'Success' ) {
					this.log( 'Rev #%d created for \'%s\'', data.newrevid, data.title );
					callback( null, data );
				} else {
					callback( _err || data );
				}
			}, 'POST' );
		} );
	}

	edit( title, content, summary, minor, callback ) {
		let params = {
			text: content
		};

		if ( typeof minor === 'function' ) {
			callback = minor;
			minor = undefined;
		}

		if ( minor ) {
			params.minor = '';
		} else {
			params.notminor = '';
		}

		this.doEdit( 'edit', title, summary, params, callback );
	}

	append( title, content, summary, callback ) {
		let params = {
			appendtext: content
		};

		this.doEdit( 'append', title, summary, params, callback );
	}

	prepend( title, content, summary, callback ) {
		let params = {
			prependtext: content
		};

		this.doEdit( 'prepend', title, summary, params, callback );
	}

	addFlowTopic( title, subject, content, callback ) {
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		// @see http://www.mediawiki.org/wiki/API:Flow
		this.getToken( title, 'flow', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( `Adding a topic to page '${title}' with subject '${subject}'...` );

			const params = {
				action: 'flow',
				submodule: 'new-topic',
				page: title,
				nttopic: subject,
				ntcontent: content,
				ntformat: 'wikitext',
				bot: '',
				token: token
			};

			this.api.call( params, ( _err, data ) => {
				if ( !_err && data[ 'new-topic' ] && data[ 'new-topic' ].status && data[ 'new-topic' ].status === 'ok' ) {
					this.log( 'Workflow \'%s\' created on \'%s\'', data[ 'new-topic' ].workflow, title );
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'POST' );
		} );
	}

	'delete'( title, reason, callback ) {
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		// @see http://www.mediawiki.org/wiki/API:Delete
		this.getToken( title, 'delete', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( 'Deleting \'%s\' because \'%s\'...', title, reason );

			this.api.call( {
				action: 'delete',
				title,
				reason,
				token
			}, ( _err, data ) => {
				if ( !_err && data.title && data.reason ) {
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'POST' );
		} );
	}

	protect( title, protections, options, callback ) {
		// @see https://www.mediawiki.org/wiki/API:Protect
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		if ( typeof options === 'function' ) {
			// This is the callback; options was nonexistent.
			callback = options;
			options = {};
		}

		if ( !options ) {
			options = {};
		}

		const params = {
			action: 'protect'
		};

		if ( typeof title === 'number' ) {
			params.pageid = title;
		} else {
			params.title = title;
		}

		const formattedProtections = [];
		const expiries = [];
		let failed = false;
		Array.from( protections ).forEach( ( protection ) => {
			if ( !protection.type ) {
				callback( new Error( 'Invalid protection. An action type must be specified.' ) );
				failed = true;
				return;
			}

			const level = protection.level ? protection.level : 'all';
			formattedProtections.push( `${protection.type}=${level}` );

			if ( protection.expiry ) {
				expiries.push( protection.expiry );
			} else {
				// If no expiry was specified, then set the expiry to never.
				expiries.push( 'never' );
			}
		} );

		if ( failed ) {
			return;
		}

		params.protections = formattedProtections.join( '|' );
		params.expiry = expiries.join( '|' );

		if ( options.reason ) {
			params.reason = options.reason;
		}

		if ( options.tags ) {
			if ( Array.isArray( options.tags ) ) {
				params.tags = options.tags.join( '|' );
			} else if ( typeof options.tags === 'string' ) {
				params.tags = options.tags;
			}
		}

		if ( options.cascade ) {
			params.cascade = options.cascade ? 1 : 1;
		}

		if ( options.watchlist && typeof options.watchlist === 'string' ) {
			params.watchlist = options.watchlist;
		}

		// Params have been generated. Now fetch the csrf token and call the API.
		this.getToken( title, 'csrf', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			params.token = token;

			this.api.call( params, ( _err, data ) => {
				if ( !_err && data.title && data.protections ) {
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'POST' );
		} );
	}

	purge( titles, callback ) {
		// @see https://www.mediawiki.org/wiki/API:Purge
		const params = {
			action: 'purge'
		};

		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		if ( typeof titles === 'string' && titles.indexOf( 'Category:' ) === 0 ) {
			// @see https://docs.moodle.org/archive/pl/api.php?action=help&modules=purge
			// @see https://docs.moodle.org/archive/pl/api.php?action=help&modules=query%2Bcategorymembers
			// since MW 1.21 - @see https://github.com/wikimedia/mediawiki/commit/62216932c197f1c248ca2d95bc230f87a79ccd71
			this.log( 'Purging all articles in category \'%s\'...', titles );
			params.generator = 'categorymembers';
			params.gcmtitle = titles;
		} else {
			// cast a single item to an array
			titles = Array.isArray( titles ) ? titles : [ titles ];

			// both page IDs or titles can be provided
			if ( typeof titles[ 0 ] === 'number' ) {
				this.log( 'Purging the list of article IDs: #%s...', titles.join( ', #' ) );
				params.pageids = titles.join( '|' );
			} else {
				this.log( 'Purging the list of articles: \'%s\'...', titles.join( '\', \'' ) );
				params.titles = titles.join( '|' );
			}
		}

		this.api.call(
			params,
			( err, data ) => {
				if ( !err ) {
					data.forEach( ( page ) => {
						if ( typeof page.purged !== 'undefined' ) {
							this.log( 'Purged "%s"', page.title );
						}
					} );
				}

				callback( err, data );
			},
			'POST'
		);
	}

	sendEmail( username, subject, text, callback ) {
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		// @see http://www.mediawiki.org/wiki/API:Email
		this.getToken( `User:${username}`, 'email', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( 'Sending an email to \'%s\' with subject \'%s\'...', username, subject );

			this.api.call( {
				action: 'emailuser',
				target: username,
				subject,
				text,
				ccme: '',
				token
			}, ( _err, data ) => {
				if ( !_err && data.result && data.result === 'Success' ) {
					this.log( 'Email sent' );
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'POST' );
		} );
	}

	getUserContribs( options, callback ) {
		options = options || {};

		this.api.call( {
			action: 'query',
			list: 'usercontribs',
			ucuser: options.user,
			ucstart: options.start,
			uclimit: API_LIMIT,
			ucnamespace: options.namespace || ''
		}, function ( err, data, next ) {
			callback( err, data && data.usercontribs || [], next && next.ucstart || false );
		} );
	}

	whoami( callback ) {
		// @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
		const props = [
			'groups',
			'rights',
			'ratelimits',
			'editcount',
			'realname',
			'email'
		];

		this.api.call( {
			action: 'query',
			meta: 'userinfo',
			uiprop: props.join( '|' )
		}, function ( err, data ) {
			if ( !err && data && data.userinfo ) {
				callback( null, data.userinfo );
			} else {
				callback( err );
			}
		} );
	}

	whois( username, callback ) {
		this.whoare( [ username ], function ( err, usersinfo ) {
			callback( err, usersinfo && usersinfo[ 0 ] );
		} );
	}

	whoare( usernames, callback ) {
		// @see https://www.mediawiki.org/wiki/API:Users
		const props = [
			'blockinfo',
			'groups',
			'implicitgroups',
			'rights',
			'editcount',
			'registration',
			'emailable',
			'gender'
		];

		this.api.call( {
			action: 'query',
			list: 'users',
			ususers: usernames.join( '|' ),
			usprop: props.join( '|' )
		}, function ( err, data ) {
			if ( !err && data && data.users ) {
				callback( null, data.users );
			} else {
				callback( err );
			}
		} );
	}

	createAccount( username, password, callback ) {
		// @see https://www.mediawiki.org/wiki/API:Account_creation
		this.log( `creating account ${username}` );
		this.api.call( {
			action: 'query',
			meta: 'tokens',
			type: 'createaccount'
		}, ( err, data ) => {
			this.api.call( {
				action: 'createaccount',
				createreturnurl: `${this.api.protocol}://${this.api.server}:${this.api.port}/`,
				createtoken: data.tokens.createaccounttoken,
				username: username,
				password: password,
				retype: password
			}, ( _err, _data ) => {
				if ( _err ) {
					callback( _err );
					return;
				}
				callback( _data );
			}, 'POST' );
		} );
	}

	move( from, to, summary, callback ) {
		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		// @see http://www.mediawiki.org/wiki/API:Move
		this.getToken( from, 'move', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( 'Moving \'%s\' to \'%s\' because \'%s\'...', from, to, summary );

			this.api.call( {
				action: 'move',
				from,
				to,
				bot: '',
				reason: summary,
				token
			}, ( _err, data ) => {
				if ( !_err && data.from && data.to && data.reason ) {
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'POST' );
		} );
	}

	getImages( start, callback ) {
		this.api.call( {
			action: 'query',
			list: 'allimages',
			aifrom: start,
			ailimit: API_LIMIT
		}, function ( err, data, next ) {
			callback( err, ( ( data && data.allimages ) || [] ), ( ( next && next.aifrom ) || false ) );
		} );
	}

	getImagesFromArticle( title, callback ) {
		this.api.call( {
			action: 'query',
			prop: 'images',
			titles: title
		}, function ( err, data ) {
			const page = getFirstItem( data && data.pages || [] );
			callback( err, ( page && page.images ) || [] );
		} );
	}

	getImagesFromArticleWithOptions( title, options, callback ) {
		let requestOptions = {
			action: 'query',
			prop: 'images',
			titles: title
		};
		if ( !options || typeof ( options ) !== 'object' ) {
			callback( new Error( 'Incorrect options parameter' ) );
		}
		Object.keys( options ).forEach( function ( x ) {
			requestOptions[ x ] = options[ x ];
		} );
		this.api.call( requestOptions, function ( err, data ) {
			const page = getFirstItem( data && data.pages || [] );
			callback( err, ( page && page.images ) || [] );
		} );
	}

	getImageUsage( filename, callback ) {
		this.api.call( {
			action: 'query',
			list: 'imageusage',
			iutitle: filename,
			iulimit: API_LIMIT
		}, function ( err, data ) {
			callback( err, ( data && data.imageusage ) || [] );
		} );
	}

	getImageInfo( filename, callback ) {
		const props = [
			'timestamp',
			'user',
			'metadata',
			'size',
			'url'
		];

		this.api.call( {
			action: 'query',
			titles: filename,
			prop: 'imageinfo',
			iiprop: props.join( '|' )
		}, function ( err, data ) {
			const image = getFirstItem( data && data.pages || [] ),
				imageinfo = image && image.imageinfo && image.imageinfo[ 0 ];

			// process EXIF metadata into key / value structure
			if ( !err && imageinfo && imageinfo.metadata ) {
				imageinfo.exif = {};

				imageinfo.metadata.forEach( function ( entry ) {
					imageinfo.exif[ entry.name ] = entry.value;
				} );
			}

			callback( err, imageinfo );
		} );
	}

	getLog( type, start, callback ) {
		let params = {
			action: 'query',
			list: 'logevents',
			lestart: start,
			lelimit: API_LIMIT
		};

		if ( type.indexOf( '/' ) > 0 ) {
			// Filter log entries to only this type.
			params.leaction = type;
		} else {
			// Filter log actions to only this action. Overrides letype. In the list of possible values,
			// values with the asterisk wildcard such as action/* can have different strings after the slash (/).
			params.letype = type;
		}

		this.api.call( params, function ( err, data, next ) {
			if ( next && next.lecontinue ) {
				// 20150101124329|22700494
				next = next.lecontinue.split( '|' ).shift();
			}

			callback( err, ( ( data && data.logevents ) || [] ), next );
		} );
	}

	expandTemplates( text, title, callback ) {
		this.api.call( {
			action: 'expandtemplates',
			text,
			title,
			generatexml: 1
		}, function ( err, data, next, raw ) {
			const xml = getFirstItem( raw.parsetree );
			callback( err, xml );
		}, 'POST' );
	}

	parse( text, title, callback ) {
		this.api.call( {
			action: 'parse',
			text,
			title,
			contentmodel: 'wikitext',
			generatexml: 1
		}, function ( err, data, next, raw ) {
			if ( err ) {
				callback( err );
				return;
			}
			const xml = getFirstItem( raw.parse.text ),
				images = raw.parse.images;
			callback( err, xml, images );
		}, 'POST' );
	}

	getRecentChanges( start, callback ) {
		const props = [
			'title',
			'timestamp',
			'comments',
			'user',
			'flags',
			'sizes'
		];

		this.api.call( {
			action: 'query',
			list: 'recentchanges',
			rcprop: props.join( '|' ),
			rcstart: start || '',
			rclimit: API_LIMIT
		}, function ( err, data, next ) {
			callback( err, ( ( data && data.recentchanges ) || [] ), ( ( next && next.rcstart ) || false ) );
		} );
	}

	getSiteInfo( props, callback ) {
		// @see http://www.mediawiki.org/wiki/API:Siteinfo
		if ( typeof props === 'string' ) {
			props = [ props ];
		}

		this.api.call( {
			action: 'query',
			meta: 'siteinfo',
			siprop: props.join( '|' )
		}, function ( err, data ) {
			callback( err, data );
		} );
	}

	getSiteStats( callback ) {
		const prop = 'statistics';

		this.getSiteInfo( prop, function ( err, info ) {
			callback( err, info && info[ prop ] );
		} );
	}

	getMediaWikiVersion( callback ) {
		// cache it for each instance of the client
		// we will call it multiple times for features detection
		if ( typeof this._mwVersion !== 'undefined' ) { // eslint-disable-line no-underscore-dangle
			callback( null, this._mwVersion ); // eslint-disable-line no-underscore-dangle
			return;
		}

		this.getSiteInfo( [ 'general' ], ( ( err, info ) => {
			let version;

			if ( err ) {
				callback( err );
				return;
			}

			version = info && info.general && info.general.generator; // e.g. "MediaWiki 1.27.0-wmf.19"
			version = version.match( /[\d.]+/ )[ 0 ]; // 1.27.0

			this.log( 'Detected MediaWiki v%s', version );

			// cache it
			this._mwVersion = version; // eslint-disable-line no-underscore-dangle
			callback( null, this._mwVersion ); // eslint-disable-line no-underscore-dangle
		} ) );
	}

	getQueryPage( queryPage, callback ) {
		// @see http://www.mediawiki.org/wiki/API:Querypage
		this.api.call( {
			action: 'query',
			list: 'querypage',
			qppage: queryPage,
			qplimit: API_LIMIT
		}, ( err, data ) => {
			if ( !err && data && data.querypage ) {
				this.log( '%s data was generated %s', queryPage, data.querypage.cachedtimestamp );
				callback( null, data.querypage.results || [] );
			} else {
				callback( err, [] );
			}
		} );
	}

	upload( filename, content, extraParams, callback ) {
		let params = {
			action: 'upload',
			ignorewarnings: '',
			filename,
			file: ( typeof content === 'string' ) ? Buffer.from( content, 'binary' ) : content,
			text: ''
		};

		if ( this.dryRun ) {
			callback( new Error( 'In dry-run mode' ) );
			return;
		}

		if ( typeof extraParams === 'object' ) {
			params = _.extend( params, extraParams );
		} else { // it's summary (comment)
			params.comment = extraParams;
		}

		// @see http://www.mediawiki.org/wiki/API:Upload
		this.getToken( `File:${filename}`, 'edit', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( 'Uploading %s kB as File:%s...', ( content.length / 1024 ).toFixed( 2 ), filename );

			params.token = token;
			this.api.call( params, ( _err, data ) => {
				if ( data && data.result && data.result === 'Success' ) {
					this.log( 'Uploaded as <%s>', data.imageinfo.descriptionurl );
					callback( null, data );
				} else {
					callback( _err );
				}
			}, 'UPLOAD' /* fake method to set a proper content type for file uploads */ );
		} );
	}

	uploadByUrl( filename, url, summary, callback ) {
		this.api.fetchUrl( url, ( error, content ) => {
			if ( error ) {
				callback( error, content );
				return;
			}

			this.upload( filename, content, summary, callback );
		}, 'binary' /* use binary-safe fetch */ );
	}

	// Wikia-specific API entry-point
	uploadVideo( fileName, url, callback ) {
		const parseVideoUrl = require( './utils' ).parseVideoUrl;
		const parsed = parseVideoUrl( url );

		if ( parsed === null ) {
			callback( new Error( 'Not supported URL provided' ) );
			return;
		}

		let provider = parsed[ 0 ], videoId = parsed[ 1 ];

		this.getToken( `File:${fileName}`, 'edit', ( err, token ) => {
			if ( err ) {
				callback( err );
				return;
			}

			this.log( 'Uploading <%s> (%s provider with video ID %s)', url, provider, videoId );

			this.api.call( {
				action: 'addmediapermanent',
				title: fileName,
				provider: provider,
				videoId: videoId,
				token: token
			}, callback, 'POST' /* The addmediapermanent module requires a POST request */ );
		} );
	}

	getExternalLinks( title, callback ) {
		this.api.call( {
			action: 'query',
			prop: 'extlinks',
			titles: title,
			ellimit: API_LIMIT
		}, function ( err, data ) {
			callback( err, ( data && getFirstItem( data.pages ).extlinks ) || [] );
		} );
	}

	getBacklinks( title, callback ) {
		this.api.call( {
			action: 'query',
			list: 'backlinks',
			blnamespace: 0,
			bltitle: title,
			bllimit: API_LIMIT
		}, function ( err, data ) {
			callback( err, ( data && data.backlinks ) || [] );
		} );
	}

	// utils section
	getTemplateParamFromXml( tmplXml, paramName ) {
		paramName = paramName
			.trim()
			.replace( '-', '\\-' );

		const re = new RegExp( `<part><name>${paramName}\\s*</name>=<value>([^>]+)</value>` ),
			matches = tmplXml.match( re );

		return matches && matches[ 1 ].trim() || false;
	}

	fetchUrl( url, callback, encoding ) {
		this.api.fetchUrl( url, callback, encoding );
	}

	diff( prev, current ) {
		let colors = require( 'ansicolors' ),
			jsdiff = require( 'diff' ),
			diff = jsdiff.diffChars( prev, current ),
			res = '';

		diff.forEach( function ( part ) {
			const color = part.added ? 'green' :
				part.removed ? 'red' : 'brightBlack';

			res += colors[ color ]( part.value );
		} );

		return res;
	}
}

// Wikia-specific methods (issue #56)
// @see http://www.wikia.com/api/v1
Bot.prototype.wikia = {
	API_PREFIX: '/api/v1',

	call( path, params, callback ) {
		let url = this.api.protocol + '://' + this.api.server + this.wikia.API_PREFIX + path;

		if ( typeof params === 'function' ) {
			callback = params;
			this.log( 'Wikia API call:', path );
		} else if ( typeof params === 'object' ) {
			url += `?${querystring.stringify( params )}`;
			this.log( 'Wikia API call:', path, params );
		}

		this.fetchUrl( url, function ( err, res ) {
			const data = JSON.parse( res );
			callback( err, data );
		} );
	},

	getWikiVariables( callback ) {
		this.call( '/Mercury/WikiVariables', function ( err, res ) {
			callback( err, res.data );
		} );
	},

	getUser( ids, callback ) {
		this.getUsers( [ ids ], function ( err, users ) {
			callback( err, users && users[ 0 ] );
		} );
	},

	getUsers( ids, callback ) {
		this.call( '/User/Details', {
			ids: ids.join( ',' ),
			size: 50
		}, function ( err, res ) {
			callback( err, res.items );
		} );
	}
};

module.exports = Bot;
