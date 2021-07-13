const { token } = require("./token.json");
const fs = require("fs");
const fsp = require("fs").promises;
const { Client, Collection, MessageEmbed } = require("discord.js");
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

// collection for cooldowns
client.cooldowns = new Collection();

client.once("ready", () => {
  console.log("GunrockJS is Ready!");
  // Set the client user's activity
  client.user.setActivity("your mom", { type: "WATCHING" });
});

// listener for regular messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // loads settings
  const settings = JSON.parse(
    await fsp.readFile(__dirname + "/guildConfigs.json")
  );
  const guilds = settings.guilds;

  // guild is the object of settings for the guild that the settings command was sent from
  let guild = guilds.find((guild) => guild.id == message.guild.id);

  let tempPrefix = prefix; // probably should rename tempPrefix/prefix

  if (guild && guild.prefix) {
    tempPrefix = guild.prefix;
  }

  if (!message.content.startsWith(tempPrefix)) return;

  const args = message.content.slice(tempPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command =
    client.commands.get(commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
    );

  if (
    !(
      command &&
      command.hasCommand &&
      !(await checkIfEnabled(command, message))
    )
  ) {
    return message.reply("Command not found!");
  }

  const permissionArray = message.guild.members.cache
    .find((member) => message.author.id == member.id)
    .permissions.toArray();

  if (
    command.permissions &&
    !command.permissions.every((perm) => permissionArray.includes(perm))
  )
    return message.reply("You don't have the permissions for that!");

  if (handleCooldown(command, message)) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply("There was an error trying to execute that command!");
  }
});

// Listener for slash commands
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command =
    client.commands.get(interaction.commandName) ||
    client.commands.find(
      (cmd) => cmd.aliases && cmd.aliases.includes(interaction.commandName)
    );
  if (handleCooldown(command, interaction)) return;

  if (
    command &&
    command.hasSlash &&
    interaction.member.permissions.has(command.permissions) &&
    !(await checkIfEnabled(command, interaction))
  ) {
    try {
      command.slash_execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "There was an error trying to execute that command!",
        ephemeral: true,
      });
    }
  } else {
    interaction.reply({
      embeds: [
        new MessageEmbed()
          .setTitle("Error!")
          .setDescription(
            "This command is not available! It is likely that it has been disabled for this guild."
          )
          .setColor("#ff0000"),
      ],
      ephemeral: true,
    });
  }
});

// listener for button interactions
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;

  const command = client.commands.get(interaction.customId);
  if (handleCooldown(command, interaction)) return;

  if (
    command &&
    command.hasButton &&
    interaction.member.permissions.has(command.permissions)
  ) {
    try {
      command.button_execute(interaction);
    } catch (error) {
      console.error(error);
      interaction.reply({
        content: "There was an error trying to execute that command!",
        ephemeral: true,
      });
    }
  }
});

const checkIfEnabled = async (command, messageOrInteraction) => {
  const guilds = JSON.parse(
    await fsp.readFile(__dirname + "/guildConfigs.json")
  ).guilds;
  const guild = guilds.find(
    (guild) => guild.id == messageOrInteraction.guild.id
  );
  if (!guild) return 0;
  const commandSetting = guild.commandSettings.find(
    (commandSetting) => commandSetting.name == command.name
  );
  if (!commandSetting) return 0;
  return !commandSetting.enabled;
};

const handleCooldown = (command, messageOrInteraction) => {
  const { cooldowns } = client;

  let userId = 0;
  if (messageOrInteraction.author) userId = messageOrInteraction.author.id;
  else userId = messageOrInteraction.user.id;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  if (timestamps.has(userId)) {
    const expirationTime = timestamps.get(userId) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      // sends error message if timeout has not expired.
      // commented out is logic to automatically delete the message. does not work for interaction replies
      messageOrInteraction.reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Command Failed!")
            .setColor("#ff0000")
            .setDescription(
              `please wait ${timeLeft.toFixed(
                1
              )} more second(s) before reusing the \`${command.name}\` command.`
            ),
          //.setFooter("This message will automatically delete in 5s"),
        ],
        ephemeral: true,
      });
      // .then((msg) => {
      //   setTimeout(() => msg.delete(), 5000);
      // });
      return 1;
    }
  }

  timestamps.set(userId, now);
  setTimeout(() => timestamps.delete(userId), cooldownAmount);
  return 0;
};

client.login(token);
