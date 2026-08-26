const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;

  
       let Desenvolvedor = await db.fetch(`developer3_${autor.id}`);
  if(Desenvolvedor < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, Você não é da Equipe De Administração Geral do OneBot Para usar este comando!`);


  let Desenvolvedo = await db.fetch(`developer_${user.id}`);
  if(Desenvolvedo > 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, O Usuário mencionado já é meu Staff!`);
  

if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para virar Membro Da Equipe de Desenvolvimento!`)

const jorge1 = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`👨‍✈️ **|** Novo Desenvolvedor!`)
    .setDescription(`Desenvolvedor novo!\n\nNovo Desenvolvedor:\n${user}\n\nDesenvolvedor Responsável: ${autor}`)

  .setFooter({ text: `© Staff OneBot` })
  .setTimestamp();

  db.add(`developer_${user.id}`, 1);
  
  message.channel.send({ embeds: [jorge1] });

}