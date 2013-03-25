/**
 * Helper "class" for accessing MediaWiki API and handling cookie-based session
 */
	var VERSION = '0.3.5';

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

		if (this.proxy) {
			// parse proxy entry - "hostname:port"
			var parts = this.proxy.split(':');
			this.proxy = parts[0];
			this.port = parseInt(parts[1]);
		}

		this.debug = options.debug;

		this.cookieJar = '';

		// requests queue
		this.queue = [];
		this.queueItemId = 0;

		if (this.protocol === 'https') {
			this.http = require('https');
		} else {
			this.http = require('http');
		}
		this.formatUrl = require('url').format;

		this.userAgent = 'nodemw v' + VERSION + ' (node.js ' + process.version + ')';
		this.version = VERSION;
	}

	var doRequest = function(params, callback, method, promise) {
		var self = this;

		params = params || {};
		method = method || 'GET';

		// store requested action - will be used when parsing a response
		var actionName = params.action;

		// force JSON format
		params.format = 'json';

		// POST request data
		var postData = false;

		// add additional headers
		var headers = {
			'User-Agent': this.userAgent,
		};

		if (this.cookieJar) {
			headers['Cookie'] = this.cookieJar;
		}

		switch (method) {
			// handle POST methods
			case 'POST':
				headers['Content-Type'] = 'application/x-www-form-urlencoded';
				postData = this.formatUrl({query: params}).substring(1);

				// remove params from URL
				params = {};
				break;

			// handle UPLOAD pseudo-type
			// @see http://onteria.wordpress.com/2011/05/30/multipartform-data-uploads-using-node-js-and-http-request/
			case 'UPLOAD':
				var boundary = Math.random().toString().substr(2);
				headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary;
				postData = '';

				// encode each field
				for (var fieldName in params) {
					var item = ["--" + boundary];

					if (typeof params[fieldName] === 'object') {
						item.push("Content-Disposition: form-data; name=\"" + fieldName + "\"; filename=\"" + params[fieldName].name + "\"");
						item.push("");
						item.push(params[fieldName].value);
					}
					else {
						item.push("Content-Disposition: form-data; name=\"" + fieldName + "\"");
						item.push("");

						// properly encode UTF8 in binary-safe POST data
						item.push(new Buffer(params[fieldName], 'utf8').toString('binary'));
					}

					postData += item.join("\r\n") + "\r\n";
				}

				postData += "--" + boundary + "--";

				// encode post data
				postData = new Buffer(postData, 'binary');

				// remove params from URL
				params = {};

				// upload will happen using POST method
				method = 'POST';
				break;
		}

		// @see http://nodejs.org/api/url.html
		var url = this.formatUrl({
			protocol: this.protocol,
			port: this.port,
			hostname: this.server,
			pathname: this.path + '/api.php',
			query: params
		});

		this.log('URL [' + method + ' / ' + actionName + ']: ' + url);

		// set proper payload size
		if (postData !== false) {
			headers['Content-Length'] = postData.length;
		}

		// form the request
		var req = this.http.request({
			host: this.proxy || this.server,
			port: this.port,
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
					info = data && data[actionName];
					next = data && data['query-continue'] && data['query-continue'][params.list];
				}
				catch(e) {
					throw 'Error parsing JSON response: ' + res.body;
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
		});

		req.on('error', function(e) {
			self.log('Socket error: ' + e.message + ' (' + e.code + ')');
			self.log(e.stack);
		});

		req.on('close', function(hadError) {
			if (hadError) {
				self.log('Socket closed due to an error!');
			}
		});

		// finish sending a request
		if (method === 'POST') {
			req.write(postData);
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
		fetchUrl: function(url, encoding) {
			var self = this;

			// add a request to the queue
			return addToQueue.call(this, function(promise) {
				self.log('Fetching ' + JSON.stringify(url) + '...');

				// parse URL provided as a string
				if (typeof url === 'string') {
					url = require('url').parse(url);
				}

				self.http.get(url, function(resp) {
					var page = '',
						chunks = 0;

					resp.setEncoding(encoding || 'utf8');

					resp.on("data", function(chunk) {
						page += chunk;
						chunks++;
					});

					resp.on('end', function() {
						self.log('Fetched ' + (page.length/1024).toFixed(2) + ' kB in ' + chunks + ' chunk(s)');

						promise.resolve(page);
					});
				}).on('error', function(e) {
					throw new Error('http.get failed with ' + e);
				});
			});
		}
	};

	module.exports = api;
