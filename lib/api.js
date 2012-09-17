/**
 * Helper "class" for accessing MediaWiki API and handling cookie-based session
 */
(function(exports) {
	var VERSION = '0.3.1';

	// import deferred-js
	// @see https://github.com/heavylifters/deferred-js
	var Deferred = require('./deferred/deferred').Deferred;

	// wait x ms between HTTP requests
	var QUEUE_DELAY = 50;

	var api = function(options) {
		this.server = options.server;
		this.path = options.path;
		this.proxy = options.proxy;
		this.debug = options.debug;

		this.cookieJar = '';

		// requests queue
		this.queue = [];
		this.queueItemId = 0;

		this.http = require('http');
		this.formatUrl = require('url').format;

		this.userAgent = 'nodemw v' + VERSION + ' (node.js ' + process.version + ')';
		this.version = VERSION;
	}

	var doRequest = function(params, callback, method, promise) {
		var self = this;

		params = params || {};
		method = method || 'GET';

		// force JSON format
		params.format = 'json';

		// add additional headers
		var headers = {
			'User-Agent': this.userAgent,
			'Content-Length': 0
		};

		if (this.cookieJar) {
			headers['Cookie'] = this.cookieJar;
		}

		// handle POST methods
		if (method === 'POST') {
			var postParams = this.formatUrl({query: params}).substring(1);

			headers['Content-Type'] = 'application/x-www-form-urlencoded';
			headers['Content-Length'] = postParams.length;

			params = {
				action: params.action
			};
		}

		// @see http://nodejs.org/api/url.html
		var url = this.formatUrl({
			protocol: 'http',
			hostname: this.server,
			pathname: this.path + '/api.php',
			query: params
		});

		this.log('URL [' + method + ']: ' + url);

		// form the request
		var req = this.http.request({
			host: this.proxy || this.server,
			method: method,
			headers: headers,
			path: url
		}, function(res) {
			res.body = '';

			// request was sent, now wait for the response
			res.on('data', function(chunk) {
				res.body += chunk;
			});

			res.on('end', function() {
				self.log(res.body);

				// store cookies
				var cookies = res.headers['set-cookie'];
				if (cookies) {
					cookies.forEach(function(cookie) {
						cookie = cookie.split(';').shift();
						self.cookieJar += (cookie + ';');
					});
				}

				// parse response
				var data,
					info,
					next;

				try {
					data = JSON.parse(res.body);
					info = data && data[params.action];
					next = data && data['query-continue'] && data['query-continue'][params.list];
				}
				catch(e) {
					throw 'Error parsing JSON response: ' + res.body;
				}

				if (info) {
					if (typeof callback === 'function') {
						callback(info, next, data);
					}
					promise.resolve({
						info: info,
						next: next,
						data: data
					});
				}
				else if (data.error) {
					throw 'Error returned by API: ' + data.error.info;
				}
			});
		});

		req.on('error', function(e) {
			self.log(e.stack);
		});

		// finish sending a request
		if (method === 'POST') {
			this.log(postParams);
			req.write(postParams);
		}

		req.end();

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
		fetchUrl: function(url) {
			var self = this;

			// add a request to the queue
			return addToQueue.call(this, function(promise) {
				self.log('Fetching ' + JSON.stringify(url));

				self.http.get(url, function(resp) {
					var page = '';

					resp.on("data", function(chunk) {
						page += chunk;
					});

					resp.on('end', function() {
						promise.resolve(page);
					});
				}).on('error', function(e) {
					throw new Error('http.get failed with ' + e);
				});
			});
		}
	};

	exports.api = api;

})(exports);
