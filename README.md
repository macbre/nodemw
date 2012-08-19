nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

``` bash
git clone https://github.com/macbre/nodemw.git
```

## Features

* HTTP requests are stored in queue and performed in serial, there's no risk of flooding the server

## Where it's used

* Over 4000 edits on [Poznań Wiki](http://poznan.wikia.com) as [Pyrabot](http://poznan.wikia.com/wiki/Specjalna:Wkład/Pyrabot)

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
      server: 'en.wikipedia.org',  // host name of MediaWiki-powered site
      path: '/w',                  // path to api.php script
      debug: false,                // is more verbose when set to true
      username: 'foo',             // account to be used when logIn is called (optional)
      password: 'bar'              // password to be used when logIn is called (optional)
}
```

### bot.logIn(username, password, callback)

Log-in using given credentials - [read more](http://www.mediawiki.org/wiki/API:Login)

### bot.getCategories(prefix, callback)

Gets the list of all categories on a wiki

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

### bot.move(from, to, summary, callback)

Moves (aka renames) given article - [read more](http://www.mediawiki.org/wiki/API:Move)

### bot.getImages(callback)

Gets list of all images on a wiki

## TODO

* Use promise pattern instead of callbacks.
* Log to a file.
* Set [proper User Agent](http://meta.wikimedia.org/wiki/User-Agent_policy).