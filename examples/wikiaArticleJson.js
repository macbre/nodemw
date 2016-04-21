#!/usr/bin/env node
/**
 * Example script for AsSimpleJson Wikia API
 *
 * @see http://poznan.wikia.com/api/v1#!/Articles/getAsSimpleJson_get_0
 * @see http://poznan.wikia.com/api/v1/Articles/AsSimpleJson?id=379
 */
'use strict';

const bot = require('..'),
	client = new bot({
		server: 'poznan.wikia.com',
		path: '',
		debug: true
	}),
	PAGE_ID = 379; // @see http://poznan.wikia.com/wiki/Katedra

// get current account information
client.wikia.call("/Articles/AsSimpleJson", {id: PAGE_ID}, (err, data) => {
	if (err) {
		console.log(err);
		return;
	}

	// extract the first paragraph
	let excerpt = data.sections.
		// get content entries of type "paragraph"
		map((section) => section.content.filter((content) => content.type === 'paragraph')).
		// filter out empty sections
		filter((section) => section.length > 0).
		// extract the text value
		shift().shift().text;

	client.log('Excerpt:', excerpt);

	// extract images
	let images = [];

	data.sections.
		// get images' src attribute
		map((section) => section.images.map((image) => image.src)).
		// filter out empty sections
		filter((section) => section.length > 0).
		// flaten the list
		forEach((section) => images.push(...section));

	console.log(JSON.stringify(images, null, '\t'));
});
