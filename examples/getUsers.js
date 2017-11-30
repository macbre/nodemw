const Bot = require( '..' ),
	client = new Bot( {
		server: '8bit.wikia.com',
		path: '',
		debug: true
	} );

client.getUsers( function ( err, cat ) {
	console.log( cat );
} );

client.getUsers( { prefix: 'M' }, function ( err, cat ) {
	console.log( cat );
} );

client.getUsers( { witheditsonly: true }, function ( err, cat ) {
	console.log( cat );
} );
