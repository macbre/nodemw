nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

`git clone https://github.com/macbre/nodemw.git`

## First script

An example script can be found in `/examples` directory.

``
cd examples
node pagesInCategory.js
``

## API

The last parameter of each function in nodemw API is a callback which will be fired
when requested action is done.

### Creating a bot instance

``
var bot = require('./lib/bot').bot;

var client = new bot({
	server: 'en.wikipedia.org',
	path: '/w',
	debug: false
});
``

### logIn

Log-in using given credentials.

`bot.logIn(username, password, callback)`

### getPagesInCategory

Gets the list of pages in given category

`bot.getPagesInCategory(category, callback)`

### getArticle

Gets article content and meta data

`bot.getArticle(title, callback)`

### edit

Creates / edits an article

`bot.edit(title, content, summary, callback)`

### delete

Deletes and article

`bot.delete(title, reason, callback)`

### token

Returns token required for a number of MediaWiki API operations

`bot.token(title, action, callback)`


## TODO

* Use promise pattern instead of callbacks.
* Make a queue of requested actions and configure delays to avoid flooding the server with HTTP requests.
* Log to a file.
