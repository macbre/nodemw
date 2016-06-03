#!/usr/bin/env node
/**
 * Example script generating CSV file from Special:Log entries
 *
 * @see https://pl.wikipedia.org/w/api.php?action=help&modules=query%2Blogevents
 */
const async = require('async'),
	bot = require('..'),
	client = new bot({
		server: 'pl.wikipedia.org',
		path: '/w',
		debug: true
	}),
	logType = 'thanks';
	//logType = 'review/approve';

// @see https://github.com/caolan/async#whilsttest-fn-callback
var start = '',
	logEntries = [];

async.whilst(
	() => true, // run as long as there's more data
	function(callback) {
		console.error('Getting %s logs since %s...', logType, start);

		client.getLog(logType, start, function(err, data, next) {
			logEntries = logEntries.concat(data);

			// next time get next batch
			start = next;
			callback(next ? null : 'no more data');
		});
	},
	function(err) {
		const csv = require('csv-string'),
			len = logEntries.length;

		function writeCsvLine(data) {
			process.stdout.write(csv.stringify(data));
		}

		console.error('Got %s log entries', len);

		if (len === 0) {
			return;
		}

		// format CSV header
		writeCsvLine(Object.keys(logEntries[0]));

		// and next rows...
		logEntries.forEach(writeCsvLine);
	}
);
