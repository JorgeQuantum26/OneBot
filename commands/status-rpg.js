const Discord = require('discord.js');
const db = require('../systems/rpg-db');
exports.run = async (bot, message, args) => {
    let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.author;

    let vida = (await db.fetch(`hp_${user.id}`)) || 100;
    let fome = (await db.fetch(`fome_${user.id}`)) || 50;

    let velocidade = (await db.fetch(`velocidade_${user.id}`)) || 10;

    let força = await db.fetch(`força_${user.id}`);
    if (força === null) força = 0;

    let exp = await db.fetch(`exp_${user.id}`);
    if (exp === null) exp = 0;

    let abate = await db.fetch(`kill_${user.id}`);
    if (abate === null) abate = 0;

    let energia = await db.fetch(`energia_${user.id}`);
    if (energia === null) energia = 0;

    let premiums = await db.fetch(`premium_${user.id}`);
    if (premiums === null) premiums = 'Usuário não é Premium';

    let level = await db.fetch(`levelup_${user.id}`);
    if (level === null) level = 0;
    if (premiums >= 1) {
        const embed1 = new Discord.EmbedBuilder() // Errei aqui kakaka botei return message.channel.send(``) antes do = new e tals
            .setColor(0x00ffff)
            .setTitle(`Status de ${user} **(Premium)**`)
            .addFields(
                { name: 'Vida:', value: `${vida}`, inline: true },

                { name: 'Fome', value: `${fome}`, inline: true },

                { name: 'Velocidade', value: `${velocidade}`, inline: true },

                { name: 'Força:', value: `${força}`, inline: true },

                { name: 'Experiência:', value: `${exp}`, inline: true },

                { name: 'Força:', value: `${força}`, inline: true },

                { name: 'Monstros Abatidos:', value: `${abate}`, inline: true },

                { name: 'Energia:', value: `${energia}`, inline: true },

                { name: ' Premium? ', value: `${premiums}`, inline: true },

                { name: ' Nível', value: `${level}`, inline: true }
            )

            .setFooter({ text: `© Comando Executado por ${message.author.username}` })
            .setTimestamp();
        message.channel.send({ embeds: [embed1] });
    } else {
        const embed2 = new Discord.EmbedBuilder()
            .setColor(0x00ffff)
            .setTitle(`Status de ${user}`)
            .addFields(
                { name: 'Vida:', value: `${vida}`, inline: true },

                { name: 'Fome', value: `${fome}`, inline: true },

                { name: 'Velocidade', value: `${velocidade}`, inline: true },

                { name: 'Força:', value: `${força}`, inline: true },

                { name: 'Experiência:', value: `${exp}`, inline: true },

                { name: 'Força:', value: `${força}`, inline: true },

                { name: 'Monstros Abatidos:', value: `${abate}`, inline: true },

                { name: 'Energia:', value: `${energia}`, inline: true },

                { name: ' Premium? ', value: `${premiums}`, inline: true },

                { name: ' Nível', value: `${level}`, inline: true }
            )
            .setFooter({ text: `© Comando Executado por ${message.author.username}` })
            .setTimestamp();
        message.channel.send({ embeds: [embed2] });
    }
};
