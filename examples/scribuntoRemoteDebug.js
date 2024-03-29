"use strict";
const Bot = require(".."),
  readline = require("readline"),
  fs = require("fs"),
  c = require("ansicolors"),
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  }),
  client = new Bot({
    protocol: "https",
    server: "dev.fandom.com",
    path: "",
  }),
  params = {
    action: "scribunto-console",
    title: "Module:Sandbox/CLI",
    clear: true,
  };

function call(err, info, next, data) {
  if (err) {
    console.error(err);
  } else if (data.type === "error") {
    console.error(data.message);
  } else {
    console.log(data.print);
  }
}

function cli(input) {
  params.question = input;
  client.api.call(params, call);
}

function session(err, data) {
  params.content = data;
  console.log(
    c.green(
      '* The module exports are available as the variable "p", including unsaved modifications.',
    ),
  );
  console.log(
    c.green(
      '* Precede a line with "=" to evaluate it as an expression, or use print().',
    ),
  );
  console.log(
    c.green("* Use mw.log() in module code to send messages to this console."),
  );
  rl.on("line", cli);
}

fs.readFile("helloworld.lua", "utf8", session);
