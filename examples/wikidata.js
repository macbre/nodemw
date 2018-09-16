#!/usr/bin/env node
/**
 * Example script showing how to access WikiData properties for selected titles.
 */
'use strict';

const async = require( 'async' ),
	Bot = require( '..' ),
	fs = require( 'fs' );

class WikiData {

	constructor() {
		this.bot = new Bot( {
			protocol: 'https',
			server: 'www.wikidata.org',
			path: '/w',
			debug: true
		} );
	}

	// get entities' claims for given set of titles
	getEntities( titles, callback ) {
		// cast a single title (string) to an array
		titles = Array.isArray( titles ) ? titles : [ titles ];

		this.bot.log( 'Getting claims for: ', titles );

		// @see https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Pozna%C5%84&props=claims&format=json
		const params = {
			action: 'wbgetentities',
			sites: 'enwiki',
			titles: titles.join( '|' ),
			props: 'claims'
		};

		this.bot.api.call( params, ( err, info, next, raw ) => {
			if ( err ) {
				callback( err );
				return;
			}

			let entities = [];

			Object.keys( raw.entities ).forEach( ( key, idx ) => {
				let claims = new Map();

				claims.set( 'id', key );
				claims.set( 'name', titles[ idx ] );

				this.bot.log( `Found entity for ${titles[ idx ]}: <https://www.wikidata.org/wiki/${key}>` );

				Object.keys( raw.entities[ key ].claims ).forEach( ( propertyId ) => {
					let claim = raw.entities[ key ].claims[ propertyId ][ 0 ];

					if ( claim.mainsnak.datavalue ) {
						// TODO: values casting
						claims.set( propertyId, claim.mainsnak.datavalue.value );
					}
				} );

				entities.push( claims );
			} );

			callback( null, entities );
		} );
	}
}

const data = new WikiData(); // eslint-disable-line one-var

data.getEntities(
	[
		'Denmark',
		'Estonia',
		'Faroe Islands',
		'Finland',
		'France',
		'Germany',
		'Hungary',
		'Iceland',
		'Italy',
		'Norway',
		'Poland',
		'Slovenia',
		'Sweden',
		'Switzerland'
	],
	( err, claims ) => {
		// console.log(claims);

		let tld = claims
				.map( ( item ) => item.get( 'P297' ) )
				.map( ( tld ) => tld.toLowerCase() ),
			population = claims
				.map( ( item ) => item.get( 'P1082' ) && item.get( 'P1082' ).amount || '' )
				.map( ( amount ) => parseInt( amount.replace( /^\+/, '' ), 10 ) );

		data.bot.log( 'TLD', tld );
		data.bot.log( 'Population', population );

		// get wikis stats
		async.map(
			tld,
			( tld, callback ) => {
				let client = new Bot( {
					server: `${tld}.wikipedia.org`,
					path: '/w',
					debug: true
				} );

				client.getSiteStats( ( err, data ) => {
					callback( err, data );
				} );
			},
			( err, stats ) => {
				// console.log(stats);

				// write to TSV file
				const fd = fs.openSync( 'wikidata.tsv', 'w' );

				// calculate per country stats
				claims.forEach( ( item, idx ) => {
					const stat = stats[ idx ],
						pop = population[ idx ],
						round = ( val ) => val.toFixed( 6 );

					let itemStats = {
						country: item.get( 'name' ),
						population: pop,
						articles: stat.articles,
						edits: stat.edits,
						// users who had some kind of activity within the last 30 days
						activeUsers: stat.activeusers,
						articlesPerCapita: round( stat.articles / pop ),
						editsPerCapita: round( stat.edits / pop ),
						activeUsersPer1KCapita: round( stat.activeusers / pop * 1000 )
					};

					data.bot.log( 'Country', item.get( 'name' ) );
					data.bot.log( 'Stats', JSON.stringify( itemStats, null, ' ' ) );

					// write the header before the first row with data
					if ( idx === 0 ) {
						fs.writeSync( fd, Object.keys( itemStats ).join( '\t' ) + '\n' );
					}

					fs.writeSync( fd, Object.keys( itemStats ).map( ( key ) => itemStats[ key ] ).join( '\t' ) + '\n' );
				} );

				fs.closeSync( fd );
			}
		);
	}
);
