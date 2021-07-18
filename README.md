# GunrockJS

[INVITE LINK](TO DO: Put invite link here)

I hate discord python it makes me sad and there is so little documentation so im trying to implement Gunrock in JS.

## General Features

To get started, try running `/gunrock` in any discord server with the bot!

Use the commands `/course` and `/crn` to get data on any UC Davis course!

Try out some of the fun ping commands like `/bad` or `/boomer`!

## Moderation Features

Each command can be enabled/disabled server wide!

Note: The `settings` command does not work via slash commands yet.

To see all commands and their settings, do `[prefix] settings list`

To enable/disabled commands, do `[prefix] settings set [command name] enabled [true/false]`

To change the prefix, do `[old prefix] settings set prefix [new prefix]`

A prefix can have up to one space in it. To set the prefix to something like `!test `, you can run `[old prefix] settings set prefix "!test "`

## Development Quickstart

(Run only once): `npm install`

Watch: `npm run watch`

Run without watch: `node .`