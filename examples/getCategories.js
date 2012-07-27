/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */

var bot = require('../lib/bot').bot;

var client = new bot({
	server: '8bit.wikia.com',
	path: '',
	debug: false
});

client.getCategories(function(cat) {
	console.log(cat);
});


client.getCategories('K', function(cat) {
	console.log(cat);
});