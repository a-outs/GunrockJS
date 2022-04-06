const axios = require('axios');
const { parse } = require('node-html-parser');
const fs = require("fs").promises;
const csvParse = require("csv-parse/lib/sync");
const { MessageEmbed } = require("discord.js");

const GECategories = [
  "AH", "SE", "SS", "ACGH", "DD", "OL", "QL", "SL", "VL", "WC",
]

module.exports = {
  name: "course",
  description: "Gives you information about any UC Davis course!",
  hasCommand: true,
  hasSlash: true,
  hasButton: false,
  helpEntry: true,
  validSettings: ["enabled", "ephemeral"],
  async execute(message, args, ephemerality) {
    const courseCode = parseCourseCode(args);
    const messageReply = await readCourses(courseCode);
    messageReply.ephemeral = ephemerality;
    await message.reply(messageReply);
  },
  async slash_execute(interaction, ephemerality) {
    await interaction.deferReply({ ephemeral: ephemerality})
    const { value: rawCourseCode } = interaction.options.get("code");
    const courseCode = parseCourseCode(rawCourseCode.split(" "));
    const messageReply = await readCourses(courseCode);
    messageReply.ephemeral = ephemerality;
    await interaction.editReply(messageReply);
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
    console.error(error);
    return "";
  }
};

const readCourses = async (courseCode) => {
  courseCode = courseCode.toUpperCase();

  let course;

  const splitCourseCode = courseCode.split(" ");
  const requestedSubject = splitCourseCode[0];
  const requestedNumber = splitCourseCode[splitCourseCode.length - 1]

  await axios.get(`https://ucdavis.pubs.curricunet.com/Catalog/${requestedSubject}-courses-sc`).then(res => {
    const root = parse(res.data);

    const classes = root.querySelectorAll(".course-summary-wrapper");
    classes.forEach(e => {
      const courseNumber = e.querySelector('.course-number').text;
      if(requestedNumber == courseNumber)
      {
        const courseSubject = e.querySelector('.course-subject').text;
        const courseTitle = e.querySelector('.course-title').text;
        const courseCredits = e.querySelector('.course-credits').text;
        const courseDescription = e.querySelector('.course-summary-paragraph').text;
        const courseGECredits = e.querySelectorAll('.gen-ed-element');
        const creditsText = courseGECredits.map(x => x.text);

        course = {
          Code: `${courseSubject} ${courseNumber}`,
          Title: courseTitle,
          Credits: courseCredits,
        }

        GECategories.forEach(f => {
          course[f] = creditsText.find(el => el == f);
        });

        course.Desc = courseDescription;
      }
    });
  }).catch(err => {
    console.log(err);
  });

  if (!course)
  {
    // slight parsing for the inputted `courseCode`
    courseCode = courseCode.toUpperCase();
    // getting the csv file and parsing it
    const fileContent = await fs.readFile(
      __dirname + "/../../data/20212022GenCat.csv"
    );
    const records = csvParse(fileContent, {
      columns: true,
      escape: "\\",
      skipLinesWithError: true,
    });

    // `course` is object representing the course
    course = records.find((course) => course.Code === courseCode);
  }

  // if course object isn't found
  if (!course)
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
