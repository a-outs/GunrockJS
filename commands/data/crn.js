const fs = require("fs").promises;
const parse = require("csv-parse/lib/sync");
const { MessageEmbed, Message } = require("discord.js");

module.exports = {
  name: "crn",
  description:
    "Gives you information about any UC Davis course for this current term.",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  async execute(message, args) {
    const courseCode = parseCourseCode(args);
    const messageReply = await readCRNs(courseCode);
    await message.reply(messageReply);
  },
  async slash_execute(interaction) {
    const { value: rawCourseCode } = interaction.options.get("code");
    const courseCode = parseCourseCode(rawCourseCode.split(" "));
    const messageReply = await readCRNs(courseCode);
    await interaction.reply(messageReply);
  },
};

const parseCourseCode = (args) => {
  try {
    let courseCode = "";
    if (args[1].replace(/[^0-9]/g, "").length < 3) {
      const zerosNeeded = 3 - args[1].replace(/[^0-9]/g, "").length;
      for (let i = 0; i < zerosNeeded; i++) courseCode += "0";
    }
    courseCode = args[0] + " " + courseCode + args[1];
    return courseCode;
  } catch (error) {
    return "";
  }
};

const readCRNs = async (courseCode) => {
  // slight parsing for the inputted `courseCode`
  courseCode = courseCode.toUpperCase();

  let courses = [];
  if (courseCode.length > 6) {
    // getting the csv file and parsing it
    const fileContent = await fs.readFile(
      __dirname + "/../../data/FallQuarter2021.csv"
    );
    const records = parse(fileContent, {
      columns: true,
      escape: "\\",
      skipLinesWithError: true,
    });

    // `courses` is a list of objects representing the classes associated with this course
    courses = records.filter((course) => course.Code === courseCode);
  }

  // if course object isn't found
  if (!courses.length)
    return {
      embeds: [
        new MessageEmbed()
          .setTitle("Course not found!")
          .setDescription(
            "Sorry, but I couldn't find that course! Are you sure you spelled that right?"
          )
          .setColor("#ff0000")
          .addField("Examples of valid input", "JOE 001A\njoe 1a\nJoE 01A"),
      ],
      ephemeral: true,
    };

  // setting up embed to reply with
  const reply = new MessageEmbed()
    .setTitle("CRN data for " + courses[0].Code)
    .setColor(0xffbf00);

  const daysOfTheWeek = ["M", "T", "W", "R", "F"];

  let prevCRN = courses[0].CRN;
  let fieldDesc = "";

  courses.forEach((course) => {
    if(prevCRN !== course.CRN)
    {
      fieldDesc += "Instructor: " + course.Instructor;
      reply.addField(prevCRN, fieldDesc, true);
      prevCRN = course.CRN;
      fieldDesc = "";
    }
    daysOfTheWeek.forEach((day) => {
      if (!course[day + "StartTime"]) return;
      fieldDesc +=
        day +
        ": " +
        Math.trunc(course[day + "StartTime"] / 60) +
        ":" +
        ("0" + (course[day + "StartTime"] % 60)).slice(-2) +
        " - " +
        Math.trunc(course[day + "EndTime"] / 60) +
        ":" +
        ("0" + (course[day + "EndTime"] % 60)).slice(-2) +
        "\n";
    });
  });
  fieldDesc += "Instructor: " + courses[courses.length-1].Instructor;
  reply.addField(courses[courses.length-1].CRN, fieldDesc, true);

  return { embeds: [reply] };
};
