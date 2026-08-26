const Discord = require("discord.js");

const db = require('../systems/firestore');


exports.run = async (bot, message, args) => {   
    
    let user = message.mentions.users.first();
   let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    if (!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(`<a:nao:868232161289986128>|Apenas meus Desenvolvedores Podem Executar Este Comando!`) 
    };


    if (!user) {
        return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Mencione um usuário!`);
    };

    if (isNaN(args[1])) {
        return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Insira um Número Válido!`);
    };

    db.subtract(`money_${message.guild.id}_${user.id}`, args[1]);
    let bal = await db.fetch(`money_${user.id}`);

    let moneyEmbed = new Discord.EmbedBuilder()
    .setTitle("💰**|** Coins Removidos!")
    .setColor("#000001")
    .setDescription(`Coins Removidos Com Sucesso!`)
    .addFields({ name: `Coins Removidos:`, value: `${args[1]}`, inline: true })
    .addFields({ name: `Removido Por:`, value: `${message.author}`, inline: true })
    .addFields({ name: `Removido de:`, value: `${user}`, inline: true })
    .setFooter({ text: `© Economia - OneBot` });
    message.channel.send({ embeds: [moneyEmbed] });
}