const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "cow",
  description: "Detects cow percentage in a @user",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  cooldown: 60,
  validSettings: ["enabled"],
  execute(message, args) {
    if (args.length < 1) {
      return message.reply("Error! Please provide a user to rate!");
    }
    return message.channel.send(cowR8Machine(args[0]));
  },
  async slash_execute(interaction) {
    const { value: name } = interaction.options.get("name");
    await interaction.reply(cowR8Machine(`<@${name}>`));
  },
};

const cowR8Machine = (name) => {
  return {
    embeds: [
      new MessageEmbed()
        .setTitle("cow r8 machine")
        .setDescription(`${name} is ${Math.floor(Math.random() * 100)}% cow`)
        .setColor("0xffbf00"),
    ],
  };
};
