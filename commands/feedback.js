const Discord = require('discord.js')

module.exports = {
    name: 'feedback',
    description: 'Envie feedback para o bot',
    usage: 'feedback <feedback>',
    category: 'Utility',
    guildOnly: true,
    run: async (client, message, args) => {
        message.delete();
        let feednumber = message.content.split(" ").slice(1)
        let feedstr = message.content.split(" ").slice(2).join(" ");
        let feednumber1 = parseInt(feednumber)
        if (!feedstr) return message.channel.send({embed: {
            color: 16711680,
            description: `Avalie esse bot em uma escala de 1 a 5 com um motivo\n\`Exemplo: B!feedback 5 tem comandos incríveis\``
        }}).then(msg => msg.delete({timeout: 10000}));

        if (!feednumber1 || isNaN(parseInt(feednumber)) || parseInt(feednumber) <= 0 || parseInt(feednumber) > 5) return message.channel.send({embed: {
            color: 16711680,
            description: `<a:X_Icon:806588437049638992>┃ **Por favor avaliação de 1 a 5**`
        }}).then(msg => msg.delete({timeout: 10000}));

        if (feednumber1 > 5) return message.channel.send(`<a:X_Icon:806588437049638992>┃Por Favor, Avalie o bot em uma escala de 1 - 5 com um motivo\n\`Exemplo: B!feedback 5 tem comandos incriveis\``)
        let stararray = []
        for (i = 0; i < feednumber1; i++) {
            stararray.push("⭐")
        }
        let embeddm = new Discord.EmbedBuilder()
            .setTitle(`Nova Avaliação`)
            .addFields({ name: `⭐┃ Estrelas:`, value: `> ${stararray.join("")}`, inline: false })
            .setColor("#00FF00")
            .addFields({ name: `📝 ┃ Comentário:`, value: `> \`${feedstr}\` `, inline: false })
            .addFields({ name: `❕┃ Autor do feedback:`, value: `> \`${message.author.username}\` `, inline: true })
            .addFields({ name: "🆔 ┃ ID:", value: `> \`${message.author.id}\` `, inline: false })
            .setThumbnail(message.author.displayAvatarURL({
                dynamic: true
            }))
            .setTimestamp()
            .setFooter({ text: `${message.guild.name}` });
        await message.channel.send({ embeds: [embed] })
    }
}