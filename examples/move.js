/**
 * Example script moving page
 *
 * @see http://www.mediawiki.org/wiki/API:Move
 */

var bot = require('../lib/bot'),
	client = new bot('config.js');

client.logIn(function() {
	// move the page
	client.move('newnewmtestmarcin', 'newnewnewmtestmarcin', 'test summary', function(userData) {
		console.log(JSON.stringify(userData, null, '\t'));
	});
});
