const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;


  

       let Desenvolvedor = await db.fetch(`developer4_${autor.id}`);
  if(Desenvolvedor < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, Você não é do Quarto Nível da Equipe de Desenvolvimento do OneBot Para usar este comando!`);
  
  let Desenvolvedo = await db.fetch(`developer3_${user.id}`);
  if(Desenvolvedo > 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, O Usuário mencionado já é da Equipe Responsável Por Supervisionar os outros desenvolvedorrs!`);
  
  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para virar Membro Da Equipe Responsavel Por Supervisionar os outros desenvolvedores!`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`👨‍✈️ **|** Novo Desenvolvedor!`)
     .setDescription(`Desenvolvedor novo!\n\nNovo Desenvolvedor Responsável Por Monitorar os outros Desenvolvedores:\n${user}\n\nDesenvolvedor Responsável: ${autor}`)

  .setFooter({ text: `© Staff OneBot` })
  .setTimestamp();

  db.add(`developer3_${user.id}`, 1);
  
  message.channel.send({ embeds: [embed] });

}