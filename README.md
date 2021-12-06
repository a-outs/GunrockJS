# GunrockJS

[INVITE LINK](https://discord.com/oauth2/authorize?client_id=726048467063013376&permissions=7784619969&scope=bot%20applications.commands)

The best bot around for UC Davis Discord Servers!

## General Features

To get started, try running `/gunrock` in any Discord server with the bot!

Use the commands `/course` and `/crn` to get data on any UC Davis course!

Use the command `/rmp` to get Rate My Professor information on any UC Davis professor!

Try out some of the fun ping commands like `/bad` or `/boomer`!

## Moderation Features

Each command can be enabled/disabled server wide!

Note: The `settings` command does not work via slash commands yet.

To see all commands and their settings, do `[prefix] settings list`

To enable/disabled commands, do `[prefix] settings set [command name] enabled [true/false]`

To change the prefix, do `[old prefix] settings set prefix [new prefix]`

A prefix can have up to one space in it. To set the prefix to something like `!test `, you can run `[old prefix] settings set prefix "!test "`

Certain commands can also be set to be "ephemeral", meaning if a user uses that command with Discord's slash command system, only the user will be able to see the response. To set this, use the command `[prefix] settings set [command name] ephemeral [true/false]`. A value of true means only the user will be able to see responses, while false means everyone can see them.

To change every command that can be set to ephemeral across the Discord server, you can use the command `[prefix] settings set ephemeral [true/false]`.

## Development Quickstart

(Run only once): `npm install`

Watch: `npm run watch`

Run without watch: `node .`

## Using Docker

For the bot to work via docker, `token.json` and `guildConfigs.json` must be mounted to `/app/`

## Maintainers

- [@timstewartj](https://github.com/TimStewartJ) 
- [@moragoh](https://github.com/Moragoh)