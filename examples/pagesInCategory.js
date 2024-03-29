// @ts-check
/**
 * Example script getting pages from "Bosons" category on English Wikipedia
 *
 * @see http://en.wikipedia.org/wiki/Category:Bosons
 * @see http://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category%3ABosons&cmlimit=500&format=json
 */
"use strict";

const Bot = require("..");

const client = new Bot({
  server: "en.wikipedia.org",
  path: "/w",
});

client.getPagesInCategory("Sports_cars", (_, pages) => {
  client.log("Pages in category: %d", pages.length);
  console.log("%j", pages);

  pages.forEach((page) => {
    client.getArticle(page.title, (__, content) => {
      console.log(
        "%s: %s",
        page.title,
        content.slice(0, 75).replace(/\n/g, " "),
      );
    });
  });
});
