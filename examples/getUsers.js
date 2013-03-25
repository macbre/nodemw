/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

var bot = require('../lib/bot'),
	client = new bot({
		server: '8bit.wikia.com',
		path: '',
		debug: false
	});

client.getUsers(function(cat) {
	console.log(cat);
});

client.getUsers({prefix: 'M'}, function(cat) {
	console.log(cat);
});

client.getUsers({witheditsonly: true}, function(cat) {
	console.log(cat);
});

