"use strict";

const { describe, it, expect } = require("@jest/globals");
const Bot = require("..");

describe("Bot", () => {
  it("supports passing config object and applies defaults", () => {
    const client = new Bot({
      server: "fo.wikipedia.org",
      path: "/w",
    });

    expect(client.api.server).toEqual("fo.wikipedia.org");
    expect(client.api.path).toEqual("/w");

    // and some defaults
    expect(client.api.protocol).toEqual("http");
  });

  it("supports passing a config file", () => {
    const client = new Bot(__dirname + "/config.json");

    expect(client.api.server).toEqual("pl.wikipedia.org");
    expect(client.api.path).toEqual("/w");

    // and some defaults
    expect(client.api.protocol).toEqual("http");
  });

  it("supports a custom user agent", () => {
    const client = new Bot({
      userAgent: "foo/bar 1.2.3",
    });

    expect(client.api.userAgent).toEqual("foo/bar 1.2.3");
  });
});

describe("Bot.config", () => {
  const client = new Bot(__dirname + "/config.json");

  it("gets correct values", () => {
    expect(client.getConfig("server")).toEqual("pl.wikipedia.org");
    expect(client.getConfig("goo")).toEqual(123);
  });

  it("gets a default value", () => {
    expect(client.getConfig("foo")).toBeUndefined();
    expect(client.getConfig("foo", "default-value")).toEqual("default-value");
  });
});

describe("Bot's dry run mode", () => {
  it("is expected", (done) => {
    const client = new Bot({
      server: "foo.bar", // we should not even connect here
      path: "/w",
      dryRun: true,
    });

    client.edit("Main Page", "foo", "test", (err, res) => {
      expect(res).toBeUndefined();
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toEqual("In dry-run mode");
      done();
    });
  });
});

describe("Bot.diff", () => {
  const client = new Bot(__dirname + "/config.json");

  it("returns a proper diff", () => {
    const prev = "foo 123 bar";
    const current = "[[foo]] bar";
    const diff = client.diff(prev, current);

    expect(diff).toContain("foo");
    expect(diff).toContain("bar");
  });
});
