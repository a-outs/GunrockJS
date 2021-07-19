module.exports = {
  name: "ping",
  description: "Responds with Pong!",
  aliases: ["test"],
  cooldown: 1,
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: false,
  execute(message) {
    message.channel.send("Pong!");
  },
  async slash_execute(interaction) {
    await interaction.reply("Pong!");
  },
};
