// @ts-check
/**
 * Example script getting wiki information
 */
"use strict";

const Bot = require("..");
// const { dumpObjectTypes } = require( '../lib/utils' );

const client = new Bot({
  server: "8bit.wikia.com",
  debug: true,
});

client.getSiteInfo(["general", "namespaces", "dbrepllag"], function (_, info) {
  // dumpObjectTypes( 'SiteInfo', info );
  // dumpObjectTypes( 'SiteInfoGeneral', info.general );
  // dumpObjectTypes( 'SiteInfoNamespaces', info.namespaces );
  // dumpObjectTypes( 'SiteInfoDBReplLag', info.dbrepllag );

  // console.log( 'General:', info.general );
  // console.log( 'Namespaces:', info.namespaces );

  // e.g. This site uses PHP v7.3.33 and mysql v8.0.25-15
  console.log(
    `This site uses PHP v${info.general.phpversion} and ${info.general.dbtype} v${info.general.dbversion}`
  );
});

client.getSiteStats(function (_, stats) {
  // dumpObjectTypes( 'SiteStatistics', stats );

  // e.g. This wiki has 179 articles with 30886001 users that made 1917 edits.
  console.log(
    `This wiki has ${stats.articles} articles with ${stats.users} users that made ${stats.edits} edits.`
  );
});

// Wikia-specific stuff
client.wikia.getWikiVariables(function (_, vars) {
  // dumpObjectTypes( 'WikiaWikiVariables', vars );

  // e.g. This wiki has ID 443275 (DB name pl8bit) and is a part of lifestyle vertical.
  console.log(
    `This wiki has ID ${vars.id} (DB name ${vars.dbName}) and is a part of ${vars.vertical} vertical.`
  );
});

client.wikia.getUsers([2, 1, 16], function (_, users) {
  // dumpObjectTypes( 'WikiaUserInfo', users[0] );
  console.log("Users: %j", users);
});

client.wikia.getUser(119245, function (_, userInfo) {
  // e.g. Hi, I'm Macbre and I've made 15541 edits
  console.log(
    `Hi, I'm ${userInfo.name} and I've made ${userInfo.numberofedits} edits`
  );
});
