const Discord = require("discord.js");
const db = require('../systems/firestore');


exports.run = async (client, message, args) => {

  let user = message.author;




  let mensagem = args.slice(" ").join(" ");

  if(!mensagem) return message.channel.send(`<a:nao:868232161289986128>**|**${user}, Escreva algo!`)


    let argumento = args.slice(" ").join(" ");

if(!message.member.hasPermission(`MANAGE_MESSAGES`)) return message.channel.send(`<a:nao:868232161289986128>**|**${user}, Você não possuí a permissão de \`Gerenciar Mensagens\` para executar este comando! `)

// Namoral vou testar um bglh aqui kkkkkkkk.

  const embed1 = new Discord.EmbedBuilder()
  .setTitle(`Mensagem`)
  .setColor('Random')
  .setDescription(`${mensagem}\n\nMensagem enviada por: ${user}`)
  .setFooter({ text: `© OneBot ` })
  .setTimestamp();

     message.delete();

  message.channel.send({ embeds: [embed1] }); 

}