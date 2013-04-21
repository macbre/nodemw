/**
 * Helper "class" for accessing MediaWiki API and handling cookie-based session
 */
	var VERSION = '0.3.5';

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

		this.debug = options.debug;

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
	}

	var doRequest = function(params, callback, method, promise) {
		var self = this,
			// store requested action - will be used when parsing a response
			actionName = params.action,
			// "request" options
			options = {
				method: method || 'GET',
				proxy: this.proxy || false,
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
			query: params
		});

		request(options, function(error, response, body) {
			if (error) {
				throw 'Request to API failed: ' + error;
			}

			if (response.statusCode !== 200) {
				throw 'Request to API failed: HTTP status code was ' + response.statusCode;
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
				throw 'Error parsing JSON response: ' + body;
			}

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
				throw 'Error returned by API: ' + data.error.info;
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

		item.promise.then(function(res) {
			// schedule next queue check
			setTimeout(function() {
				self.queueBusy = false;
				processQueue.apply(self);
			}, QUEUE_DELAY);

			return res;
		});

		// call the function and pass promise it should reject / resolve
		item.fn.call(this, item.promise);
	};

	// public interface
	api.prototype = {
		log: function(obj) {
			if (this.debug) {
				console.log(obj);
			}
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
			var self = this,
				encoding = encoding || 'utf-8';

			// add a request to the queue
			return addToQueue.call(this, function(promise) {
				self.log('Fetching ' + url + '...');

				request({
					url: url,
					encoding: (encoding === 'binary') ? null : encoding 
				}, function (error, response, body) {
					if (!error && response.statusCode === 200) {
						self.log('Fetched ' + (body.length/1024).toFixed(2) + 'kB');
						promise.resolve(body);
					}
					else {
						throw new Error('fetchUrl failed with ' + error);
					}
				});
			});
		}
	};

	module.exports = api;
