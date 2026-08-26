const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (bot, message, args) => {
  let user = bot.users.cache.get(args[0]) || message.mentions.users.first() ||  message.author;

     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })

let vida = await db.fetch(`hp_${user.id}`);
  if(vida >= 80) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Sua vida está acima ou igual a **80!** Você não pode usar o Cajado da Cura agora.`)


   let magic = await db.fetch(`magia_${user.id}`);
  if(magic < 5) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Você precisa de **Magia Nível 5** para usar o Cajado da Cura! `);

  
   let item = await db.fetch(`cajado_${user.id}`);
  if(item < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Você não tem um Cajado da Cura para usar!`)
  
  let cargas = await db.fetch(`carga_${user.id}`);
  if(cargas >= 5) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Você usou sua última carga. Agora você não pode usar seu Cajado da Cura até que um Druido lhe ajude!`);

  let sintonizar = await db.fetch(`sintonizado_${user.id}`);
  if(sintonizar <= 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, Você não possuí Sintonização Druida! Por isso você não pode usar o Cajado da Cura!`);

  const carga1 = new Discord.EmbedBuilder()
  .setColor('Random')
  .setTitle(`**Cajado da Cura**`)
  .setDescription(`${message.author}, Você restaurou **70** de Vida! Porém você perdeu 2 carga!`)
  .setFooter({ text: `© RPG OneBot` })
  .setTimestamp();
  message.channel.send({ embeds: [carga1] });

  

  db.add(`hp_${user.id}`, 70);
  db.add(`carga_${user.id}`, 2)
}
