const { MessageButton, MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  description: "Help command!",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  async execute(message, args) {
    message.reply(getHelpInfo(args, message.client));
  },
  async slash_execute(interaction) {
    try {
      const { value: command } = interaction.options.get("command");
      interaction.reply(getHelpInfo([command], interaction.client));
    } catch (e) {
      interaction.reply(getHelpInfo([], interaction.client));
    }
  },
};

const getHelpInfo = (args, client) => {
  const data = [];
  const { commands } = client;
  const { prefix } = require("../../config.json");

  // general help
  if (!args.length) {
    data.push("Here's a list of all my commands:");
    data.push(
      commands
        .filter((command) => command.helpEntry)
        .map((command) => "`" + command.name + "` " + command.description + " ")
        .join("\n")
    );
    data.push(
      `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
    );

    const githubLink = new MessageButton()
      .setLabel("Github")
      .setURL("https://github.com/a-outs/GunrockJS")
      .setStyle("LINK");

    const helpEmbed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("GunrockJS Help")
      .setDescription(data.join("\n"))
      .setFooter(
        "Contact timmie#6383 or Moragoh#7628 for help, questions, comments, or concerns."
      );

    return {
      embeds: [helpEmbed],
      split: true,
      components: [[githubLink]],
      ephemeral: true,
    };
  }

  // Code below is if they specify a specific command
  const name = args[0].toLowerCase();
  const command =
    commands.get(name) ||
    commands.find((c) => c.aliases && c.aliases.includes(name));

  const replyEmbed = new MessageEmbed();

  if (!command) {
    return {
      embeds: [
        replyEmbed
          .setTitle("Error!")
          .setColor("#ff0000")
          .setDescription("That's not a valid command!"),
      ],
      ephemeral: true,
    };
  }

  replyEmbed.setTitle(`**Name:** ${command.name}`);

  if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
  if (command.description) data.push(`**Description:** ${command.description}`);
  if (command.usage)
    data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

  data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);

  replyEmbed.setDescription(data.join("\n"))

  return { embeds: [replyEmbed], split: true, ephemeral: true };
};
