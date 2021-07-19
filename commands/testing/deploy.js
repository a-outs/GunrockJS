const { slash_commands } = require("../../slash_commands.json");

module.exports = {
  name: "deploy",
  description: "Deploy",
  hasCommand: true,
  hasSlash: false,
  hasButton: false,
  helpEntry: false,
  async execute(message, args) {
    const timmieID = "372696487290863618";
    if (message.author.id === timmieID) {
      if (args[0] === "global") {
        // to update slash commands GLOBALLY run the following line
        await message.client.application?.commands.set(slash_commands);
        message.reply(
          "Slash commands deployed GLOBALLY, may take up to an hour to register!"
        );
      } 
      else if (args[0] === "reset") {
        // resets slash commands in guild
        await message.client.guilds.cache
          .get(message.guild.id)
          .commands.set([]);
        message.reply(
          "Slash commands successfully reset in GUILD " + message.guild.name
        );
      } else {
        // updates slash commands in guild
        await message.client.guilds.cache
          .get(message.guild.id)
          .commands.set(slash_commands);
        message.reply(
          "Slash commands successfully deployed in GUILD " + message.guild.name
        );
      }

      return;
    }
  },
};
