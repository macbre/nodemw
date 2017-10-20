nodemw
======

[MediaWiki API](http://www.mediawiki.org/wiki/API:Main_page) client written in node.js

[![NPM version](https://badge.fury.io/js/nodemw.png)](http://badge.fury.io/js/nodemw)
[![Build Status](https://api.travis-ci.org/macbre/nodemw.svg?branch=devel)](http://travis-ci.org/macbre/nodemw)

[![Download stats](https://nodei.co/npm/nodemw.png?downloads=true&downloadRank=true)](https://nodei.co/npm/nodemw/)

## Requirements

* node.js

## Installation

### Using npm

``` bash
npm install nodemw
```

Or [Download the latest stable version](https://github.com/macbre/nodemw/releases) via GitHub.

### Development version

``` bash
git clone https://github.com/macbre/nodemw.git
```

## Features

* HTTP requests are stored in the queue and performed in parallel with limited number of "threads" (i.e. there's no risk of flooding the server)
* articles creation / edit / move / delete
* file uploads (using given content or via provided URL)
* Special:Log processing
* listing articles in categories
* and much more

## Where it's used

* Over 10k edits on [Poznań Wiki](http://poznan.wikia.com) as [Pyrabot](http://poznan.wikia.com/wiki/Specjalna:Wkład/Pyrabot) - [scripts repository](https://github.com/macbre/pyrabot)

## First script

An example script can be found in `/examples` directory.

``` bash
cd examples
node pagesInCategory.js
```

You can enter **debug mode** by setting `DEBUG` enviromental variable:

```bash
DEBUG=1 node examples/pagesInCategory.js
```

You can enter **dry-run mode** (all "write" operations like edits and uploads will be disabled) by setting `DRY_RUN` environmental variable (or `dryRun` entry in the config):

```bash
DRY_RUN=1 node examples/pagesInCategory.js
```

## Running unit tests

```bash
npm test
```

## How to use it?

### Creating a bot instance

``` js
  var bot = require('nodemw');

  // pass configuration object
  var client = new bot({
    protocol: 'https',           // Wikipedia now enforces HTTPS
    server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
    path: '/w',                  // path to api.php script
    debug: false                 // is more verbose when set to true
  });

  client.getArticle('foo', function(err, data) {
    // error handling
    if (err) {
      console.error(err);
      return;
    }

    // ...
  });
```

#### Config file

nodemw can use config files as well as objects directly provided to ``bot`` object constructor.

``` js
 // read config from external file
 var client = new bot('config.js');
```

Config file is a JSON-encoded object with the following fields (see ``/examples/config-DIST.js`` file):

``` js
{
      "protocol": "https",  // default to 'http'
      "server": "en.wikipedia.org",  // host name of MediaWiki-powered site
      "path": "/w",                  // path to api.php script
      "debug": false,                // is more verbose when set to true
      "username": "foo",             // account to be used when logIn is called (optional)
      "password": "bar",             // password to be used when logIn is called (optional)
      "domain" : "auth.bar.net",     // domain to be used when logIn is called (optional)
      "userAgent": "Custom UA",      // define custom bot's user agent
      "concurrency": 5               // how many API requests can be run in parallel (defaults to 3)
}
```
## Making direct API calls

nodemw allows you make direct calls to MediaWiki API ([example querying Semantic MediaWiki API](https://github.com/macbre/nodemw/blob/master/examples/smw.js)):

``` js
var bot = require('nodemw'),
  client = new bot({
		server: 'semantic-mediawiki.org',
		path: '/w'
	}),
	params = {
		action: 'ask',
		query: '[[Modification date::+]]|?Modification date|sort=Modification date|order=desc'
	};

client.api.call(params /* api.php parameters */, function(err /* Error instance or null */, info /* processed query result */, next /* more results? */, data /* raw data */) {
	console.log(data && data.query && data.query.results);
});
```

## Bot methods

The last parameter of each function in nodemw API is a callback which will be fired when the requested action is done.

**Callbacks use node.js style** - ``err`` is always passed as the first argument.

### bot.logIn(username, password, callback)

Log-in using given credentials - [read more](http://www.mediawiki.org/wiki/API:Login)

### bot.getCategories(prefix, callback)

Gets the list of all categories on a wiki

### bot.getAllPages(callback)

Gets the list of all pages from the main namespace (excludes redirects) - [read more](https://www.mediawiki.org/wiki/API:Allpages)

### bot.getPagesInCategory(category, callback)

Gets the list of pages in a given category - [read more](http://www.mediawiki.org/wiki/API:Properties#revisions_.2F_rv)

### bot.getPagesInNamespace(namespace, callback)

Gets the list of pages in a given namespace - [read more](http://www.mediawiki.org/wiki/API:Allpages)

### bot.getPagesByPrefix(prefix, callback)

Gets the list of pages by a given prefix - [read more](https://www.mediawiki.org/wiki/API:Allpages)

### bot.getPagesTranscluding(page, callback)

Gets the list of pages that transclude the given pages - [read more](https://www.mediawiki.org/wiki/API:Transcludedin)

### bot.getArticle(title, [redirect,] callback)

Gets article content and redirect info - [read more](https://www.mediawiki.org/wiki/API:Query#Resolving_redirects)

### bot.getArticleRevisions(title, callback)

Gets all revisions of a given article - [read more](http://www.mediawiki.org/wiki/API:Revisions)

### bot.getArticleCategories(title, callback)

Gets all categories a given article is in - [read more](http://www.mediawiki.org/wiki/API:Property/Categories)

### bot.edit(title, content, summary, minor, callback)

Creates / edits an article (and mark the edit as minor if *minor* is set to true) - [read more](http://www.mediawiki.org/wiki/API:Edit)

### bot.append(title, content, summary, callback)

Adds given content to the end of the page - [read more](http://www.mediawiki.org/wiki/API:Edit)

### bot.prepend(title, content, summary, callback)

Adds given content to the beginning of the page - [read more](http://www.mediawiki.org/wiki/API:Edit)

### bot.addFlowTopic(title, topic, content, callback)

Add a Flow topic - [read more](http://www.mediawiki.org/wiki/API:Flow)

### bot.delete(title, reason, callback)

Deletes an article - [read more](http://www.mediawiki.org/wiki/API:Delete)

### bot.purge(titles, callback)

Purge a given list of articles (titles or page IDs can be provided) - [read more](https://www.mediawiki.org/wiki/API:Purge)

> By providing `Category:Foo` as `titles` argument you can purge all pages in a given category (available since [MW 1.21](https://github.com/wikimedia/mediawiki/commit/62216932c197f1c248ca2d95bc230f87a79ccd71))

### bot.sendEmail(username, subject, text, callback)

Send an email to an user - [read more](http://www.mediawiki.org/wiki/API:Email)

### bot.getToken(title, action, callback)

Returns token required for a number of MediaWiki API operations - [read more](https://www.mediawiki.org/wiki/API:Tokens_(action)) / [for MW 1.24+](https://www.mediawiki.org/wiki/API:Tokens)

### bot.whoami(callback)

Gets information about current bot's user (including rights and rate limits) - [read more](http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui)

### bot.whois(username, callback)

Gets information about a specific user (including rights, current block, groups) - [read more](https://www.mediawiki.org/wiki/API:Users)

### bot.whoare(usernames, callback)

Gets information about specific users (including rights, current block, groups) - [read more](https://www.mediawiki.org/wiki/API:Users)

### bot.createAccount(username, password, callback)

Create account using given credentials - [read more](https://www.mediawiki.org/wiki/API:Account_creation)

### bot.move(from, to, summary, callback)

Moves (aka renames) given article - [read more](http://www.mediawiki.org/wiki/API:Move)

### bot.getImages(callback)

Gets list of all images on a wiki

### bot.getImageUsage(filename, callback)

Gets list of all articles using given image

### bot.getImagesFromArticle(title, callback)

Get list of all images that are used on a given page - [read more](http://www.mediawiki.org/wiki/API:Properties#images_.2F_im)

### bot.getImageInfo(filename, callback)

Gets metadata (including uploader, size, dimensions and EXIF data) of given image

### bot.getLog(type, start, callback)

Get entries form Special:Log - [read more](http://www.mediawiki.org/wiki/API:Logevents)

### bot.expandTemplates(content, title, callback)

Returns XML with preprocessed wikitext - [read more](https://www.mediawiki.org/wiki/API:Parsing_wikitext#expandtemplates)

### bot.parse(content, title, callback)

Returns parsed wikitext - [read more](https://www.mediawiki.org/wiki/API:Parsing_wikitext#parse)

### bot.fetchUrl(url, callback)

Makes a GET request to provided resource and returns its content.

### bot.getRecentChanges(start, callback)

Returns entries from recent changes (starting from a given point)

### bot.getSiteInfo(props, callback)

Returns site information entries - [read more](http://www.mediawiki.org/wiki/API:Siteinfo)

### bot.getSiteStats(props, callback)

Returns site statistics (number of articles, edits etc) - [read more](http://www.mediawiki.org/wiki/API:Siteinfo)

### bot.getMediaWikiVersion(callback)

Returns the version of MediaWiki given site uses - [read more](http://www.mediawiki.org/wiki/API:Siteinfo)

### client.getQueryPage(queryPage, callback)

Returns entries from [QueryPage-based special pages](http://www.mediawiki.org/wiki/API:Querypage)

### bot.upload(filename, content, summary _/* or extraParams */_, callback)

Uploads a given raw content as a File:[filename] - [read more](http://www.mediawiki.org/wiki/API:Upload)

### bot.uploadByUrl(filename, url, summary _/* or extraParams */_, callback)

Uploads a given external resource as a File:[filename]

### bot.uploadVideo(fileName, url, callback)

Uploads a given video as a File:[filename] (Wikia-specific API)

### bot.getTemplateParamFromXml(tmplXml, paramName)

Gets a value of a given template parameter from article's preparsed content (see expandTemplates)

### bot.getExternalLinks(title, callback)

Gets all external links used in article

### bot.getBacklinks(title, callback)

Gets all articles that links to given article

### bot.search(query, callback)

Performs a search

## Helpers

### bot.getConfig(key, def)

Gets config entry value (returns ``def`` value if not found)

### bot.setConfig(key, val)

Sets config entry value

### bot.diff(old, current)

Returns a diff colored using ANSI colors (powered by [diff](https://www.npmjs.com/package/diff))

## [Wikia-specific](http://www.wikia.com/api/v1) bot methods

> They're grouped in `bot.wikia` "namespace".

### bot.wikia.getWikiVariables(callback)

Get wiki-specific settings (like ThemeDesigner colors and hubs).

### bot.wikia.getUser(userId, callback)

Get information (avatar, number of edits) about a given user

### bot.wikia.getUsers(userIds, callback)

Get information (avatar, number of edits) about a given set of users (by their IDs)
