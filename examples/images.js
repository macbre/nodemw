/**
 * Example script showing 5000 images in wiki
 *
 * @see http://www.mediawiki.org/wiki/API:Query
 */

var bot = require('../lib/bot').bot;

var client = new bot('config.js');

client.getImages(function(data) {
	console.log(JSON.stringify(data, null, '\t'));
});
