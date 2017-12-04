const Bot = require( '..' ),
	client = new Bot( 'config.js' );

client.logIn( function () {
	const imagesToDo = [];
	let imageArray = [];

	function changeNameWithNumber( filename, title, extension, number ) {
		const title1 = title + ' ' + number;
		console.log( title1 );
		client.getArticle( `Plik:${title1}${extension}`, function ( err, content ) {
			if ( content === null ) {
				client.move(
					`Plik:${filename}`,
					`Plik:${title1}${extension}`,
					'',
					function () {
						client.getArticle( `Plik:${title1}${extension}`, function ( err, content2 ) {
							content2 = content2 + '\n[[Kategoria:' + title1 + ']]';
							client.edit( `Plik:${title1}${extension}`, content2, `[[Użytkownik:OzgaBot|OzgaBot]] dodaje plik do kategorii ${title}`, function () {
								console.log( title1 + extension + ' another one bites the dust xD' );
							} );
						} );
					} );

			} else {
				console.log( `plik ${title1}${extension} już istnieje ` );
				const i = number + 1;
				changeNameWithNumber( filename, title, extension, i );
			}
		} );
	}

	function changeName( filename, title, extension ) {
		console.log( title + ' changename' );
		client.getArticle( `Plik:${title}${extension}`, function ( err, content ) {
			if ( content === null ) {
				client.move(
					`Plik:${filename}`,
					`Plik:${title}${extension}`,
					'',
					function () {
						client.getArticle( `Plik:${title}${extension}`, function () {
							content = content + '\n[[Kategoria:' + title + ']]';
							client.edit( `Plik:${title}${extension}`, content, `[[Użytkownik:OzgaBot|OzgaBot]] dodaje plik do kategorii ${title}`, function () {
								console.log( title + extension + ' another one bites the dust xD' );
							} );
						} );
					} );
			} else {
				console.log( `plik ${title}${extension} już istnieje ` );
				changeNameWithNumber( filename, title, extension, 0 );

			}
		} );
	}

	function rename( filename ) {
		client.getImageUsage( `Plik:${filename}`, function ( err, img ) {
			if ( img[ 0 ] !== null ) {
				let extension = filename.match( /\.\D+$/i )[ 0 ];
				extension = extension.toLowerCase();
				changeName( filename, img[ 0 ].title, extension );
			} else {
				client.getArticle( `File_talk:${filename}`, function ( err, content ) {
					if ( content.match( /Obraz sierota/gi ) === null ) {
						content = `{{Obraz sierota}}\n${content}`;
						client.edit( `File_talk:${filename}`, content, '[[Użytkownik:OzgaBot|OzgaBot]] wstawia szablon \'Obraz sierota\'', function () {
							console.log( filename + ' został oznaczony jako obraz sierota' );
						} );
					}
				} );
			}
		} );
	}

	function getBatch( start ) {
		client.getImages( start, function ( err, data, next ) {
			imageArray = imageArray.concat( data );
			if ( next ) {
				getBatch( next );
			} else {
				imageArray.forEach( function ( item ) {
					if ( item.name.match( /^[0-9]+\.$/i ) ) {
						imagesToDo.push( item.name );
						// rename(item.name);
					}
					if ( item.name.match( /^P[0-9]+/ ) ) {
						imagesToDo.push( item.name );
						// rename(item.name);
					}
					if ( item.name.match( /^IMG/i ) ) {
						imagesToDo.push( item.name );
						// rename(item.name);
					}
					if ( item.name.match( /^DSC/i ) ) {
						imagesToDo.push( item.name );
						// rename(item.name);
					}
					if ( item.name.match( /^jpeg/i ) ) {
						imagesToDo.push( item.name );
						// rename(item.name);
					}
				} );
				let i = 0;
				imagesToDo.forEach( function ( item ) {
					setTimeout( function () { rename( item ); }, 10000 * i );
					i++;
				} );
				console.log( `do przerobienia: ${i}` );
			}

		} );
	}

	getBatch( 0 );

} );
