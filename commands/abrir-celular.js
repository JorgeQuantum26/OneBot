const { EmbedBuilder } = require('discord.js');
const db = require('../systems/firestore');
exports.run = async (client, message, args) => {
  const celular = args.join(' ') || message.content.slice(16).trim();
  if (!celular) return message.channel.send('Informe o celular.');
  const dados = db.get(`${celular}`) || {};
  return message.channel.send({ embeds: [new EmbedBuilder().setTitle(celular).addFields({ name: 'Memória interna', value: `${dados.memoria_interna || 0} GB`, inline: true }, { name: 'Memória externa', value: `${dados.memoria_externa || 0} GB`, inline: true })] });
};
