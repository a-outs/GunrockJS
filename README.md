# GunrockJS

I hate discord python it makes me sad and there is so little documentation so im trying to implement Gunrock in JS.

## General Features

To get started, try running `/gunrock` in any discord server with the bot!

Use the commands `/course` and `/crn` to get data on any UC Davis course!

## Moderation Features

Each command can be enabled/disabled server wide!

Note: The `settings` command does not work via slash commands yet.

To see all commands and their settings, do `[prefix] settings list`

To enable/disabled commands, do `[prefix] settings set [command name] enabled [true/false]`

To change the prefix, do `[prefix] settings set prefix [new prefix]`

## Development Quickstart

(Run only once): `npm install`

Watch: `npm run watch`

Run without watch: `node .`