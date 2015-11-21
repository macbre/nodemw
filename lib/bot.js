/**
 * Defines bot API
 */
module.exports = (function() {
	'use strict';

	var Api = require('./api'),
		_ = require('underscore'),
		async = require('async'),
		fs = require('fs'),
		querystring = require('querystring');

	// the upper limit for bots (will be reduced by MW for users with a bot right)
	var API_LIMIT = 5000;

	// get the object being the first key/value entry of a given object
	var getFirstItem = function(obj) {
		var key = Object.keys(obj).shift();
		return obj[key];
	};

	// bot public API
	var bot = function(params) {
		var env = process.env,
			options;

		// read configuration from the file
		if (typeof params === 'string') {
			var configFile,
				configParsed;

			try {
				configFile = fs.readFileSync(params, 'utf-8');
				configParsed = JSON.parse(configFile);
			}
			catch(e) {
				throw new Error('Loading config failed: ' + e.message);
			}

			if (typeof configParsed === 'object') {
				options = configParsed;
			}
		}
		// configuration provided as an object
		else if (typeof params === 'object') {
			options = params;
		}

		if (!params) {
			throw new Error('No configuration was provided!');
		}

		this.protocol = options.protocol;
		this.server = options.server;

		var protocol = options.protocol || 'http';
		this.api = new Api({
			protocol: protocol,
			port: options.port,
			server: options.server,
			path: options.path || '',
			proxy: options.proxy,
			userAgent: options.userAgent,
			concurrency: options.concurrency,
			debug: (options.debug === true || env.DEBUG === '1')
		});

		this.version = this.api.version;

		// store options
		this.options = options;

		// in dry-run mode? (issue #48)
		this.dryRun = (options.dryRun === true || env.DRY_RUN === '1');

		if (this.dryRun) {
			this.log('Running in dry-run mode');
		}

		// bind provider-specific "namespaces"
		this.wikia.call = this.wikia.call.bind(this);
	};

	bot.prototype = {
		log: function() {
			this.api.info.apply(this.api, arguments);
		},

		logData: function(obj) {
			this.api.logger.data(JSON.stringify(obj, undefined, 2));
		},

		error: function() {
			this.api.error.apply(this.api, arguments);
		},

		getConfig: function(key, def) {
			return this.options[key] || def;
		},

		setConfig: function(key, val) {
			this.options[key] = val;
		},

		getRand: function() {
			return Math.random().toString().split('.').pop();
		},

		getAll: function(params, key, callback) {
			var self = this,
				res = [],
				// @see https://www.mediawiki.org/wiki/API:Query#Continuing_queries
				continueParams = {
					'continue': ''
				};

			async.whilst(
				function() {
					// run as long as there's more data
					return true;
				},
				function(callback) {
					self.api.call(_.extend(params, continueParams), function(err, data, next) {
						if (err) {
							callback(err);
						}
						else {
							// append batch data
							var batchData = (typeof key === 'function') ? key(data) : data[key];

							res = res.concat(batchData);

							// more pages?
							continueParams = next;
							callback(next ? null : true);
						}
					});
				},
				function(err) {
					if (err instanceof Error) {
						callback(err);
					}
					else {
						callback(null, res);
					}
				}
			);
		},

		logIn: function(username, password, callback /* or just callback */) {
			var self = this;

			// username and password params can be omitted
			if (typeof username !== 'string') {
				callback = username;

				// use data from config
				username = this.options.username;
				password = this.options.password;
			}

			this.log('Obtaining login token...');

			var logInCallback = function(err, data) {
				if (!err && typeof data.lgusername !== 'undefined') {
					self.log('Logged in as ' + data.lgusername);
					callback(null, data);
				}
				else {
					self.error('Logging in failed');
					self.error(data.result);
					callback(err || new Error('Logging in failed: ' + data.result));
				}
			};

			// request a token
			this.api.call({
				action: 'login',
				lgname: username,
				lgpassword: password
			}, function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				if (data.result === 'NeedToken') {
					var token = data.token;

					self.log('Got token ' + token);

					// log in using a token
					self.api.call({
						action: 'login',
						lgname: username,
						lgpassword: password,
						lgtoken: token
					}, logInCallback, 'POST');
				} else {
					logInCallback(err, data);
				}
			}, 'POST');
		},

		getCategories: function(prefix, callback){
			if(typeof prefix === 'function') {
				callback = prefix;
			}

			this.getAll(
				{
					action: 'query',
					list: 'allcategories',
					acprefix : prefix || '',
					aclimit: API_LIMIT
				},
				function(data){
					return data.allcategories.map(function(cat) {
						return cat['*'];
					});
				},
				callback
			);
		},

		getUsers: function(data, callback){
			if(typeof data === 'function') {
				callback = data;
			}

			data = data || {};

			this.api.call({
				action: 'query',
				list: 'allusers',
				auprefix : data.prefix || '',
				auwitheditsonly: data.witheditsonly || false,
				aulimit: API_LIMIT
			}, function(err, data){
				callback(err, data && data.allusers || []);
			});
		},

		getAllPages: function(callback) {
			this.log("Getting all pages...");
			this.getAll(
				{
					action: 'query',
					list: 'allpages',
					apfilterredir: 'nonredirects', // do not include redirects
					aplimit: API_LIMIT
				},
				'allpages',
				callback
			);
		},

		getPagesInCategory: function(category, callback) {
			category = 'Category:' + category;
			this.log("Getting pages from " + category + "...");

			this.getAll(
				{
					action: 'query',
					list: 'categorymembers',
					cmtitle: category,
					cmlimit: API_LIMIT
				},
				'categorymembers',
				callback
			);
		},

		getPagesInNamespace: function(namespace, callback) {
			this.log("Getting pages in namespace " + namespace);

			this.getAll(
				{
					action: 'query',
					list: 'allpages',
					apnamespace: namespace,
					apfilterredir: 'nonredirects', // do not include redirects
					aplimit: API_LIMIT
				},
				'allpages',
				callback
			);
		},

		getPagesByPrefix: function(prefix, callback) {
			this.log("Getting pages by " + prefix + " prefix...");

			this.api.call({
				action: 'query',
				list: 'allpages',
				apprefix: prefix,
				aplimit: API_LIMIT
			}, function(err, data) {
				callback(err, data && data.allpages || []);
			});
		},

		getArticle: function(title, callback) {
			var params = {
				action: 'query',
				prop: 'revisions',
				rvprop: 'content',
				rand: this.getRand()
			};

			// both page ID or title can be provided
			if (typeof title === 'number') {
				this.log("Getting content of article #" + title + "...");
				params.pageids = title;
			}
			else {
				this.log("Getting content of " + title + "...");
				params.titles = title;
			}

			this.api.call(params, function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				var page = getFirstItem(data.pages),
					revision = page.revisions && page.revisions.shift(),
					content = revision && revision['*'];

				callback(null, content);
			});
		},

		getArticleRevisions: function(title, callback) {
			var params = {
				action: 'query',
				prop: 'revisions',
				rvprop: ['ids', 'timestamp', 'size', 'flags', 'comment', 'user'].join('|'),
				rvdir: 'newer', // order by timestamp asc
				rvlimit: API_LIMIT
			};

			// both page ID or title can be provided
			if (typeof title === 'number') {
				this.log("Getting revisions of article #" + title + "...");
				params.pageids = title;
			}
			else {
				this.log("Getting revisions of " + title + "...");
				params.titles = title;
			}

			this.getAll(
				params,
				function(batch) {
					var page = getFirstItem(batch.pages);
					return page.revisions;
				},
				callback
			);
		},

		getArticleCategories: function(title, callback) {
			this.api.call({
				action: 'query',
				prop: 'categories',
				titles: title
			}, function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				if(data === null)
				{
					callback(new Error('"'+title+'" page does not exist'));
					return;
				}

				var page = getFirstItem(data.pages);

				callback(
					null,
					(page.categories || []).map(function(cat) {
						// { ns: 14, title: 'Kategoria:XX wiek' }
						return cat.title;
					})
				);
			});
		},

		search: function(keyword, callback) {
			var params = {
				action: 'query',
				list: 'search',
				srsearch: keyword,
				srprop: 'timestamp'
			};

			this.api.call(params, function(err, data) {
				callback(err, !err && data && data.search);
			});
		},

		// get token required to perform a given action
		getToken: function(title, action, callback) {
			this.log("Getting " + action + " token (for " + title + ")...");

			this.api.call({
				action: 'query',
				prop: 'info',
				intoken: action,
				titles: title
			}, function(err, data) {
				if (err) {
					callback(err);
					return;
				}

				var page = getFirstItem(data.pages),
					token = page[ action + 'token'];

				if (!token) {
					err = new Error('Can\'t get "' + action + '" token for "' + title + '" page!');
					token = undefined;
				}

				callback(err, token);
			});
		},

		edit: function(title, content, summary, callback) {
			var self = this;

			if (this.dryRun) {
				callback(new Error('In dry-run mode'));
				return;
			}

			// @see http://www.mediawiki.org/wiki/API:Edit
			this.getToken(title, 'edit', function(err, token) {
				if (err) {
					callback(err);
					return;
				}

				self.log("Editing '%s' with a summary '%s'...", title, summary);

				self.api.call({
					action: 'edit',
					title: title,
					text: content,
					bot: '',
					summary: summary,
					token: token
				}, function(err, data) {
					if (!err && data.result && data.result === "Success") {
						self.log("Rev #%d created for '%s'", data.newrevid, data.title);
						callback(null, data);
					}
					else {
						callback(new Error('Edit failed: ' + err));
					}
				}, 'POST');
			});
		},

		'delete': function(title, reason, callback) {
			var self = this;

			if (this.dryRun) {
				callback(new Error('In dry-run mode'));
				return;
			}

			// @see http://www.mediawiki.org/wiki/API:Delete
			this.getToken(title, 'delete', function(err, token) {
				if (err) {
					callback(err);
					return;
				}

				self.log("Deleting '%s' because '%s'...", title, reason);

				self.api.call({
					action: 'delete',
					title: title,
					reason: reason,
					token: token
				}, function(err, data) {
					if (!err && data.title && data.reason) {
						callback(null, data);
					}
					else {
						callback(err);
					}
				}, 'POST');
			});
		},

		purge: function(titles, callback) {
			// @see https://www.mediawiki.org/wiki/API:Purge
			var self = this;

			if (this.dryRun) {
				callback(new Error('In dry-run mode'));
				return;
			}

			var params = {
				action: 'purge'
			};

			if (typeof titles === 'string' && titles.indexOf('Category:') === 0) {
				// @see https://docs.moodle.org/archive/pl/api.php?action=help&modules=purge
				// @see https://docs.moodle.org/archive/pl/api.php?action=help&modules=query%2Bcategorymembers
				// since MW 1.21 - @see https://github.com/wikimedia/mediawiki/commit/62216932c197f1c248ca2d95bc230f87a79ccd71
				this.log("Purging all articles in category '%s'...", titles);
				params.generator = 'categorymembers';
				params.gcmtitle = titles;
			}
			else {
				// cast a single item to an array
				titles = Array.isArray(titles) ? titles : [titles];

				// both page IDs or titles can be provided
				if (typeof titles[0] === 'number') {
					this.log("Purging the list of article IDs: #%s...", titles.join(', #'));
					params.pageids = titles.join('|');
				}
				else {
					this.log("Purging the list of articles: '%s'...", titles.join("', '"));
					params.titles = titles.join('|');
				}
			}

			this.api.call(
				params,
				function(err, data) {
					if (!err) {
						data.forEach(function(page) {
							if (typeof page.purged !== 'undefined') {
								self.log('Purged "%s"', page.title);
							}
						});
					}

					callback(err, data);
				},
				'POST'
			);
		},

		getUserContribs: function(options, callback){
			options = options || {};

			this.api.call({
				action: 'query',
				list: 'usercontribs',
				ucuser: options.user,
				ucstart: options.start,
				uclimit: API_LIMIT,
				ucnamespace: options.namespace || ''
			}, function(err, data, next) {
				callback(err, data && data.usercontribs || [], next && next.ucstart || false);
			});
		},

		whoami: function(callback) {
			// @see http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui
			var props =[
				'groups',
				'rights',
				'ratelimits',
				'editcount',
				'realname',
				'email'
			];

			this.api.call({
				action: 'query',
				meta: 'userinfo',
				uiprop: props.join('|')
			}, function(err, data) {
				if (!err && data && data.userinfo) {
					callback(null, data.userinfo);
				}
				else {
					callback(err);
				}
			});
		},

		move: function(from, to, summary, callback) {
			var self = this;

			if (this.dryRun) {
				callback(new Error('In dry-run mode'));
				return;
			}

			// @see http://www.mediawiki.org/wiki/API:Move
			this.getToken(from, 'move', function(err, token) {
				if (err) {
					callback(err);
					return;
				}

				self.log("Moving '%s' to '%s' because '%s'...", from, to, summary);

				self.api.call({
					action: 'move',
					from: from,
					to: to,
					bot: '',
					reason: summary,
					token: token
				}, function(err, data) {
					if (!err && data.from && data.to && data.reason) {
						callback(null, data);
					}
					else {
						callback(err);
					}
				}, 'POST');
			});
		},

		getImages: function(start, callback) {
			this.api.call({
				action: 'query',
				list: 'allimages',
				aifrom: start,
				ailimit: API_LIMIT
			}, function(err, data, next) {
				callback(err, ((data && data.allimages) || []), ((next && next.aifrom) || false));
			});
		},

		getImagesFromArticle: function(title, callback) {
			this.api.call({
				action: 'query',
				prop: 'images',
				titles: title
			}, function(err, data) {
				var page = getFirstItem(data && data.pages || []);
				callback(err, (page && page.images) || []);
			});
		},

		getImageUsage: function(filename, callback) {
			this.api.call({
				action: 'query',
				list: 'imageusage',
				iutitle: filename,
				iulimit: API_LIMIT
			}, function(err, data) {
				callback(err, (data && data.imageusage) || []);
			});
		},

		getImageInfo: function(filename, callback) {
			var props = [
				'timestamp',
				'user',
				'metadata',
				'size',
				'url'
			];

			this.api.call({
				action: 'query',
				titles: filename,
				prop: 'imageinfo',
				iiprop: props.join('|')
			}, function(err, data) {
				var image = getFirstItem(data && data.pages || []),
					imageinfo = image && image.imageinfo && image.imageinfo[0];

				// process EXIF metadata into key / value structure
				if (!err && imageinfo && imageinfo.metadata) {
					imageinfo.exif = {};

					imageinfo.metadata.forEach(function(entry) {
						imageinfo.exif[ entry.name ] = entry.value;
					});
				}

				callback(err, imageinfo);
			});
		},

		getLog: function(type, start, callback) {
			this.api.call({
				action: 'query',
				list: 'logevents',
				letype: type,
				lestart: start,
				lelimit: API_LIMIT
			}, function(err, data, next) {
				if (next && next.lecontinue) {
					// 20150101124329|22700494
					next = next.lecontinue.split('|').shift();
				}

				callback(err, ((data && data.logevents) || []), next);
			});
		},

		expandTemplates: function(text, title, callback) {
			this.api.call({
				action: 'expandtemplates',
				text: text,
				title: title,
				generatexml: 1
			}, function(err, data, next, raw) {
				var xml = getFirstItem(raw.parsetree);
				callback(err, xml);
			}, 'POST');
		},

		parse: function(text, title, callback) {
			this.api.call({
				action: 'parse',
				text: text,
				title: title,
				contentmodel: 'wikitext',
				generatexml: 1
			}, function(err, data, next, raw) {
				if (err) {
					callback(err);
					return;
                                }
				var xml = getFirstItem(raw.parse.text);
				var images = raw.parse.images;
				callback(err, xml, images);
			}, 'POST');
		},

		getRecentChanges: function(start, callback) {
			var props = [
				'title',
				'timestamp',
				'comments',
				'user',
				'flags',
				'sizes'
			];

			this.api.call({
				action: 'query',
				list: 'recentchanges',
				rcprop: props.join('|'),
				rcstart: start || '',
				rclimit: API_LIMIT
			}, function(err, data, next) {
				callback(err, ((data && data.recentchanges) || []), ((next && next.rcstart) || false));
			});
		},

		getSiteInfo: function(props, callback) {
			// @see http://www.mediawiki.org/wiki/API:Siteinfo
			if (typeof props === 'string') {
				props = [props];
			}

			this.api.call({
				action: 'query',
				meta: 'siteinfo',
				siprop: props.join('|')
			}, function(err, data) {
				callback(err, data);
			});
		},

		getSiteStats: function(callback) {
			var prop = 'statistics';

			this.getSiteInfo(prop, function(err, info) {
				callback(err, info && info[prop]);
			});
		},

		getQueryPage: function(queryPage, callback) {
			// @see http://www.mediawiki.org/wiki/API:Querypage
			this.api.call({
				action: 'query',
				list: 'querypage',
				qppage: queryPage,
				qplimit: API_LIMIT
			}, function(err, data) {
				if (!err && data && data.querypage) {
					this.log('%s data was generated %s', queryPage, data.querypage.cachedtimestamp);
					callback(null, data.querypage.results || []);
				}
				else {
					callback(err, []);
				}
			}.bind(this));
		},

		upload: function(filename, content, extraParams, callback) {
			var self = this,
				params = {
					action: 'upload',
					ignorewarnings: '',
					filename: filename,
					file: (typeof content === 'string') ? new Buffer(content, 'binary') : content,
					text: ''
				},
				key;

			if (this.dryRun) {
				callback(new Error('In dry-run mode'));
				return;
			}

			if (typeof extraParams === 'object') {
				params = _.extend(params, extraParams);
			}
			else { // it's summary (comment)
				params.comment = extraParams;
			}

			// @see http://www.mediawiki.org/wiki/API:Upload
			this.getToken('File:' + filename, 'edit', function(err, token) {
				if (err) {
					callback(err);
					return;
				}

				self.log('Uploading %s kB as File:%s...', (content.length/1024).toFixed(2), filename);

				params.token = token;
				self.api.call(params, function(err, data) {
					if (data && data.result && data.result === 'Success') {
						self.log('Uploaded as <%s>', data.imageinfo.descriptionurl);
						callback(null, data);
					}
					else {
						callback(err);
					}
				}, 'UPLOAD' /* fake method to set a proper content type for file uploads */);
			});
		},

		uploadByUrl: function(filename, url, summary, callback) {
			var self = this;

			this.api.fetchUrl(url, function(error, content) {
				if (error) {
					callback(error, content);
					return;
				}

				self.upload(filename, content, summary, callback);
			}, 'binary' /* use binary-safe fetch */);
		},
		getExternalLinks: function (title, callback) {
				this.api.call({
					action: 'query',
					prop: 'extlinks',
					titles: title,
					ellimit: API_LIMIT
				}, function(err, data) {
					callback(err, (data && getFirstItem(data.pages).extlinks) || []);
			});
		},

		getBacklinks: function(title, callback) {
			this.api.call({
				action: 'query',
				list: 'backlinks',
				blnamespace: 0,
				bltitle: title,
				bllimit: API_LIMIT
			}, function(err, data) {
				callback(err, (data && data.backlinks) || []);
			});
		},

		// utils section
		getTemplateParamFromXml: function(tmplXml, paramName) {
			paramName = paramName.
				trim().
				replace('-', '\\-');

			var re = new RegExp('<part><name>' + paramName + '\\s*<\/name>=<value>([^>]+)<\/value>'),
				matches = tmplXml.match(re);

			return matches && matches[1].trim() || false;
		},

		fetchUrl: function(url, callback, encoding) {
			this.api.fetchUrl(url, callback, encoding);
		},

		diff: function(prev, current) {
			var colors = require('ansicolors'),
				jsdiff = require('diff'),
				diff = jsdiff.diffChars(prev, current),
				res = '';

			diff.forEach(function(part) {
				var color = part.added ? 'green' :
					part.removed ? 'red' : 'brightBlack';

				res += colors[color](part.value);
			});

			return res;
		}
	};

	// Wikia-specific methods (issue #56)
	// @see http://www.wikia.com/api/v1
	bot.prototype.wikia = {
		API_PREFIX: '/api/v1',

		call: function(path, params, callback) {
			var url = this.api.protocol + '://' + this.api.server + this.wikia.API_PREFIX + path;

			if (typeof params === 'function') {
				callback = params;
				this.log('Wikia API call:', path);
			}
			else if (typeof params === 'object') {
				url += '?' + querystring.stringify(params);
				this.log('Wikia API call:', path, params);
			}

			this.fetchUrl(url, function(err, res) {
				var data = JSON.parse(res);
				callback(err, data);
			});
		},

		getWikiVariables: function(callback) {
			this.call('/Mercury/WikiVariables', function(err, res) {
				callback(err, res.data);
			});
		},

		getUser: function(ids, callback) {
			this.getUsers([ids], function(err, users) {
				callback(err, users && users[0]);
			});
		},

		getUsers: function(ids, callback) {
			this.call('/User/Details', {
				ids: ids.join(','),
				size: 50
			},function(err, res) {
				callback(err, res.items);
			});
		}
	};

	return bot;
}());
