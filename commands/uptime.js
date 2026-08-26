const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  


let totalSeconds = client.uptime / 1000;
  let days = Math.floor(totalSeconds / 86400);
  let hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  let uptime = `⏰ ${days.toFixed()} dias\n⏰ ${hours.toFixed()} horas\n⏰ ${minutes.toFixed()} minutos\n⏰ ${seconds.toFixed()} segundos`;

  const embed = new Discord.EmbedBuilder()
    .setTitle(`<:ping:806561607060029450>|Meu Uptime `)
    .setThumbnail("https://cdn.discordapp.com/emojis/806561607060029450.png?size=2048")
    .setColor("#FF0000")
    .setDescription(`**<:ping:806561607060029450>|Estou online há:**\n${uptime}`)


  message.channel.send({ embeds: [embed] })
}