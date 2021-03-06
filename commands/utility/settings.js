const fs = require("fs").promises;
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "settings",
  description: "Command to edit guild settings for the bot.",
  hasCommand: true,
  hasSlash: false,
  hasButton: false,
  helpEntry: false,
  permissions: ["MANAGE_ROLES"],
  async execute(message, args) {
    if (!args.length) {
      return await message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Error: Invallid input!")
            .setColor("#ff0000")
            .setDescription(
              "Please provide one of the following options: list, set"
            ),
        ],
      });
    }

    const settings = message.client.settings;
    const guilds = settings.guilds;

    // guild is the object of settings for the guild that the settings command was sent from
    let guild = guilds.find((guild) => guild.id == message.guild.id);

    if (!guild) {
      guilds.push({ id: message.guild.id, commandSettings: [] });
      guild = guilds[guilds.length - 1];
    }

    if (args[0] === "list") {
      let response = new MessageEmbed().setTitle(
        'List of settings for guild "' + message.guild.name + '"'
      );
      response.addField(
        "Prefix:",
        `\`${guild.prefix ? guild.prefix : "!gunrock "}\``
      );
      response.addField(
        "Ephemeral:",
        `\`${guild.ephemeral ? guild.ephemeral : false}\``
      );
      message.client.commands.forEach((command) => {
        let commandString = "";
        const commandSetting = guild.commandSettings.find(
          (commandSetting) => commandSetting.name == command.name
        );
        if (!command.validSettings) commandString += "No settings available.";
        else {
          command.validSettings.forEach((setting) => {
            let settingValue;
            if (!commandSetting || !commandSetting[setting])
              settingValue = "unset";
            else settingValue = commandSetting[setting];
            commandString += `\`${setting}\` : \`${settingValue}\`\n`;
          });
        }
        response.addField(command.name + ":", commandString);
      });
      return message.reply({ embeds: [response] });
    }

    if (args[0] === "set") {
      if (args.length < 3) {
        return await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Error: Invalid Usage")
              .setColor("#ff0000")
              .setDescription(
                "Usage: `settings set [command] [setting] [value]` or `settings set prefix [new prefix]`"
              ),
          ],
        });
      }

      if (args[1] === "prefix") {
        let input = args[2];
        if (args[3]) input += " " + args[3];
        guild.prefix = input.replace(/^"+|"+$/g, "");
        writeSettings(settings);
        return await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Success")
              .setDescription("Prefix set to `" + guild.prefix + "`!"),
          ],
        });
      }

      if (args[1] === "ephemeral") {
        const input = args[2] === "true";
        guild.ephemeral = input;
        writeSettings(settings);
        return await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Success")
              .setDescription(
                "Guild ephemerality is set to " + guild.ephemeral
              ),
          ],
        });
      }

      if (!message.client.commands.has(args[1])) {
        return await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Error: Command not found!")
              .setColor("#ff0000")
              .setDescription("Command not found!"),
          ],
        });
      }

      const command = message.client.commands.get(args[1]);

      if (!command.validSettings || !command.validSettings.includes(args[2])) {
        let validSettingsText;
        if (!command.validSettings) validSettingsText = "none";
        else validSettingsText = command.validSettings.join(", ");
        return await message.reply({
          embeds: [
            new MessageEmbed()
              .setTitle("Error: Setting not found!")
              .setColor("#ff0000")
              .setDescription(
                `The valid settings to change for this command are: \`${validSettingsText}\``
              ),
          ],
        });
      }
      let commandSetting = guild.commandSettings.find(
        (commandSetting) => commandSetting.name == args[1]
      );
      if (!commandSetting) {
        guild.commandSettings.push({ name: args[1] });
        commandSetting =
          guild.commandSettings[guild.commandSettings.length - 1];
      }
      let value = args[3];
      if (args[2] === "enabled" || args[2] === "ephemeral")
        value = value === "true";
      commandSetting[args[2]] = value;
      message.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Success")
            .setDescription(
              "Setting `" +
                args[2] +
                "` for command `" +
                args[1] +
                "` has been set to `" +
                args[3] +
                "`."
            ),
        ],
      });
    }

    writeSettings(settings);
  },
};

const writeSettings = async (settings) => {
  await fs.writeFile(
    __dirname + "/../../guildConfigs.json",
    JSON.stringify(settings, null, 2)
  );
};
