nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

`git clone https://github.com/macbre/nodemw.git`

## First script

An example script can be found in `/examples` directory.

`cd examples`
`node pagesInCategory.js`

## API

The last parameter of each function in nodemw API is a callback which will be fired
when requested action is done.

### Log-in

`bot.logIn(username, password, callback)`

### Getting the list of pages in given category

`bot.getPagesInCategory(category, callback)`

### Getting article content and meta data

`bot.getArticle(title, callback)`

### Creating and editing article

`bot.edit(title, content, summary, callback)`

## TODO

* Use promise pattern instead of callbacks.
* Make a queue of requested actions and configure delays to avoid flooding the server with HTTP requests.
* Log to a file.