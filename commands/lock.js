const { PermissionFlagsBits } = require('discord.js');
exports.run = async (client, message) => { if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) return message.channel.send('❌ Permissão insuficiente.'); await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }); return message.channel.send('🔒 Canal bloqueado.'); };
