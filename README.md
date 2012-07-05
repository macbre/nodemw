nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

``` bash
  $ git clone https://github.com/macbre/nodemw.git`
```

## First script

An example script can be found in `/examples` directory.

``` bash
  $ cd examples
  $ node pagesInCategory.js
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

### logIn

Log-in using given credentials.

`bot.logIn(username, password, callback)`

### getPagesInCategory

Gets the list of pages in a given category

`bot.getPagesInCategory(category, callback)`

### getArticle

Gets article content and its meta data

`bot.getArticle(title, callback)`

### edit

Creates / edits an article

`bot.edit(title, content, summary, callback)`

### delete

Deletes an article

`bot.delete(title, reason, callback)`

### token

Returns token required for a number of MediaWiki API operations

`bot.token(title, action, callback)`


## TODO

* Use promise pattern instead of callbacks.
* Make a queue of requested actions and configure delays to avoid flooding the server with HTTP requests.
* Log to a file.
