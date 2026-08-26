const { EmbedBuilder } = require('discord.js');
exports.run = async (client, message) => message.channel.send({ embeds: [new EmbedBuilder().setTitle('OneBot').setDescription('Bot online e operando com Discord.js v14.').setColor('Blue')] });
