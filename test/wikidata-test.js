// @ts-check
const { describe, it, expect } = require("@jest/globals");
const WikiData = require("../lib/wikidata");

describe("WikiData API", () => {
    const TEST_ARTICLE = "Albert Einstein";
    const NOT_EXISTING_ARTICLE = "FooBar39786123";
    const client = new WikiData();

    describe("getArticleSitelinks()", () => {
        it(`returns sitelinks for "${TEST_ARTICLE}" article`, async() => {
            const res = await client.getArticleSitelinks(TEST_ARTICLE);
            expect(res).toMatchObject({
                enwiki: {
                    site: 'enwiki', title: 'Albert Einstein', badges: [ 'Q17437798' ]
                },
                plwiki: {
                    site: 'plwiki', title: 'Albert Einstein', badges: []
                }
            });
        }, 5000);

        it(`gives null for not existing article`, async() => {
            const res = await client.getArticleSitelinks(NOT_EXISTING_ARTICLE);
            expect(res).toBeNull();
        }, 5000);
    });
});
