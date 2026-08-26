const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async(client, message, args) => {

  let user = message.author;

     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
    let força = await db.fetch(`vip1_${user}`);
    if(força >= 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${user}, Você Já possuí Vip!`)

  let coin = await db.fetch(`rpgcoins_${user.id}`);
  if(coin < 30000) return message.channel.send(`<a:nao:868232161289986128>**|** ${user}, Você Não Tem RPG Coins o Suficiente \`${coin}/30.000\` Para Realizar essa compra!`)
  
  const embed = new Discord.EmbedBuilder()
  .setTitle(`<:user_vip:1074455285399302154> | **VIP!**`)
  .setColor('Random')
   .setDescription(`${user}, Você comprou o **VIP** por **30.000 RPG Coins** Com sucesso!`)
    .setFooter({ text: `© RPG OneBot` })
    .setTimestamp()

  db.add(`vip1_${user.id}`, 1);
  db.subtract(`rpgcoins_${user.id}`, 30000)
  message.channel.send({ embeds: [embed] })
}