const { token } = require('./config.json');
const fs = require('fs');
const Discord = require('discord.js');

// for discord.js v13 (and by extension, Discord API v8), intents are required on initialization.
// List of intents can be found here: https://discord.com/developers/docs/topics/gateway#list-of-intents
// discord.js intents class docs: https://discord.js.org/#/docs/main/stable/class/Intents
const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MESSAGES'] });

// The following allows commands to be read in from ./commands/ as exported modules. These cannot be hotloaded, the entire program must be re run as of now.
client.commands = new Discord.Collection();
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

// misc global variables
const timmieID = '372696487290863618';

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', async (message) => {
    const prefix = '%';

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'deploy' && message.author.id === timmieID) {
        const data = [
            {
                name: 'ping',
                description: 'Replies with Pong!',
                options: [
                    {
                        name: 'input',
                        description: 'Enter a string',
                        type: 'STRING',
                    },
                    {
                        name: 'num',
                        description: 'Enter an integer',
                        type: 'INTEGER',
                    },
                    {
                        name: 'choice',
                        description: 'Select a boolean',
                        type: 'BOOLEAN',
                    },
                    {
                        name: 'target',
                        description: 'Select a user',
                        type: 'USER',
                    },
                    {
                        name: 'destination',
                        description: 'Select a channel',
                        type: 'CHANNEL',
                    },
                    {
                        name: 'muted',
                        description: 'Select a role',
                        type: 'ROLE',
                    },
                ],
            },
            {
                name: 'beep',
                description: 'Replies with Boop!',
            },
            {
                name: 'joe',
                description: 'Replies with Mama!',
            },
        ];

        await client.guilds.cache.get(message.guild.id).commands.set(data);
        // to update slash commands GLOBALLY run the following line
        // await client.application?.commands.set(data);
        // console.log(command);

        message.reply(
            'Slash commands successfully deployed in GUILD ' +
                message.guild.name,
        );
        const exampleEmbed = new Discord.MessageEmbed().setTitle('Some title');
        message.channel.send({
            embeds: [exampleEmbed, exampleEmbed],
        });
        return;
    }

    if (!client.commands.has(command)) {
        message.reply('Command not found!');
        return;
    }

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.on('interaction', async (interaction) => {
    if (!interaction.isCommand()) return;
    if (interaction.commandName === 'ping') {
        const { value: string } = interaction.options.get('input');
        const { value: integer } = interaction.options.get('num');
        const { value: boolean } = interaction.options.get('choice');
        const { user } = interaction.options.get('target');
        const { member } = interaction.options.get('input');
        const { channel } = interaction.options.get('destination');
        const { role } = interaction.options.get('muted');

        console.log([string, integer, boolean, user, member, channel, role]);
        await interaction.reply('Pong!');
    }
    if (interaction.commandName === 'beep') {
        await interaction.reply({ content: 'Boop!', ephemeral: true });
    }
    if (interaction.commandName === 'joe') {
        await interaction.channel.send('mama');
    }

    // console.log(interaction);
});

client.login(token);
