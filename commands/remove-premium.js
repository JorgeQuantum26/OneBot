const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "remove-premium",
  description: "Desative o premium à um usuário.",
  usage: "remove-premium",
  run: async (client, message, args) => {

    let user = message.mentions.users.first() || client.users.cache.get(args[0]);

    if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione um Usuário para desativar O Premium!`);

    
    let premium = await db.fetch(`premiumtag_${user.id}`)
    if(premium < 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Essa pessoa já possuí o ***__Premium__*** desativado!`);


    const embed1 = new Discord.EmbedBuilder()
    .setColor('#e74c3c')
    .setTitle(`**Ocorreu um ERRO ao executar este comando!**`)
    .setDescription(`<a:nao:868232161289986128>|Apenas meu Developer \`Vlad II Dracull#3843\` Pode Executar Este Comando.`)
    .setFooter({ text: `© Equipe OneBot` })
     .setTimestamp();
       if(!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send({ embeds: [embed1] })
     }


    const tag = "Não";
    const plano = `Expirado ou Removido`
    const embed2 = new Discord.EmbedBuilder()
      .setColor('#2ecc71')
    .setTitle(`Premium Desativadotivo!`)
    .setDescription(`O ***__Premium 1, Premium 2 e 3__*** foram desativados com sucesso! 😀\n\nUsuário Premium removido: ${user}\nResponsável: ${message.author}`)
    .setFooter({ text: `Premium OneBot` })
    .setTimestamp();

    message.channel.send({ embeds: [embed2] });

    db.subtract(`premium3_${user.id}`, 1);
    db.subtract(`premium2_${user.id}`, 1);
    db.subtract(`premium1_${user.id}`, 1)
    db.set(`premium_${user.id}`, tag);
    db.set(`premiumplan_${user.id}`, plano)
    db.subtract(`premiumtag_${user.id}`, 1)
  }
}