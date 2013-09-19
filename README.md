nodemw
======

MediaWiki API client written in node.js

[![NPM version](https://badge.fury.io/js/nodemw.png)](http://badge.fury.io/js/nodemw)
[![Build Status](https://secure.travis-ci.org/macbre/nodemw.png)](http://travis-ci.org/macbre/nodemw)

## Requirements

* nodejs

## Dependencies

* [vows](http://vowsjs.org/)
* [request](https://github.com/mikeal/request)

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

* HTTP requests are stored in queue and performed in serial, there's no risk of flooding the server
* nodemw core uses promise pattern powered by [deferred-js library](https://github.com/heavylifters/deferred-js)
* nodemw supports articles creation / edit / move / delete, file uploads (using given content or via provided URL)

## Where it's used

* Over 10k edits on [Poznań Wiki](http://poznan.wikia.com) as [Pyrabot](http://poznan.wikia.com/wiki/Specjalna:Wkład/Pyrabot) - [scripts repository](https://github.com/macbre/pyrabot)

## First script

An example script can be found in `/examples` directory.

``` bash
cd examples
node pagesInCategory.js
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
      server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
      path: '/w',                  // path to api.php script
      debug: false                // is more verbose when set to true
  });

  client.getArticle('foo', function(data) {
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
      "server": "en.wikipedia.org",  // host name of MediaWiki-powered site
      "path": "/w",                  // path to api.php script
      "debug": false,                // is more verbose when set to true
      "username": "foo",             // account to be used when logIn is called (optional)
      "password": "bar"              // password to be used when logIn is called (optional)
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

client.api.call(params /* api.php parameters */, function(info /* processed query result */, next, data /* raw data */) {
	console.log(data && data.query && data.query.results);
});
```

## Bot methods

The last parameter of each function in nodemw API is a callback which will be fired when the requested action is done.

### bot.logIn(username, password, callback)

Log-in using given credentials - [read more](http://www.mediawiki.org/wiki/API:Login)

### bot.getCategories(prefix, callback)

Gets the list of all categories on a wiki

### bot.getPagesInCategory(category, callback)

Gets the list of pages in a given category - [read more](http://www.mediawiki.org/wiki/API:Properties#revisions_.2F_rv)

### bot.getPagesByPrefix(prefix, callback)

Gets the list of pages by a given prefix - [read more](https://www.mediawiki.org/wiki/API:Allpages)

### bot.getArticle(title, callback)

Gets article content and its meta data - [read more](http://www.mediawiki.org/wiki/API:Properties#revisions_.2F_rv)

### bot.edit(title, content, summary, callback)

Creates / edits an article - [read more](http://www.mediawiki.org/wiki/API:Edit)

### bot.delete(title, reason, callback)

Deletes an article - [read more](http://www.mediawiki.org/wiki/API:Delete)

### bot.token(title, action, callback)

Returns token required for a number of MediaWiki API operations

### bot.whoami(callback)

Gets information about current bot's user (including rights and rate limits) - [read more](http://www.mediawiki.org/wiki/API:Meta#userinfo_.2F_ui)

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

### bot.expandTemplates(content, title, callback)

Returns XML with preprocessed wikitext - [read more](https://www.mediawiki.org/wiki/API:Parsing_wikitext#expandtemplates)

### bot.fetchUrl(url, callback)

Makes a GET request to provided resource and returns its content.

### bot.getRecentChanges(start, callback)

Returns entries from recent changes (starting from a given point)

### bot.getRecentChanges(start, callback)

Returns entries from recent changes (starting from a given point)

### client.getQueryPage(queryPage, callback)

Returns entries from [QueryPage-based special pages](http://www.mediawiki.org/wiki/API:Querypage)

### bot.upload(filename, content, summary _/* or extraParams */_, callback)

Uploads a given raw content as a File:[filename] - [read more](http://www.mediawiki.org/wiki/API:Upload)

### bot.uploadByUrl(filename, url, summary _/* or extraParams */_, callback)

Uploads a given external resource as a File:[filename]

### bot.getTemplateParamFromXml(tmplXml, paramName)

Gets a value of a given template parameter from article's preparsed content (see expandTemplates)

### bot.getExternalLinks(title, callback)

Gets all external links used in article

### bot.getBacklinks(title, callback)

Gets all articles that links to given article

## Helpers

### bot.getConfig(key, def)

Gets config entry value (returns ``def`` value if not found)

### bot.setConfig(key, val)

Sets config entry value
