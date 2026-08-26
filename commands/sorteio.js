const { EmbedBuilder } = require('discord.js');
exports.run = async (client, message, args) => { const premio = args.join(' ') || 'prêmio surpresa'; return message.channel.send({ embeds: [new EmbedBuilder().setTitle('🎉 Sorteio').setDescription(`Prêmio: **${premio}**\nReaja com 🎉 para participar.`)] }); };
