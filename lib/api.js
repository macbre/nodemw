/**
 * Helper "class" for accessing MediaWiki API and handling cookie-based session
 */
module.exports = (function() {
	// introspect package.json to get module version
	var VERSION = require('../package').version;

	// @see https://github.com/mikeal/request
	var request = require('request');

	// import deferred-js
	// @see https://github.com/heavylifters/deferred-js
	var Deferred = require('./deferred/deferred').Deferred;

	// wait x ms between HTTP requests
	var QUEUE_DELAY = 50;

	var api = function(options) {
		this.protocol = options.protocol || 'http';
		this.port = options.port || (this.protocol === 'https' ? 443 : 80);
		this.server = options.server;
		this.path = options.path;
		this.proxy = options.proxy;
		this.jar = request.jar(); // create new cookie jar for each instance

		this.debug = options.debug;

		// set up logging
		var winston = require('winston');
		this.logger = new (winston.Logger)();

		if (!options.silent) {
			// console logging
			this.logger.add(winston.transports.Console, {
				level: this.debug ? 'debug' : 'info'
			});
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
		}

		// requests queue
		this.queue = [];
		this.queueItemId = 0;

		if (this.protocol === 'https') {
			this.http = require('https');
		} else {
			this.http = require('http');
		}
		this.formatUrl = require('url').format;

		this.userAgent = 'nodemw v' + VERSION + ' (node.js ' + process.version + '; ' + process.platform + ' ' + process.arch + ')';
		this.version = VERSION;

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
		this.logger.debug('%d/%d: %s <%s>', this.currentItemId + 1, this.queueItemId, options.method, options.url);
		if (options.form) this.logger.debug('POST fields: %s', Object.keys(options.form).join(', '));

		request(options, function(error, response, body) {
			if (error) {
				self.logger.error('Request to API failed: %s', error);

				promise.reject({
					err:'Request to API failed: ' + error,
					info: error
				});
			}

			if (response.statusCode !== 200) {
				self.logger.error('Request to API failed: HTTP status code was %d for <%s>', response.statusCode, options.url);
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
	var addToQueue = function(fn) {
		var promise = new Deferred();

		// add to the queue
		this.queue.push({
			id: this.queueItemId++,
			fn: fn,
			promise: promise
		});

		//this.logger.debug('Queue: added #%d item (reqs remaining: %d)', this.queueItemId, this.queue.length);

		// try to process this item (maybe this queue is inactive right now)
		processQueue.apply(this);

		return promise;
	};

	// process the first item in the queue and schedule next check
	var processQueue = function() {
		var self = this,
			item;

		// is queue running? this function will be called via setTimeout
		if (this.queueBusy === true) {
			return;
		}

		// get an item to process
		item = this.queue.shift();

		// the queue is empty
		if (typeof item === 'undefined') {
			return;
		}

		if (typeof item.fn !== 'function') {
			throw new Error('addToQueue() not provided with a function!');
		}

		this.queueBusy = true;

		item.promise.both(function(res) {
			// schedule next queue check
			// both() adds both callback and errback
			setTimeout(function() {
				self.queueBusy = false;
				processQueue.apply(self);
			}, QUEUE_DELAY);

			return res;
		});

		this.currentItemId = item.id;

		// call the function and pass promise it should reject / resolve
		item.fn.call(this, item.promise);
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
			return addToQueue.call(this, function(promise) {
				doRequest.apply(self, [params, callback, method, promise]);
			});
		},

		// fetch an external resource
		fetchUrl: function(url, encoding) {
			var self = this;
			encoding = encoding || 'utf-8';

			this.info("Fetching <%s> (as %s)...", url, encoding);

			// add a request to the queue
			return addToQueue.call(this, function(promise) {
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
