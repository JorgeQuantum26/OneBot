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

    db.add(`money_${message.guild.id}_${user.id}`, args[1]);
    let bal = await db.fetch(`money_${message.guild.id}_${user.id}`);

    let moneyEmbed = new Discord.EmbedBuilder()
    .setTitle("💰**|** Coins setados!")
    .setColor("#000001")
    .setDescription(`Coins Setados Com Sucesso!`)
    .addFields({ name: `Coins Setados:`, value: `${args[1]}`, inline: true })
    .addFields({ name: `Setado Por:`, value: `${message.author}`, inline: true })
    .addFields({ name: `Setado Para:`, value: `${user}`, inline: true })
    .setFooter({ text: `© Economia - OneBot` });
    message.channel.send({ embeds: [moneyEmbed] });
}