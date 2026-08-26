const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;

  let avatar = message.author.displayAvatarURL({ format: 'png' });
  let introducao = await db.fetch(`introducao`) || "Nenhuma instrução definida pelo desenvolvedor";

  let embed = new Discord.EmbedBuilder()
  .setTitle(`📖|Instruções`)
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setDescription(introducao)
  .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] });
}