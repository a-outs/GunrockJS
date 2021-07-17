module.exports = {
  name: "bad",
  description: "Calls someone bad",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  execute(message, args) {
    if (args.length < 1) {
      return message.reply("Error! Please provide a user to call bad!");
    }
    return message.channel.send(args[0] + " you're bad :(");
  },
  async slash_execute(interaction) {
    const { value: name } = interaction.options.get("name");
    await interaction.reply(`<@${name}> you're bad :(`);
  },
};
