nodemw
======

MediaWiki API client written in node.js

## Requirements

* nodejs

## Instalation

`git clone https://github.com/macbre/nodemw.git`

## First script

An example script can be found in examples directory.

`cd examples`
`node pagesInCategory.js`

## API

### bot.logIn(username, password, callback)

### bot.getPagesInCategory(category, callback)

### bot.getArticle(title, callback)

### bot.edit(title, content, summary, callback)