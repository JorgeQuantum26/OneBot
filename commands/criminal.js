const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
   name: "criminal",
  description: "Torne-se Criminoso e faça lavagem de dinheiros, roubos e tals.",
  run: async (client, message, args) => {

     let user = message.author;
  const criminoso = "Criminoso";


     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
    let Militaria = await db.fetch(`militar_${user.id}`)
    if(Militaria >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você é militar e não pode virar um Criminoso servindo ao Exército!`);
   let criminal = await db.fetch(`crime_${user.id}`)

    if(criminal >= 1 ) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Você já é um Criminoso! não pode se tornar outro novamente.`);

    const embed = new Discord.EmbedBuilder()
    .setColor('Random')
    .setDescription(`
    ${message.author}, Você se tornou um Criminoso! Seu Status(Perfil) Foi Alterado! \`B!perfil\` `)
    .setFooter({ text: { text: `© RPG OneBot`, iconURL: message.author.displayAvatarURL({dynamic: true}) } })
    .setTimestamp();
      db.set(`crime_${user.id}`, 1);
  
    db.set(`crimial_${user.id}`, criminoso)
    message.channel.send({ embeds: [embed] });
  }
}