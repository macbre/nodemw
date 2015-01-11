/**
 * Example script showing 5000 images in wiki
 *
 * @see http://www.mediawiki.org/wiki/API:Query
 */
'use strict';

var bot = require('..'),
	client = new bot('config.js');

var imageArray = [];

function getBatch(start) {
	client.getImages(start, function(err, data, next) {
		imageArray = imageArray.concat(data);
		if (next) {
			console.log('Getting next batch (starting from ' + next + ')...');
			getBatch(next);
		}
		else {
			console.log(JSON.stringify(imageArray, null, '\t'));
			console.log('Image count: ' + imageArray.length);
		}
	});
}

getBatch(0);
