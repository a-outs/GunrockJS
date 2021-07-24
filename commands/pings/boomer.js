module.exports = {
  name: "boomer",
  description: "Calls someone a boomer",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  validSettings: ["enabled"],
  execute(message, args) {
    if (args.length < 1) {
      return message.reply("Error! Please provide a user to call boomer!");
    }
    return message.channel.send(args[0] + " okay boomer");
  },
  async slash_execute(interaction) {
    const { value: name } = interaction.options.get("name");
    await interaction.reply(`<@${name}> okay boomer`);
  },
};
