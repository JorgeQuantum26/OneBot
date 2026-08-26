const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;
      let pessoa = message.mentions.users.first() || message.author;

  let nivel = await db.fetch(`magia_${user}`);
  if(nivel === null) nivel = 0;

  let classe = await db.fetch(`mago_${user.id}`);
  if(classe === null) classe = "Nenhum";

  let sintonizar = await db.fetch(`sintonizado`);
  if(sintonizar === null) sintonizar = "Não sintonizou Ninguém.";
  const embed = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`Status de Magia de ${pessoa}`)
    .addFields(
                { name: 'Classe de Mago:', value: `${classe}`, inline: true},
      
                { name: 'Nivel de Magia:', value: `${nivel}`, inline: true},

                { name: 'Quantidade de sintonizados:', value: `${sintonizar}`, inline: true})
.setFooter({ text: `© RPG OneBot` })
  .setTimestamp();

  message.channel.send({ embeds: [embed] })
} 