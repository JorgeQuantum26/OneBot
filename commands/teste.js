const Discord = require("discord.js");

const db = require('../systems/firestore');

   exports.run = async (bot, message, args) => {
   let dinheiro = await db.fetch(`money_${message.guild.id}`)
  
  const embed = new Discord.EmbedBuilder()
    .setTitle(`oi`)
    .setDescription(`oii ${dinheiro}`)
   .setColor(Math.floor(Math.random() * 0xffffff));
   
   message.channel.send({ embeds: [embed] })
 }