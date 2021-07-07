const { token } = require("./token.json");
const fs = require("fs");
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
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = client.commands.get(args.shift().toLowerCase());

  if (!(command && command.hasCommand)) {
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

  const command = client.commands.get(interaction.commandName);
  if (handleCooldown(command, interaction)) return;

  if (
    command &&
    command.hasSlash &&
    interaction.member.permissions.has(command.permissions)
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
