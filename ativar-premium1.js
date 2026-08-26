const Discord = require("discord.js");
const db = require('./systems/firestore');

module.exports = {
  name: "ativar-premium",
  aliases: ['setpremium', 'activate-premium', 'addpremium'],
  description: "Ative o premium à um usuário.",
  usage: "ativar-premium1",
  run: async (client, message, args) => {

    let user = message.mentions.users.first() || client.users.cache.get(args[0]);


    if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione um Usuário para ativar O Premium!`);

    
    let premium = await db.fetch(`premium1_${user.id}`)
    if(premium >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Essa pessoa já possuí o ***__Premium 1__*** ativado!`);

    const embed1 = new Discord.MessageEmbed()
    .setColor('#e74c3c')
    .setTitle(`**Ocorreu um ERRO ao executar este comando!**`)
    .setDescription(`<a:nao:868232161289986128>|Apenas meu Developer \`Vlad II Dracull#3843\` Pode Executar Este Comando.`)
    .setFooter(`© Equipe OneBot`)
     .setTimestamp();
       if(!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(embed1)
     }


    const tag = "Usuário é Premium 💎";
    const plano = `Premium 1`
    const embed2 = new Discord.MessageEmbed()
      .setColor('#2ecc71')
    .setTitle(`Premium Ativo!`)
    .setDescription(`O ***__Premium 1__*** foi ativado com sucesso! 😀\n\nNovo Usuário Premium: ${user}\nResponsável: ${message.author}`)
    .setFooter(`Premium OneBot`)
    .setTimestamp();

    message.channel.send(embed2);

    db.set(`premium1_${user.id}`, true);
    
    db.set(`premium_${user.id}`, tag);
     db.set(`premiumplan_${user.id}`, plano)
  }
}