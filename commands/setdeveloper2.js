const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;


  

       let Desenvolvedor = await db.fetch(`developer3_${user.id}`);
  if(Desenvolvedor < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, Você não é do Terceiro Nível da Equipe de Desenvolvimento do OneBot Para usar este comando!`);
  
  let Desenvolvedo = await db.fetch(`developer_${user.id}`);
  if(Desenvolvedo > 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, O Usuário mencionado já é da Equipe Responsável Pela Blacklist!`);
  
  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para virar Membro Da Equipe Responsável pela Blacklist!`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`👨‍✈️ **|** Novo Desenvolvedor!`)
     .setDescription(`Desenvolvedor novo!\n\nNovo Desenvolvedor Responsável Pela Blacklist:\n${user}\n\nDesenvolvedor Responsável: ${autor}`)

  .setFooter({ text: `© Staff OneBot` })
  .setTimestamp();

  db.add(`developer2_${user.id}`, 1);
  
  message.channel.send({ embeds: [embed] });

}