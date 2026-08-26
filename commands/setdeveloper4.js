const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;


  

  let Desenvolvedo = await db.fetch(`developer4_${user.id}`);
  if(Desenvolvedo > 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, O Usuário mencionado já é da Equipe Responsável Por Adicionar outros desenvolvedores!`);
  
  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para virar Membro Da Equipe Responsavel Por Adicionar outros desenvolvedores!`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`👨‍✈️ **|** Novo Desenvolvedor!`)
     .setDescription(`Desenvolvedor novo!\n\nNovo membro da Equipe de Administração Geral:\n${user}\n\nDesenvolvedor Responsável: ${autor}`)

  .setFooter({ text: `© Staff OneBot` })
  .setTimestamp();

  db.add(`developer4_${user.id}`, 1);
  db.add(`developer3_${user.id}`, 1);
  db.add(`developer2_${user.id}`, 1);  
  db.add(`developer_${user.id}`, 1);
  message.channel.send({ embeds: [embed] });

}