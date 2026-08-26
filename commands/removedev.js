const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {

  let user = message.mentions.users.first();
  let autor = message.author;


  

       let Desenvolvedor = await db.fetch(`developer4_${autor.id}`);
  if(Desenvolvedor < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, Você não é do Quarto Nível da Equipe de Desenvolvimento do OneBot Para usar este comando!`);
  
  let Desenvolvedo = await db.fetch(`developer3_${user.id}`);
  if(Desenvolvedo > 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${autor}, O Usuário mencionado não é meu Desenvolvedor!`);
  
  if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${autor}, Mencione alguém para Remover da administração`);

  const embed = new Discord.EmbedBuilder()
  .setTitle(`👨‍✈️ **|** Desenvolvedor Removido!`)
     .setDescription(`Desenvolvedor removido!\n\nDesenvolvedor Demitido:\n${user}\n\nDesenvolvedor Responsável: ${autor}`)

  .setFooter({ text: `© Staff OneBot` })
  .setTimestamp();

  db.subtract(`developer4_${user.id}`, 1);
  db.subtract(`developer3_${user.id}`, 1);
  db.subtract(`developer2_${user.id}`, 1);
  db.subtract(`developer_${user.id}`, 1);
  
  message.channel.send({ embeds: [embed] });

}