#!/usr/bin/env node
/**
 * Example script getting current user information
 *
 * @see http://www.mediawiki.org/wiki/API:Protect
 */
"use strict";

const Bot = require("..");
const client = new Bot("examples/config.js");

client.logIn(function () {
  // Protections takes an array so allow multiple protections to be configured.
  const protections = [];

  // Protect the page from edits.
  protections.push({
    type: "edit",
    level: "sysop",
    expiry: "never",
  });

  client.protect("Albert_Einstein", protections, (err, data) => {
    console.log(JSON.stringify(data, null, "\t"));
  });
});
