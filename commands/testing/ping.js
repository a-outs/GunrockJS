module.exports = {
  name: "ping",
  description: "Responds with Pong!",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: false,
  execute(message, args) {
    message.channel.send("Pong!");
  },
  async slash_execute(interaction) {
    await interaction.reply("Pong!");
  },
};
