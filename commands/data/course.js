const fs = require("fs").promises;
const parse = require("csv-parse/lib/sync");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "course",
  description: "Responds with Pong!",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: false,
  async execute(message, args) {
    const messageReply = await readCourses(args[0] + " " + args[1]);
    await message.reply(messageReply);
  },
  async slash_execute(interaction) {
    const { value: courseCode } = interaction.options.get('code');
    const messageReply = await readCourses(courseCode);
    await interaction.reply(messageReply);
  },
};

const readCourses = async (courseCode) => {
  // slight parsing for the inputted `courseCode`
  courseCode = courseCode.toUpperCase();
  // getting the csv file and parsing it
  const fileContent = await fs.readFile(
    __dirname + "/../../data/20212022GenCat.csv"
  );
  const records = parse(fileContent, {
    columns: true,
    escape: "\\",
    skipLinesWithError: true,
  });

  // `course` is object representing the course
  const course = records.find((course) => course.Code === courseCode);

  // if course object isn't found
  if (!course) return "Sorry, but I couldn't find that course! Are you sure you spelled that right?";

  // setting up embed to reply with
  const reply = new MessageEmbed()
    .setTitle(course.Code)
    .setColor(0xffbf00)
    .setDescription(course.Desc);

  let fieldName = "Credits: " + course.Credits;
  let fieldDesc = "";

  Object.keys(course).forEach((key, index) => {
    if (index > 2 && index < 13) {
      if (index == 6) fieldDesc += "\n";
      fieldDesc += key;
      if (course[key]) fieldDesc += " :white_check_mark: ";
      else fieldDesc += " :x: ";
      fieldDesc += " ";
    }
  });

  reply.addField(fieldName, fieldDesc);

  return { embeds: [reply] };
};
