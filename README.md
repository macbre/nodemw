nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

``` bash
git clone https://github.com/macbre/nodemw.git
```

## First script

An example script can be found in `/examples` directory.

``` bash
cd examples
node pagesInCategory.js
```

## API

The last parameter of each function in nodemw API is a callback which will be fired
when the requested action is done.

### Creating a bot instance

``` js
  var bot = require('./lib/bot').bot;

  var client = new bot({
      server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
      path: '/w',                  // path to api.php script
      debug: false                 // is more verbose when set to true
  });

  client.getArticle('foo', function(data) {
      // ...
  });
```

### bot.logIn(username, password, callback)

Log-in using given credentials - [read more](http://www.mediawiki.org/wiki/API:Login)

### bot.getPagesInCategory(category, callback)

Gets the list of pages in a given category - [read more](http://www.mediawiki.org/wiki/API:Properties#revisions_.2F_rv)

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

## TODO

* Use promise pattern instead of callbacks.
* Make a queue of requested actions and configure delays to avoid flooding the server with HTTP requests.
* Log to a file.
* Add support for [move action](http://www.mediawiki.org/wiki/API:Move).
* Set [proper User Agent](http://meta.wikimedia.org/wiki/User-Agent_policy).