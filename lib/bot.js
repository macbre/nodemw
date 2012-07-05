/**
 * Defines bot API
 */
(function(exports) {

	var api = require('./api').api;

	var bot = function(options) {
		options = options || {};

		this.server = options.server;

		this.api = new api({
			server: options.server,
			path: options.path || '',
			proxy: options.proxy,
			debug: options.debug === true
		});
	};

	// get the object being the first key/value entry of a given object
	var getFirstItem = function(object) {
		for(var key in object);
		return object[key];
	};

	bot.prototype = {
		logIn: function(username, password, callback) {
			var self = this;

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
							callback(data);
						}
					}, 'POST');
				}
			}, 'POST');
		},

		getPagesInCategory: function(category, callback) {
			category = 'Category:' + category;

			this.api.call({
				action: 'query',
				list: 'categorymembers',
				cmtitle: category,
				cmlimit: 500
			}, function(data) {
				callback(data && data.categorymembers || []);
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

			this.api.call(params, function(data) {
				var page = getFirstItem(data.pages),
					revision = page.revisions && page.revisions.shift(),
					content = revision && revision['*'];

				callback(content);
			})
		},

		edit: function(title, content, summary, callback) {
			var self = this;

			// get edit token
			// @see http://www.mediawiki.org/wiki/API:Edit
			this.api.call({
				action: 'query',
				prop: 'info',
				intoken: 'edit',
				titles: title
			}, function(data) {
				var page = getFirstItem(data.pages),
					token = page.edittoken;

				if (!token) {
					throw 'Can\'t get edit token!';
				}

				self.api.call({
					action: 'edit',
					title: title,
					text: content,
					bot: '',
					summary: summary,
					token: token
				}, function(data) {
					if (data.result && data.result === "Success") {
						callback(data);
					}
					else {
						throw 'Edit failed';
					}
				}, 'POST');
			});
		}
	};

	exports.bot = bot;

})(exports);
