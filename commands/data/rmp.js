const fs = require("fs").promises;
const parse = require("csv-parse/lib/sync");
const { MessageEmbed, MessageButton } = require("discord.js");

module.exports = {
  name: "rmp",
  description: "Returns rate my professor information!",
  aliases: [],
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: false,
  async execute(message, args) {
    message.reply(await GetRMPData(args[0]));
  },
  async slash_execute(interaction) {
    const { value: teacherName } = interaction.options.get("name");
    interaction.reply(await GetRMPData(teacherName));
  },
};

const GetRMPData = async (teacherName) => {
  // getting the csv file and parsing it
  const fileContent = await fs.readFile(__dirname + "/../../data/rmpData.csv");
  const records = parse(fileContent, {
    columns: true,
    escape: "\\",
    skipLinesWithError: true,
  });
  const teachers = records.filter((teacher) =>
    teacher.Name.toLowerCase().includes(teacherName.toLowerCase())
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
              teachers.map((teacher) => `\`${teacher.Name}\``).join(", ")
          ),
      ],
    };
  }
  const rmpLink = new MessageButton()
    .setLabel("Teacher's RMP")
    .setURL(teachers[0]["Link to Page"])
    .setStyle("LINK");
  return {
    embeds: [
      new MessageEmbed()
        .setTitle(teachers[0].Name)
        .setDescription(
          `Rating: ${teachers[0].Rating}\nNumber of ratings: ${teachers[0]["# of Ratings"]}\nDifficulty: ${teachers[0].Difficulty}`
        ),
    ],
    components: [[rmpLink]],
  };
};
