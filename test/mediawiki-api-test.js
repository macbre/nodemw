"use strict";

const { describe, it, expect } = require("@jest/globals");
const Bot = require("..");

describe("MediaWiki API", () => {
  const client = new Bot({
    server: "en.wikipedia.org",
    path: "/w",
    userAgent: "nodemw/tests",
  });
  const TEST_ARTICLE = "Albert Einstein";
  const TEST_ARTICLE_REDIRECT = "Einstein";

  it("siteinfo()", (done) => {
    client.getSiteInfo(["general"], (err, info) => {
      expect(err).toBeNull();
      expect(info.general).toBeDefined();
      expect(info.general.lang).toEqual("en");
      done();
    });
  }, 5000);

  it("getArticle()", (done) => {
    client.getArticle(TEST_ARTICLE, (err, article) => {
      expect(err).toBeNull();
      expect(article).toContain("''Albert Einstein''");

      done();
    });
  }, 5000);

  it("getArticle() handles a redirects", (done) => {
    client.getArticle(TEST_ARTICLE_REDIRECT, (err, article, redirectInfo) => {
      expect(err).toBeNull();
      expect(redirectInfo).toBeUndefined();
      expect(article).toContain("#REDIRECT [[Albert Einstein]]");

      done();
    });
  }, 5000);

  it("getArticle() follows a redirects", (done) => {
    const followRedirects = true;

    client.getArticle(
      TEST_ARTICLE_REDIRECT,
      followRedirects,
      (err, article, redirectInfo) => {
        expect(err).toBeNull();
        expect(redirectInfo).toStrictEqual({
          from: "Einstein",
          to: "Albert Einstein",
        });
        expect(article).toContain("''Albert Einstein''");

        done();
      },
    );
  }, 5000);

  it("getArticleProperties() returns article properties", (done) => {
    client.getArticleProperties(TEST_ARTICLE, (err, props) => {
      expect(err).toBeNull();
      expect(props.wikibase_item).toEqual("Q937");
      expect(props["wikibase-shortdesc"]).toContain("scientist");

      done();
    });
  }, 5000);
});

// FIXME: use a proxy when running on CI
describe("Bot on test.wikipedia.org", () => {
  if (process.env.CI === "true") {
    it.skip(
      "GitHub Actions are blocked by Wikipedia for anon traffic",
      it.todo,
    );
    return;
  }

  const client = new Bot({
    protocol: "https",
    server: "test.wikipedia.org",
    path: "/w",
  });

  const TEST_ARTICLE = "NodeMW client";
  const TEST_CONTENT = `Test Content ${Math.random()
    .toFixed(5)
    .slice(2)} --~~~~`;

  let lastRevisionId;

  it("can make edits to <https://test.wikipedia.org/wiki/NodeMW_client>", (done) => {
    client.edit(
      TEST_ARTICLE,
      TEST_CONTENT,
      "Testing nodemw client",
      (err, res) => {
        expect(err).toBeNull();
        expect(res.title).toEqual(TEST_ARTICLE);

        lastRevisionId = res.newrevid;

        done();
      },
    );
  }, 5000);

  it("verify that the edit has been made", (done) => {
    client.getArticleInfo(TEST_ARTICLE, {}, (err, pages) => {
      const res = pages[0];
      expect(err).toBeNull();
      expect(res.title).toEqual(TEST_ARTICLE);
      expect(res.varianttitles.en).toEqual(TEST_ARTICLE);
      expect(res.contentmodel).toEqual("wikitext");
      expect(res.lastrevid).toEqual(lastRevisionId);

      // const { dumpObjectTypes } = require('../lib/utils');
      // dumpObjectTypes('ArticleInfo', res);

      done();
    });
  });
});
