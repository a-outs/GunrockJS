const { token } = require("./token.json");
const fs = require("fs");
const { Client, Collection } = require("discord.js");
const { prefix } = require("./config.json");

const client = new Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

// The following allows commands to be read in from ./commands/ as exported modules. These cannot be hotloaded, the entire program must be re run as of now.
client.commands = new Collection();

const commandFolders = fs.readdirSync("./commands");

for (const folder of commandFolders) {
  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

client.once("ready", () => {
  console.log("GunrockJS is Ready!");
  // Set the client user's activity
  client.user.setActivity("your mom", { type: "WATCHING" });
});

// listener for regular messages
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (
    !(client.commands.has(command) && client.commands.get(command).hasCommand)
  ) {
    message.reply("Command not found!");
    return;
  }

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }
});

// Listener for slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (
    client.commands.has(interaction.commandName) &&
    client.commands.get(interaction.commandName).hasSlash
  ) {
    try {
      client.commands.get(interaction.commandName).slash_execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply("There was an error trying to execute that command!");
    }
  }
});

// listener for button interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  if (
    client.commands.has(interaction.customId) &&
    client.commands.get(interaction.customId).hasButton
  ) {
    try {
      client.commands.get(interaction.customId).button_execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply("There was an error trying to execute that command!");
    }
  }
});

client.login(token);
