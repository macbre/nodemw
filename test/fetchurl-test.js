"use strict";
const { describe, it, expect } = require("@jest/globals");

const Bot = require("../lib/bot");

describe("fetchUrl", () => {
  const client = new Bot({
    server: "en.wikipedia.org",
    path: "/w",
  });

  it("passes page content to a callback", (done) => {
    client.fetchUrl("http://example.com", (err, res) => {
      expect(err).toBeNull();
      expect(res).toContain("<h1>Example Domain</h1>");

      done();
    });
  });

  it("passes binary data to a callback", (done) => {
    client.fetchUrl(
      "http://upload.wikimedia.org/wikipedia/en/b/bc/Wiki.png",
      (err, res) => {
        expect(err).toBeNull();
        expect(res).toBeInstanceOf(Buffer);
        expect(res.length).toEqual(19670);

        done();
      },
      "binary",
    );
  });

  it("handles 404 errors properly", (done) => {
    client.fetchUrl("https://google.com/404", (err, res) => {
      expect(res).toContain("<title>Error 404");
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toContain("HTTP status 404");

      done();
    });
  });

  it("handles invalid protocol properly", (done) => {
    client.fetchUrl("foo://bar", (err, res) => {
      expect(res).toBeUndefined();
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toContain("Invalid protocol");

      done();
    });
  });
});
