const Discord = require("discord.js");
const db = require('../systems/firestore');


 exports.run = async (bot, message, args) => {

    let user = bot.users.cache.get(args[0]) || message.mentions.users.first() || message.author;

     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })


   let rpg = await db.fetch(`rpgcoins_${user.id}`)
   if(rpg === null) rpg = 0;

   let roubado = await db.fetch(`sujo_${user.id}`)
      const vlad_embed = new Discord.EmbedBuilder() //O Nome pode ser qualquer um.
    .setTitle(`Carteira`)
     .setColor(Math.floor(Math.random() * 0xffffff))
    .setDescription(`Carteira de ${user}\n\n💵 **|** Dinheiro: **${rpg}**\n\n💰 **|** Dinheiro sujo: **${roubado}**\n\n`) 
   .setFooter({ text: `© RPG OneBot` })
    .setTimestamp();

   message.channel.send({ embeds: [vlad_embed] });
 } 
