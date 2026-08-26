const { EmbedBuilder } = require('discord.js');
const db = require('../systems/firestore');
exports.run = async (client, message, args) => {
  const user = message.mentions.users.first() || client.users.cache.get(args[0]);
  if (!user) return message.channel.send('Mencione um usuário.');
  db.set(`premium2_${user.id}`, true); db.set(`premium_${user.id}`, 'Usuário é Premium'); db.set(`premiumplan_${user.id}`, 'Premium 2');
  return message.channel.send({ embeds: [new EmbedBuilder().setColor('Green').setTitle('Premium ativo').setDescription(`${user} recebeu o Premium 2.`)] });
};
