// @ts-check
"use strict";

const { describe, it, expect, beforeAll } = require("@jest/globals");
const WikiData = require("../lib/wikidata");
const { env } = require("node:process");

// Create your own bot account at https://test.wikipedia.org/wiki/Special:BotPasswords
// Add set these env variables when running tests.
// Otherwise, we're getting rate-limited (HTTP 429 responses).
const TEST_BOT_USERNAME = env["TEST_BOT_USERNAME"];
const TEST_BOT_PASSWORD = env["TEST_BOT_PASSWORD"];

describe("WikiData API", () => {
  const TEST_ARTICLE = "Albert Einstein"; // https://www.wikidata.org/wiki/Q937
  const NOT_EXISTING_ARTICLE = "FooBar39786123";
  const TEST_ENTITY = "Q928875"; // Saksun
  const NOT_EXISTING_ENTITY = "Q3976321987569386512312";

  const client = new WikiData();

  if (!TEST_BOT_USERNAME) {
    it.skip("Suite skipped as it requires a test account", () => {});
    return;
  }

  beforeAll(async () => {
    await client.logIn(TEST_BOT_USERNAME, TEST_BOT_PASSWORD);
  });

  describe("getArticleSitelinks()", () => {
    it(`returns sitelinks for "${TEST_ARTICLE}" article`, async () => {
      const res = await client.getArticleSitelinks(TEST_ARTICLE);
      expect(res).toMatchObject({
        enwiki: {
          site: "enwiki",
          title: "Albert Einstein",
          badges: ["Q17437798"],
        },
        plwiki: {
          site: "plwiki",
          title: "Albert Einstein",
          badges: [],
        },
      });
    });

    it(`gives null for not existing article`, async () => {
      const res = await client.getArticleSitelinks(NOT_EXISTING_ARTICLE);
      expect(res).toBeNull();
    });
  });

  describe("getArticleClaims", () => {
    it(`returns claims for "${TEST_ARTICLE}" article`, async () => {
      const res = await client.getArticleClaims(TEST_ARTICLE);

      expect(Object.keys(res)).toContain("P1280");
      expect(Object.keys(res)).toContain("P1412");

      // "+1879-03-14T00:00:00Z"
      const dateOfBirth = res.P569[0].mainsnak.datavalue.value;
      expect(dateOfBirth.time).toMatch(/1879-03-14/);

      const dateOfDeath = res.P570[0].mainsnak.datavalue.value;
      expect(dateOfDeath.time).toMatch(/1955-04-18/);
    });

    it(`gives null for not existing article`, async () => {
      const res = await client.getArticleClaims(NOT_EXISTING_ARTICLE);
      expect(res).toBeNull();
    });
  });

  describe("getArticleDescriptions", () => {
    it(`returns descriptions for "${TEST_ARTICLE}" article`, async () => {
      const res = await client.getArticleDescriptions(TEST_ARTICLE);

      expect(res.en.language).toEqual("en");
      expect(res.en.value).toContain("German-born theoretical physicist");

      const polish = res.pl;

      expect(polish.language).toEqual("pl");
      expect(polish.value).toMatch(/fizyk/);
      expect(polish.value).toMatch(/noblista/);
    });

    it(`gives null for not existing article`, async () => {
      const res = await client.getArticleDescriptions(NOT_EXISTING_ARTICLE);
      expect(res).toBeNull();
    });
  });

  describe("getEntityClaims", () => {
    it(`returns claims for "${TEST_ENTITY}" entity`, async () => {
      const res = await client.getEntityClaims(TEST_ENTITY);

      expect(Object.keys(res)).toContain("P373");
      expect(Object.keys(res)).toContain("P17");

      const geo = res.P625;

      expect(geo[0].mainsnak.datavalue.value).toMatchObject({
        latitude: 62.248888888889,
        longitude: -7.1758333333333,
      });
    });

    it.skip(`rejects for not existing entity`, async () => {
      // https://jestjs.io/docs/tutorial-async#rejects
      await expect(
        await client.getEntityClaims(NOT_EXISTING_ENTITY),
      ).rejects.toMatch(/Error returned by API/);
    });
  });

  describe("getEntityClaim", () => {
    it(`returns a claim for ${TEST_ENTITY} entity`, async () => {
      const geo = await client.getEntityClaim(TEST_ENTITY, "P625");

      expect(geo[0].mainsnak.datavalue.value).toMatchObject({
        latitude: 62.248888888889,
        longitude: -7.1758333333333,
      });
    });

    it(`returns null for not existing claim`, async () => {
      const geo = await client.getEntityClaim(TEST_ENTITY, "P1");
      expect(geo).toBeNull();
    });
  });
});
