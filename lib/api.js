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

	// import deferred-js
	// @see https://github.com/heavylifters/deferred-js
	var Deferred = require('./deferred/deferred').Deferred;

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
		var concurrency = options.concurrency || 3; // how many tasks (i.e. requests) to run in parallel
		this.queue = async.queue(function(task, callback) {
			// process the task
			callback();
		}, concurrency);
		this.tasksCnt = 0;

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

	var doRequest = function(params, callback, method, promise) {
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
		this.logger.debug('%d/%d: %s <%s>', promise.taskId, this.tasksCnt, options.method, options.url);
		if (options.form) this.logger.debug('POST fields: %s', Object.keys(options.form).join(', '));

		request(options, function(error, response, body) {
			response = response || {};

			if (error) {
				self.logger.error('Request to API failed: %s', error);

				promise.reject({
					err:'Request to API failed: ' + error,
					info: error
				});
			}

			if (response.statusCode !== 200) {
				self.logger.error('Request to API failed: HTTP status code was %d for <%s>', response.statusCode || 'unknown', options.url);
				self.logger.data(new Error().stack);

				promise.reject({
					err:'Request to API failed: HTTP status code was ' + response.statusCode,
					info: response
				});
			}

			// parse response
			var data,
				info,
				next;

			try {
				data = JSON.parse(body);
				info = data && data[actionName];
				next = data && data['query-continue'] && data['query-continue'][params.list];
			}
			catch(e) {
				self.logger.error('Error parsing JSON response: %s',  body);
				self.logger.data(body);

				promise.reject({
					err: 'Error parsing JSON response',
					info: data.body
				});
			}

			//if (!callback) data.error = {info: 'foo'}; // debug

			if (data && !data.error) {
				if (typeof callback === 'function') {
					callback && callback(info, next, data);
				}
				promise.resolve({
					info: info,
					next: next,
					data: data
				});
			}
			else {
				self.logger.error('Error returned by API: %s',  data.error.info);
				self.logger.data(data.error);

				promise.reject({
					err: 'Error returned by API: ' + data.error.info,
					info: data.error
				});
			}
		});

		return promise;
	};

	// add a function to the queue
	var pushToQueue = function(fn) {
		var promise = new Deferred(),
			task = {
				fn: fn,
				promise: promise
			};

		this.tasksCnt++;
		promise.taskId = this.tasksCnt;

		// add to the queue
		this.queue.push(task, function(err) {
			if (err) {
				promise.reject(err);
				return;
			}

			// run the task that will resolve / reject given promise
			task.fn(task.promise);
		});

		return promise;
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

		// adds request to the queue and returns a promise
		call: function(params, callback, method) {
			var self = this;

			// add a request to the queue
			return pushToQueue.call(this, function(promise) {
				doRequest.apply(self, [params, callback, method, promise]);
			});
		},

		// fetch an external resource
		fetchUrl: function(url, encoding) {
			var self = this;
			encoding = encoding || 'utf-8';

			this.info("Fetching <%s> (as %s)...", url, encoding);

			// add a request to the queue
			return pushToQueue.call(this, function(promise) {
				request({
					url: url,
					encoding: (encoding === 'binary') ? null : encoding 
				}, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						self.info('Fetched %s kB', (body.length/1024).toFixed(2));
						promise.resolve(body);
					}
					else {
						self.error('Failed to fetch <' + url + '>');
						promise.reject({
							err: 'fetchUrl failed with: ' + error,
							info: error
						});
					}
				});
			});
		}
	};

	return api;
}());
