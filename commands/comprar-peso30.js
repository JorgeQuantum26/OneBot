const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "comprar-peso",
  description: "Use este comando para comprar um Peso para você poder treinar. para usar o comando de Treinar",
  run: async (client, message, args) => {

     let user = message.author;
    let coins = await db.fetch(`rpgcoins_${user.id}`)

      if(coins <= 1310) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você não possuí RPG coins o Suficiente! \`${coins}/1310\` Para realizar esta compra!\n\nUse \`B!treinar\``);

    let força = await db.fetch(`peso_${user.id}`);
    if(força >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você já realizou esa compra e já tem Um **Peso**. Não pode comprar novamente.`);

    
    const embed = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`**Compra Realizada com Sucesso!**`)
    .setDescription(`${message.author}, Você comprou um **Peso** de 30kg Por **1310** Coins com Sucesso!`)
    .setFooter({ text: `© RPG OneBot` })
    .setTimestamp()

    message.channel.send({ embeds: [embed] })

    db.add(`peso_${user.id}`, 1);
    db.subtract(`rpgcoins_${user.id}`, 1310);
  }
}