# `nodemw` examples
The `examples` directory contains `nodemw` script examples that communicate with the MediaWiki API.

To run each example, use the following in your console:
```console
cd examples
node pagesInCategory.js
```

## Scribunto examples
There are two scripts - `scribuntoConsole.js` and `scribuntoRemoteDebug.js` - that provide Scribunto debugging in your IDE using Node.js.

The `scribuntoConsole.js` script will query the Scribunto console for a wiki module.

The `scribuntoRemoteDebug.js` script will query the console for staging or debugging of a local file. A simple Scribunto module is provided at `'helloworld.lua'` for convenience and configuration testing.

Script usage:
1. Set the `title` value in the API query parameters (the `params` variable) to the module's current or future page name.
2. When using `scribuntoRemoteDebug.js`, the local module is placed in the same folder. The script would be edited to replace the `'helloworld.lua'` file (the first `fs.readFile` argument) with your staged module's filename.
3. When the script is run, the Scribunto console introduction is shown and a console session begins.
4. Write a single line of Lua code into the console (for example, `p "help"`), and press <kbd>ENTER</kbd> to see the output.

Note that for both scripts, the module content remains the same throughout the session. You will need to close the current session (<kbd>CTRL-C</kbd>) and rerun the script if there are changes to the module you wish to test.
