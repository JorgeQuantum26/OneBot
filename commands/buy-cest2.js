const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

   let user = message.author;

  
     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
  let coins = await db.fetch(`money_${user.id}`)

  if(coins < 15000) return message.channel.send(`Você não possui **15.000** Coins para efetuar está compra `);

  let cesta = await db.fetch(`cesta_${user.id}`)

  if(cesta >= 1) return message.channel.send(`Você já comprou a cesta!`);

 const embed = new Discord.EmbedBuilder()
   
  .setTitle(`Compra realizada`)
   .setDescription(`Você comprou **1** Cesta de doces por **15.000** Coins com sucesso`)
.setFooter({ text: `© Halloween - OneBot` })
.setTimestamp();

    message.channel.send({ embeds: [embed] })

  db.add(`cesta_${user.id}`, 1)
  db.subtract(`money_${user.id}`, 15000)
   }