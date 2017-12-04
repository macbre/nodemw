/**
 * Example script preparing ship disambig pages for translation
 */

const Bot = require( '..' ),
	client = new Bot( {
		server: 'en.wikipedia.org',
		path: '/w',
		debug: false
	} ),
	titles = [
		'Manta',
		'Maple',
		'Marathon'
	],
	template = '== USS $1 ==\n' +
'{{s|disambig}}\n' +
'[[Okręt]]y [[United States Navy|US Navy]] o nazwie \'\'\'[[Lista akronimów przed nazwami okrętów|USS]] "$1"\'\'\'\n' +
'\n*Pierwszy\n*Drugi\n' +
'\n$2\n' +
'[[:Kategoria:Nazwy okrętów amerykańskich|$1]]\n' +
'[[:en:USS $1]]';

titles.forEach( function ( title ) {

	client.getArticle( `USS ${title}`, function ( err, content ) {
		if ( err ) {
			console.error( err );
			return;
		}

		// console.log(content);

		const items = content.match( /\*(.*)\n/g ),
			newContent = template
				.replace( /\$1/g, title )
				.replace( /\$2/g, items.join( '' ) );

		// console.log(items);
		// console.log('====');
		console.log( newContent );

		console.log( '\n\n\n\n' );
	} );

} );
