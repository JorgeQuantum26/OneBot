const Discord = require("discord.js");

const db = require('../systems/firestore');


exports.run = async (bot, message, args) => {    
    if (!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(`<a:nao:868232161289986128>|Apenas meus Desenvolvedores Podem Executar Este Comando!`) 
    };

    let user = message.mentions.users.first();

    if (!user) {
        return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Mencione um usuário!`);
    };

    if (isNaN(args[1])) {
        return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Insira um Número Válido!`);
    };

    db.add(`exp_${user.id}`, args[1]);
    

    let moneyEmbed = new Discord.EmbedBuilder()
    .setTitle("💰**|** EXP setados!")
    .setColor("#000001")
    .setDescription(`Exp adicionado Com Sucesso!`)
    .addFields({ name: `EXP Setados:`, value: `${args[1]}`, inline: true })
    .addFields({ name: `Setado Por:`, value: `${message.author}`, inline: true })
    .addFields({ name: `Setado Para:`, value: `${user}`, inline: true })
    .setFooter({ text: `© Economia - OneBot` });
    message.channel.send({ embeds: [moneyEmbed] });
}


