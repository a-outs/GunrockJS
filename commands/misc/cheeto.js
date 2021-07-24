const { cheeto_pics } = require("../../cheeto.json");
const { MessageButton } = require("discord.js");

module.exports = {
  name: "cheeto",
  description: "Returns random picture of Cheeto the cat",
  hasCommand: true,
  hasSlash: true,
  hasButton: true,
  helpEntry: true,
  validSettings: ["enabled"],
  execute(message) {
    message.channel.send(getCheetoPic());
  },
  async slash_execute(interaction) {
    await interaction.reply(getCheetoPic());
  },
  async button_execute(interaction) {
    await interaction.update(getCheetoPic());
  },
};

const getCheetoPic = () => {
  const button = new MessageButton()
    .setCustomId("cheeto")
    .setLabel("Get new pic!")
    .setStyle("SECONDARY");
  return {
    content: cheeto_pics[Math.floor(Math.random() * cheeto_pics.length)][0],
    components: [[button]],
  };
};
