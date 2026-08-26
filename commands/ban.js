const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
exports.run = async (client, message, args) => {
  if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return message.channel.send('❌ Você não possui permissão para banir membros.');
  const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
  if (!member) return message.channel.send('Mencione um membro.');
  await member.ban({ reason: args.slice(1).join(' ') || 'Sem motivo informado' });
  return message.channel.send({ embeds: [new EmbedBuilder().setColor('Green').setTitle('Banimento efetuado').setDescription(`${member.user.tag} foi banido.`)] });
};
