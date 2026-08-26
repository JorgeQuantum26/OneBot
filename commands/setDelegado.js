const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;

  const delegacia = "Sim";
  
     let Desenvolvedor = await db.fetch(`developer_${autor.id}`);
  if(Desenvolvedor < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, Você não é da Equipe de Desenvolvimento Para usar este comando!`);

  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para virar Delegado!`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`👨‍✈️ **|** Novo Delegado!`)
    .addFields(
                { name: 'Dêem as boas vindas ao novo delegado!:', value: ``, inline: true},
      { name: 'Novo Delegado:', value: `${user}`, inline: true},
      { name: 'Desenvolvedor Responsável:', value: `${autor}`, inlins: true})

  .setFooter({ text: `© RPG OneBot` })
  .setTimestamp();

  db.set(`delegado_${user.id}`, delegacia);
  
  message.channel.send({ embeds: [embed] });

}