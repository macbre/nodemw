--- Hello world module for Scribunto remote debugging on Node.js.
local title = mw.title
local currentTitle = title.getCurrentTitle()

local CommandLine = require('Dev:CLI')
local commands = {}

function commands.hello(args)
    mw.log('Hello, world! Max didn\'t make me put this here.')
end

return CommandLine:new{
    description = '"Hello world" command line script for Scribunto.',
    commands = commands,
    words = {
        hello = {
            description = 'Outputs a "hello world" string to the console.'
        }
    },
    options = {}
}