/**
 * Helper "class" for accessing MediaWiki API and handling cookie-based session
 */
module.exports = (function() {
	'use strict';

	// introspect package.json to get module version
	var VERSION = require('../package').version;

	var
		// @see https://github.com/caolan/async
		async = require('async'),
		// @see https://github.com/mikeal/request
		request = require('request');

	var api = function(options) {
		this.protocol = options.protocol || 'http';
		this.port = options.port || (this.protocol === 'https' ? 443 : undefined /* will default to 80 */);
		this.server = options.server;
		this.path = options.path;
		this.proxy = options.proxy;
		this.jar = request.jar(); // create new cookie jar for each instance

		this.debug = options.debug;

		// set up logging
		var winston = require('winston');
		this.logger = new (winston.Logger)();

		// console logging
		if (this.debug) {
			this.logger.add(winston.transports.Console, {
				level: 'debug'
			});
		}

		this.logger.cli();

		// file logging
		var path = require('path'),
			fs = require('fs'),
			logDir = path.dirname(process.argv[1]) + '/log/',
			logFile = logDir + path.basename(process.argv[1], '.js') + '.log';

		if (fs.existsSync(logDir)) {
			this.logger.add(winston.transports.File, {
				colorize: true,
				filename: logFile,
				json: false,
				level: this.debug ? 'debug' : 'info'
			});
		}

		// requests queue
		// @see https://github.com/caolan/async#queue
		var concurrency = options.concurrency || 3; // how many tasks (i.e. requests) to run in parallel
		this.queue = async.queue(function(task, callback) {
			// process the task (and call the provided callback once it's completed)
			task(callback);
		}, concurrency);

		// HTTP client
		this.formatUrl = require('url').format;

		this.userAgent = options.userAgent || ('nodemw v' + VERSION + ' (node.js ' + process.version + '; ' + process.platform + ' ' + process.arch + ')');
		this.version = VERSION;

		// debug info
		this.info(process.argv.join(' '));
		this.info(this.userAgent);
		this.info('Using <' + this.protocol + '://' + this.server + ':' + this.port + this.path + '/api.php> as API entry point');
		this.info('----');
	};

	var doRequest = function(params, callback, method, done) {
		var self = this,
			// store requested action - will be used when parsing a response
			actionName = params.action,
			// "request" options
			options = {
				method: method || 'GET',
				proxy: this.proxy || false,
				jar: this.jar,
				headers: {
					'User-Agent': this.userAgent
				}
			};

		// HTTP request parameters
		params = params || {};

		// force JSON format
		params.format = 'json';

		// handle uploads
		if (method === 'UPLOAD') {
			options.method = 'POST';

			var CRLF = "\r\n",
				postBody = [],
				boundary = 'nodemw' + Math.random().toString().substr(2);

			// encode each field
			Object.keys(params).forEach(function(fieldName) {
				var value = params[fieldName];

				postBody.push("--" + boundary);
				postBody.push(CRLF);

				if (typeof value === 'string') {
					// properly encode UTF8 in binary-safe POST data
					postBody.push("Content-Disposition: form-data; name=\"" + fieldName + "\"");
					postBody.push(CRLF);
					postBody.push(CRLF);
					postBody.push(new Buffer(value, 'utf8'));
				}
				else {
					// send attachment
					postBody.push("Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"foo\"");
					postBody.push(CRLF);
					postBody.push(CRLF);
					postBody.push(value);
				}

				postBody.push(CRLF);
			});

			postBody.push("--" + boundary + "--");

			// encode post data
			options.headers['content-type'] = 'multipart/form-data; boundary=' + boundary;
			options.body = postBody;

			params = {};
		}

		// form an URL to API
		options.url = this.formatUrl({
			protocol: this.protocol,
			port: this.port,
			hostname: this.server,
			pathname: this.path + '/api.php',
			query: (options.method === 'GET') ? params : {}
		});

		// POST all parameters (avoid "request string too long" errors)
		if (method === 'POST') {
			options.form = params;
		}

		this.logger.debug('API action: %s', actionName);
		this.logger.debug('%s <%s>', options.method, options.url);
		if (options.form) {
			this.logger.debug('POST fields: %s', Object.keys(options.form).join(', '));
		}

		request(options, function(error, response, body) {
			response = response || {};

			if (error) {
				self.logger.error('Request to API failed: %s', error);
				callback(new Error('Request to API failed: ' + error));
				done();
				return;
			}

			if (response.statusCode !== 200) {
				self.logger.error('Request to API failed: HTTP status code was %d for <%s>', response.statusCode || 'unknown', options.url);
				self.logger.data(new Error().stack);

				callback(new Error('Request to API failed: HTTP status code was ' + response.statusCode));
				done();
				return;
			}

			// parse response
			var data,
				info,
				next;

			try {
				data = JSON.parse(body);
				info = data && data[actionName];

				// acfrom=Zeppelin Games
				next = data && data['query-continue'] && data['query-continue'][params.list || params.prop];

				// handle the new continuing queries introduced in MW 1.21 (and to be made default in MW 1.26)
				// issue #64
				// @see https://www.mediawiki.org/wiki/API:Query#Continuing_queries
				if (!next) {
					// cmcontinue=page|5820414e44205920424f534f4e53|12253446, continue=-||
					next = data && data['continue'];
				}
			}
			catch(e) {
				self.logger.error('Error parsing JSON response: %s',  body);
				self.logger.data(body);

				callback(new Error('Error parsing JSON response'));
				done();
				return;
			}

			//if (!callback) data.error = {info: 'foo'}; // debug

			if (data && !data.error) {
				if (next) {
					self.logger.debug("There's more data");
					self.logger.debug(next);
				}

				callback(null, info, next, data);
			}
			else if (data.error) {
				self.logger.error('Error returned by API: %s',  data.error.info);
				self.logger.data(data.error);

				callback(new Error('Error returned by API: ' + data.error.info));
			}
			done();
		});
	};

	// public interface
	api.prototype = {
		log: function() {
			this.logger.log.apply(this.logger, arguments);
		},

		info: function() {
			this.logger.info.apply(this.logger, arguments);
		},

		warn: function(msg, extra) {
			this.logger.warn.apply(this.logger, arguments);
		},

		error: function(msg, extra) {
			this.logger.error.apply(this.logger, arguments);
		},

		// adds request to the queue
		call: function(params, callback, method) {
			this.queue.push(function(done) {
				doRequest.apply(this, [params, callback, method, done]);
			}.bind(this));
		},

		// fetch an external resource
		fetchUrl: function(url, callback, encoding) {
			var self = this;
			encoding = encoding || 'utf-8';

			// add a request to the queue
			this.queue.push(function(done) {
				self.info("Fetching <%s> (as %s)...", url, encoding);

				request({
					url: url,
					encoding: (encoding === 'binary') ? null : encoding 
				}, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						self.info('<%s>: fetched %s kB', url, (body.length/1024).toFixed(2));
						callback(null, body);
					}
					else {
						if (!error) {
							error = new Error('HTTP status '+ response.statusCode);
						}

						self.error('Failed to fetch <' + url + '>');
						self.error(error.message);
						callback(error, body);
					}

					done();
				});
			});
		}
	};

	return api;
}());
