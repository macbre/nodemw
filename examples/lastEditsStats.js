/**
 * Gets stats for the recent changes:
 *  - most active editors
 *  - most actively edited articles
 */

const Bot = require( '..' ),
	client = new Bot( 'config.js' ),
	LIMIT = 500;

client.getRecentChanges( false, function ( err, data ) {
	let usersStats = {},
		pagesStats = {},
		count = 0,
		from,
		to,
		key,
		pages = [],
		users = [];

	data.forEach( function ( entry ) {
		if ( count >= LIMIT ) {
			return;
		}

		count++;

		// only main namespace
		if ( entry.ns !== 0 ) {
			return;
		}

		// register timestamp
		if ( !from ) {
			from = entry.timestamp;
		}
		to = entry.timestamp;

		// console.log(JSON.stringify(entry));

		// register pages stats
		if ( !pagesStats[ entry.title ] ) {
			pagesStats[ entry.title ] = {
				title: entry.title,
				edits: 0,
				editors: [],
				diff: 0
			};
		}

		const pagesItem = pagesStats[ entry.title ],
			usersItem = usersStats[ entry.user ],
			diff = entry.newlen - entry.oldlen;

		pagesItem.edits++;

		if ( pagesItem.editors.indexOf( entry.user ) === -1 ) {
			pagesItem.editors.push( entry.user );
		}

		// register users stats
		if ( !usersStats[ entry.user ] ) {
			usersStats[ entry.user ] = {
				user: entry.user,
				edits: 0,
				created: 0,
				diff: 0
			};

			// mark bots
			if ( typeof entry.bot !== 'undefined' ) {
				usersStats[ entry.user ].bot = true;
			}
		}

		switch ( entry.type ) {
			case 'new':
				usersItem.created++;
				break;

			default:
			case 'edit':
				usersItem.edits++;
		}

		// edit size difference
		pagesItem.diff += diff;
		usersItem.diff += diff;
	} );

	// generate an array of results
	for ( key in pagesStats ) {
		pages.push( pagesStats[ key ] );
	}

	for ( key in usersStats ) {
		users.push( usersStats[ key ] );
	}

	// sort them
	pages.sort( ( a, b ) => b.edits - a.edits );

	users.sort( ( a, b ) => b.diff - a.diff );

	// emit results
	console.log( `Stats for the last ${count} recent changes (from ${from} back to ${to})...` );

	// console.log('Pages statistcs:');
	// console.log(pages);

	console.log( 'Users statistcs:' );
	console.log( users );
} );
