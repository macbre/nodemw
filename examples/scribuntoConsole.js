var Bot = require( 'nodemw' ),
	readline = require( 'readline' ),
	rl = readline.createInterface( {
		input: process.stdin,
		output: process.stdout
	} ),
	client = new Bot( {
		protocol: 'https',
		server: 'dev.fandom.com',
		path: ''
	} ),
	params = {
		action: 'scribunto-console',
		title: 'Module:CLI/testcases/title',
		clear: true
	};

function call( err, info, next, data ) {
	if ( err ) {
		console.error( err );
	} else if ( data.type === 'error' ) {
		console.error( data.message );
	} else {
		console.log( data.print );
	}
}

function cli( input ) {
	params.question = input;
	client.api.call( params, call );
}

function session( err, content ) {
	params.content = content;
	rl.on( 'line', cli );
}

client.getArticle( params.title, session );
