"use strict";
const { describe, it, expect } = require("@jest/globals");
const { parseVideoUrl } = require("../lib/utils");

describe("parseVideoUrl", () => {
  const cases = [
    {
      url: "https://www.youtube.com/watch?v=24X9FpeSASY",
      expected: ["youtube", "24X9FpeSASY"],
    },
    {
      url: "https://www.youtube.com/watch?v=o_QbyP6q0AQ",
      expected: ["youtube", "o_QbyP6q0AQ"],
    },
    {
      url: "https://vimeo.com/27986705",
      expected: ["vimeo", "27986705"],
    },
    {
      url: "https://example.com",
      expected: null,
    },
  ];

  it.each(cases)("$url is properly parsed", ({ url, expected }) => {
    expect(parseVideoUrl(url)).toStrictEqual(expected);
  });
});
