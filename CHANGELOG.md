# Changelog

## Unreleased
### Added
- Dockerfile and Docker documentation.
### Changed
- Updated to Discord.js 13.1.0.
- Updated other packages.
- Course command now tries to grab straight from the course catalog if possible.
### Fixed
- Bug regarding help command in guilds with no settings.

## [1.2.0] - 2021-07-26
### Changed
- Backend handling of CRN command and guild settings to reduce file reads and improve performance.
- Permission for settings command from `MANAGE_GUILD` to `MANAGE_ROLES`.
- Default ephemerality of rmp and help commands to false.
- Settings handling for individual commands. Ephemerality can now be set per command and guild-wide.

## [1.1.0] - 2021-07-21
The RMP update
### Added
- The RMP command - returns Rate My Professor information on a given professor.
### Changed
- CRN command now gives rmp rating for each instructor when possible.

## [1.0.0] - 2021-07-18
Public release, major features implemented.
### Added
#### Info Commands
- Course command: Returns information on a specific UC Davis course.
- CRN command: Returns information about a specific UC Davis course's CRNs.
#### Ping Commands
- Boomer command: Okay boomers a specified user.
- Bad command: Calls a specified user bad.
- Cow command: Rates a user's cow likeness as a percentage.
#### Moderation Features
- Settings command: Handles all settings for a specific guild, requires manage_guild permission.
- Prefixes can be set per guild.
- Every command can be enabled/disabled per guild.
