const { token } = require("./token.json");
const fs = require("fs");
const fsp = require("fs").promises;
const { Client, Collection, MessageEmbed } = require("discord.js");
const { prefix } = require("./config.json");
const nodePackage = require("./package.json");

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
    // Sets a command's category to the folder its in, not used anywhere (yet)
    command.category = folder;
    client.commands.set(command.name, command);
  }
}

// collection for cooldowns
client.cooldowns = new Collection();

client.once("ready", async () => {
  console.log(`GunrockJS is Ready! - ${nodePackage.version}`);
  // Set the bot's activity
  client.user.setActivity("/gunrock", { type: "PLAYING" });

  // loads settings
  client.settings = JSON.parse(
    await fsp.readFile(__dirname + "/guildConfigs.json")
  );
});

// listener for regular messages
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const guilds = client.settings.guilds;

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
      !(checkIfEnabled(command, message))
    )
  ) {
    return message
      .reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Error!")
            .setColor("0xff0000")
            .setDescription("Command not found!")
            .setFooter("This message will self-desctruct in 5 seconds!"),
        ],
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });
  }

  const permissionArray = message.guild.members.cache
    .find((member) => message.author.id == member.id)
    .permissions.toArray();

  if (
    command.permissions &&
    !command.permissions.every((perm) => permissionArray.includes(perm))
  )
    return message
      .reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Error!")
            .setColor("0xff0000")
            .setDescription("You don't have the permissions for that!")
            .setFooter("This message will self-desctruct in 5 seconds!"),
        ],
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });

  if (handleCooldown(command, message)) return;

  try {
    command.execute(message, args, checkEphemerality(command, message));
  } catch (error) {
    console.error(error);
    message
      .reply({
        embeds: [
          new MessageEmbed()
            .setTitle("Error!")
            .setColor("0xff0000")
            .setDescription(
              "It looks like there was an error running this command! Sorry about that."
            )
            .setFooter("This message will self-desctruct in 5 seconds!"),
        ],
      })
      .then((msg) => {
        setTimeout(() => msg.delete(), 5000);
      });
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
    (!command.permissions ||
      interaction.member.permissions.has(command.permissions)) &&
    !(checkIfEnabled(command, interaction))
  ) {
    try {
      command.slash_execute(interaction, checkEphemerality(command, interaction));
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

/**
 * Checks if command is enabled in guild settings.
 */
const checkIfEnabled = (command, messageOrInteraction) => {
  const guilds = messageOrInteraction.client.settings.guilds;
  const guild = guilds.find(
    (guild) => guild.id == messageOrInteraction.guild.id
  );
  if (!guild) return false;
  const commandSetting = guild.commandSettings.find(
    (commandSetting) => commandSetting.name == command.name
  );
  if (!commandSetting) return false;
  if (typeof commandSetting.enabled === 'boolean') return commandSetting.enabled;
  return false;
};

/**
 * Checks if command is enabled in guild settings.
 */
const checkEphemerality = (command, messageOrInteraction) => {
  const guilds = messageOrInteraction.client.settings.guilds;
  const guild = guilds.find(
    (guild) => guild.id == messageOrInteraction.guild.id
  );
  if (!guild) return false;
  
  const commandSetting = guild.commandSettings.find(
    (commandSetting) => commandSetting.name == command.name
  );
  if (!commandSetting || typeof commandSetting.ephemeral !== "boolean") {
    if (typeof guild.ephemeral === "boolean") return guild.ephemeral;
    return false;
  }
  return commandSetting.ephemeral;
};

/**
 * Checks if cooldown has elapsed or not.
 * @param {*} command name of the command
 * @param {*} messageOrInteraction the message or interaction that is the cause of the command
 * @returns 0 if the cooldown done, 1 if it is not done and sends an error message.
 */
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
      // TO DO: should probably make it self delete if it is not an interaction response
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
