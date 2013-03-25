/**
 * Defines bot API
 */
	var api = require('./api'),
		fs = require('fs');

	// get the object being the first key/value entry of a given object
	var getFirstItem = function(object) {
		for(var key in object);
		return object[key];
	};

	// bot public API
	var bot = function(params) {
		var options;

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
		this.api = new api({
			protocol: protocol,
			port: options.port,
			server: options.server,
			path: options.path || '',
			proxy: options.proxy,
			debug: options.debug === true
		});

		this.version = this.api.version;

		// store options
		this.options = options;

		this.api.log('> nodemw v' + this.version + ' is ready');
	};

	bot.prototype = {
		logIn: function(username, password, callback /* or just callback */) {
			var self = this;

			// username and password params can be omitted
			if (typeof username !== 'string') {
				callback = username;

				// use data from config
				username = this.options.username;
				password = this.options.password;
			}

			this.api.log('> Obtaining login token...');

			// request a token
			this.api.call({
				action: 'login',
				lgname: username,
				lgpassword: password,
			}, function(data) {
				if (data.result == 'NeedToken') {
					var token = data.token;

					self.api.log('> Got token ' + token);

					// log in using a token
					self.api.call({
						action: 'login',
						lgname: username,
						lgpassword: password,
						lgtoken: token,
					}, function(data) {
						if (typeof data.lgusername !== 'undefined') {
							self.api.log('> Logged in as ' + data.lgusername);
							callback && callback(data);
						}
					}, 'POST');
				}
			}, 'POST');
		},

		getCategories: function(prefix, callback){
			if(typeof prefix === 'function') {
				callback = prefix;
			}
			this.api.call({
				action: 'query',
				list: 'allcategories',
				acprefix : prefix || '',
				aclimit: 5000
			}, function(data, next){
				var allCat = data.allcategories,
					categories = [],
					cat,
					i = 0;

				while(cat = allCat[i]) categories[i++] = cat['*'];

				callback && callback(categories, next && next.acfrom || false);
			})
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
				aulimit: 5000
			}, function(data){
				callback && callback(data && data.allusers || []);
			})
		},

		getPagesInCategory: function(category, callback) {
			category = 'Category:' + category;

			this.api.call({
				action: 'query',
				list: 'categorymembers',
				cmtitle: category,
				cmlimit: 5000
			}, function(data) {
				callback && callback(data && data.categorymembers || []);
			});
		},

		getPagesByPrefix: function(prefix, callback) {
			this.api.call({
				action: 'query',
				list: 'allpages',
				apprefix: prefix,
				aplimit: 5000
			}, function(data) {
				callback && callback(data && data.allpages || []);
			});
		},

		getArticle: function(title, callback) {
			var params = {
				action: 'query',
				prop: 'revisions',
				rvprop: 'content'
			};

			// both page ID or title can be provided
			if (typeof title === 'number') {
				params.pageids = title;
			}
			else {
				params.titles = title;
			}

			this.api.call(params).then(function(res) {
				var data = res.info,
					page = getFirstItem(data.pages),
					revision = page.revisions && page.revisions.shift(),
					content = revision && revision['*'];

				callback && callback(content);
			});
		},

		// get token required to perform a given action
		getToken: function(title, action, callback) {
			this.api.call({
				action: 'query',
				prop: 'info',
				intoken: action,
				titles: title
			}, function(data) {
				var page = getFirstItem(data.pages),
					token = page[ action + 'token' ];

				if (!token) {
					throw new Error('Can\'t get "' + action + '" token for "' + title + '" page!');
				}
				else {
					callback && callback(token);
				}
			});
		},

		edit: function(title, content, summary, callback) {
			var self = this;

			// @see http://www.mediawiki.org/wiki/API:Edit
			this.getToken(title, 'edit', function(token) {
				self.api.call({
					action: 'edit',
					title: title,
					text: content,
					bot: '',
					summary: summary,
					token: token
				}, function(data) {
					if (data.result && data.result === "Success") {
						callback && callback(data);
					}
					else {
						throw new Error('Edit failed');
					}
				}, 'POST');
			});
		},

		'delete': function(title, reason, callback) {
			var self = this;

			// @see http://www.mediawiki.org/wiki/API:Delete
			this.getToken(title, 'delete', function(token) {
				self.api.call({
					action: 'delete',
					title: title,
					reason: reason,
					token: token
				}, function(data) {
					if (data.title && data.reason) {
						callback && callback(data);
					}
					else {
						throw new Error('Delete failed');
					}
				}, 'POST');
			});
		},

		getUserContribs: function(options, callback){
			options = options || {};

			this.api.call({
				action: 'query',
				list: 'usercontribs',
				ucuser: options.user,
				ucstart: options.start,
				uclimit: 5000,
				ucnamespace: options.namespace || ''
			}, function(data, next) {
				callback && callback(data && data.usercontribs || [], next && next.ucstart || false);
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
			}, function(data) {
				if (data && data.userinfo) {
					callback && callback(data.userinfo);
				}
				else {
					throw new Error('userinfo failed');
				}
			});
		},

		move: function(from, to, summary, callback) {
			var self = this;

			// @see http://www.mediawiki.org/wiki/API:Move
			this.getToken(from, 'move', function(token) {
				self.api.call({
					action: 'move',
					from: from,
					to: to,
					bot: '',
					reason: summary,
					token: token
				}, function(data) {
					if (data.from && data.to && data.reason) {
						callback && callback(data);
					}
					else {
						throw new Error('Move failed');
					}
				}, 'POST');
			});
		},

		getImages: function(start, callback) {
			this.api.call({
				action: 'query',
				list: 'allimages',
				aifrom: start,
				ailimit: 5000
			}, function(data, next) {
				callback && callback(((data && data.allimages) || []), ((next && next.aifrom) || false));
			});
		},

		getImagesFromArticle: function(title, callback) {
			this.api.call({
				action: 'query',
				prop: 'images',
				titles: title
			}, function(data) {
				var page = getFirstItem(data && data.pages || []);
				callback && callback((page && page.images) || []);
			});
		},

		getImageUsage: function(filename, callback) {
			this.api.call({
				action: 'query',
				list: 'imageusage',
				iutitle: filename,
				iulimit: 5000
			}, function(data) {
				callback && callback((data && data.imageusage) || []);
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
			}, function(data) {
				var image = getFirstItem(data && data.pages || []),
					imageinfo = image && image.imageinfo && image.imageinfo[0];

				// process EXIF metadata into key / value structure
				if (imageinfo && imageinfo.metadata) {
					imageinfo.exif = {};

					imageinfo.metadata.forEach(function(entry) {
						imageinfo.exif[ entry.name ] = entry.value;
					});
				}

				callback && callback(imageinfo);
			});
		},

		expandTemplates: function(text, title, callback) {
			this.api.call({
				action: 'expandtemplates',
				text: text,
				title: title,
				generatexml: 1
			}, function(data, next, raw) {
				var xml = getFirstItem(raw.parsetree);
				callback && callback(xml);
			}, 'POST');
		},

		getRecentChanges: function(start, callback) {
			var props = [
				'title',
				'timestamp',
				'comments',
				'user',
				'flags',
				'sizes',
			];

			this.api.call({
				action: 'query',
				list: 'recentchanges',
				rcprop: props.join('|'),
				rcstart: start || '',
				rclimit: 5000
			}, function(data, next) {
				callback && callback(((data && data.recentchanges) || []), ((next && next.rcstart) || false));
			});
		},

		upload: function(filename, content, summary, callback) {
			var self = this;

			// @see http://www.mediawiki.org/wiki/API:Upload
			this.getToken('File:' + filename, 'edit', function(token) {
				self.api.log('Uploading ' + (content.length/1024).toFixed(2) + ' kB as File:' + filename + '...');

				self.api.call({
					action: 'upload',
					ignorewarnings: '',
					filename: filename,
					file: {
						name: filename,
						value: content
					},
					text: '',
					comment: summary,
					token: token
				}, function(data) {
					if (data && data.result && data.result === 'Success') {
						callback && callback(data);
					}
					else {
						throw new Error('Upload failed');
					}
				}, 'UPLOAD' /* fake method to set a proper content type for file uploads */);
			});
		},

		uploadByUrl: function(filename, url, summary, callback) {
			var self = this;

			// use binary-safe fetch
			this.api.fetchUrl(url, 'binary').then(function(content) {
				self.upload(filename, content, summary, callback);
			});
		},
		getExternalLinks: function (title, callback) {
				this.api.call({
					action: 'query',
					prop: 'extlinks',
					titles: title,
					ellimit: 5000
				}, function(data) {
					callback && callback((data && getFirstItem(data.pages).extlinks) || []);
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

		fetchUrl: function(url, callback) {
			return this.api.fetchUrl(url).then(callback);
		}
	};

	module.exports = bot;
