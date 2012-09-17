/**
 * Example script showing 5000 images in wiki
 *
 * @see http://www.mediawiki.org/wiki/API:Query
 */

var bot = require('../lib/bot').bot;

var client = new bot('config.js');

var imageArray = [];

function getBatch(start) {
	client.getImages(start, function(data, next) {
		imageArray = imageArray.concat(data);
		if (next) {
			console.log('Getting next batch #' + next + '...');
			getBatch(next);
		}
		else {
			console.log(JSON.stringify(imageArray, null, '\t'));
			console.log('Image count: ' + imageArray.length);
		}
	});
}

getBatch(0);
