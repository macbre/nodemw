--- Example module for Scribunto remote debugging on Node.js.
--  @see                https://dev.fandom.com/wiki/Module:CLI/testcases/title
local title = mw.title
local currentTitle = title.getCurrentTitle()

local CommandLine = require('Dev:CLI')
local commands = {}

function commands.equals(args)
    if args.output then
        return title.equals(title.new(args[1]), title.new(args[2]))
    else
        mw.log(title.equals(title.new(args[1]), title.new(args[2])))
    end
end

function commands.compare(args)
    if args.output then
        return title.compare(title.new(args[1]), title.new(args[2]))
    else
        mw.log(title.compare(title.new(args[1]), title.new(args[2])))
    end
end

function commands.new(args)
    local text = table.remove(args, 1)
    local key = table.remove(args, 1)
    local newTitle = title.new(text, args.namespace or 0)
    local val = newTitle[key] or newTitle
    if type(val) == 'function' then
        val = val(newTitle, unpack(args))
    end
    if args.output then
        return val
    else
        if type(val) == 'table' or val == nil then
            mw.log(tostring(val))
        else
            mw.log(val)
        end
        return val
    end
end

function commands.makeTitle(args)
    local val = title.makeTitle(unpack(args))
    if args.output then
        return val
    else
        mw.log(tostring(val))
    end
end

function commands.getCurrentTitle(args)
    local key = table.remove(args, 1)
    local val = currentTitle[key] or currentTitle
    if type(val) == 'function' then
        val = val(currentTitle, unpack(args))
    end
    if args.output then
        return val
    else
        if type(val) == 'table' or val == nil then
            mw.log(tostring(val))
        else
            mw.log(val)
        end
        return val
    end
end

return CommandLine:new{
    description = 'Command-line interface for Scribunto title library (mw.title) in debug console.',
    commands = commands,
    words = {
        equals = {
            description = 'Whether two title identifiers or strings are identical.',
            options = { 1, 2, 'output' }
        },
        compare = {
            description = 'Computes sort order for Scribunto title objects.',
            options = { 1, 2, 'output' }
        },
        new = {
            description = 'Fetches data from a new Scribunto title object.',
            options = { 1, 2, 3, 4, 'output' }
        },
        makeTitle = {
            description = 'Generates a namespace-specific Scribunto title object.',
            options = { 1, 2, 3, 4, 'output' }
        },
        getCurrentTitle = {
            description = 'Fetches a Scribunto title object for the current page.',
            options = { 1, 'output' }
        }
    },
    options = {
        { name = 1, alias = 'a', description = 'Object field in "getCurrentTitle", namespace of title in "makeTitle", or target title/identfier.', type = 'string' },
        { name = 2, alias = 'b', description = 'Object field in "new", article title/identifier in "makeTitle", or comparison title/identfier.', type = 'string' },
        { name = 3, alias = 'c', description = 'Method subpage or URL query in "new", or fragment in "makeTitle".', type = 'string' },
        { name = 4, alias = 'd', description = 'Method protocol in "new", or interwiki prefix in "makeTitle".', type = 'string' },
        { name = 'output', alias = 'o', description = 'Return output instead of sending to console.' }
    }
}