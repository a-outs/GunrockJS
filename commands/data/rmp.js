const fs = require("fs").promises;
const parse = require("csv-parse/lib/sync");
const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");

module.exports = {
  name: "rmp",
  description: "Returns Rate My Professor information!",
  aliases: [],
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: false,
  validSettings: ["enabled", "ephemeral"],
  async execute(message, args, ephemerality) {
    message.reply(await GetRMPData(args[0], ephemerality));
  },
  async slash_execute(interaction, ephemerality) {
    const { value: teacherName } = interaction.options.get("name");
    interaction.reply(await GetRMPData(teacherName, ephemerality));
  },
};

const GetRMPData = async (teacherName, ephemeral) => {
  // getting the csv file and parsing it
  const fileContent = await fs.readFile(__dirname + "/../../data/rmpData.csv");
  const records = parse(fileContent, {
    columns: true,
    escape: "\\",
    // skipLinesWithError: true,
  });
  const teachers = records.filter((teacher) =>
    teacher.name.toLowerCase().includes(teacherName.toLowerCase())
  );
  if (!teachers[0]) {
    return {
      embeds: [
        new MessageEmbed()
          .setTitle("Error!")
          .setColor("0xff0000")
          .setDescription(
            "There were no results for your search, please check your spelling!"
          ),
      ],
      ephemeral: true,
    };
  }
  if (teachers.length > 1) {
    return {
      embeds: [
        new MessageEmbed()
          .setTitle("Error!")
          .setColor("0xff0000")
          .setDescription(
            `There were too many results for your search, which ${teacherName} did you mean?\n` +
              teachers.map((teacher) => `\`${teacher.name}\``).join(", ")
          ),
      ],
      ephemeral: true,
    };
  }
  const rmpLink = new MessageButton()
    .setLabel("Teacher's RMP")
    .setURL(teachers[0].link)
    .setStyle("LINK");
  const row = new MessageActionRow().addComponents(rmpLink);
  const color = `0x${(
    "0" + Math.floor((5 - parseFloat(teachers[0].rating) - 1) * 63).toString(16)
  ).slice(-2)}${(
    "0" + Math.floor((parseFloat(teachers[0].rating) - 1) * 63).toString(16)
  ).slice(-2)}00`;
  return {
    embeds: [
      new MessageEmbed()
        .setTitle(teachers[0].name)
        .setDescription(
          `Rating: ${teachers[0].rating}\nNumber of ratings: ${teachers[0].numOfRatings}\nDifficulty: ${teachers[0].difficulty}`
        )
        .setColor(color),
    ],
    components: [row],
    ephemeral: ephemeral,
  };
};
