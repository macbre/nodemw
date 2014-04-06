#!/usr/bin/env node
/**
 * Example script generating CSV file from Special:Log entries
 */
'use strict';

var async = require('async'),
	bot = require('..'),
	client = new bot({
		server: 'pl.wikipedia.org',
		path: '/w'
	}),
	logType = 'thanks';

// @see https://github.com/caolan/async#whilsttest-fn-callback
var start = '',
	logEntries = [];

async.whilst(
	function() {
		// run as long as there's more data
		return true;
	},
	function(callback) {
		console.error('Getting %s logs since %s...', logType, start);

		client.getLog(logType, start, function(data, next) {
			logEntries = logEntries.concat(data);

			// next time get next batch
			start = next;
			callback(next ? null : 'no more data');
		});
	},
	function(err) {
		var csv = require('csv-string'),
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
