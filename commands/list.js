const Discord = require('discord.js');

exports.run = async (client, message, args) => {

const embed = new Discord.EmbedBuilder()
.setColor(Math.floor(Math.random() * 0xffffff))
.setTitle("Sua Lista De Tasks")
.setDescription("Tasks Disponiveis para fazer\n\nFios\nUpload")
.setFooter({ text: "Para Fazer Suas Task Digite B!task, Para Iniciar O Jogo B!among" })
.setTimestamp();
message.channel.send({ embeds: [embed] })
}