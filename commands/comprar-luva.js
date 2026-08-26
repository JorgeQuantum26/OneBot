const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "comprar-peso50",
  description: "Use este comando para comprar um Peso para você poder treinar. para usar o comando de Treinar",
  run: async (client, message, args) => {


     let ban = await db.fetch(`banido_${user.id}`);

const embed1 = new Discord.EmbedBuilder()
  .setTitle(`ERRO - BLACKLIST`)
  .setColor('Random')
  .setDescription(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a)\n\nFormas de suporte:\n\n[Servidor, Suporte mais rápido.](https://discord.gg/sVkB8dtKp7)\n[Site(Use para suporte via EMAIL)](https://equipeonebot.wixsite.com/websiteonebot)`)
  if(ban >= 1) return message.channel.send({ embeds: [embed1] })
     let user = message.author;
    let coins = await db.fetch(`rpgcoins_${user.id}`)

      if(coins <= 1000) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você não possuí RPG coins o Suficiente! \`${coins}/1000\` Para realizar esta compra! `);

    let força = await db.fetch(`boxe_${user.id}`);
    if(força >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você já realizou esa compra e já tem Uma **Luva de Boxe**. Não pode comprar novamente.`);

    
    const embed = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`**Compra Realizada com Sucesso!**`)
    .setDescription(`${message.author}, Você comprou uma **Luva de Boxe* Por **1000** Coins com Sucesso!`)
    .setFooter({ text: `© RPG OneBot` })
    .setTimestamp()

    message.channel.send({ embeds: [embed] })

    db.add(`boxe_${user.id}`, 1);
    db.subtract(`rpgcoins_${user.id}`, 1000);
  }
}