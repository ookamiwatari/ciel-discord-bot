const cmd = require('discord.js-commando');
const path = require('path');

const client = new cmd.CommandoClient({
	commandPrefix: '/',
	unknownCommandResponse: false
});

client.registry
	.registerDefaultTypes()
	.registerGroups([['utils', 'Utility']])
	.registerDefaultGroups()
	.registerDefaultCommands()
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(process.env.DISCORD_BOT_TOKEN);
