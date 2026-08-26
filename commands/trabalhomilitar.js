const Discord = require('discord.js');
const ms = require('parse-ms');

const db = require('../systems/rpg-db');

module.exports = {
    name: 'trabalhomilitar',
    description: 'Trabalhe como Militar',
    timeout: 1000,
    run: async (bot, message, args) => {
        let user = message.author;
        let timeout = 3600000;

        const militar1 = await db.fetch(`militaria_${user.id}`);
        if (militar1 < 1) return message.channel.send(`<a:nao:868232161289986128>**|**${user}, Voce não é militar.`);
        let militaria2 = await db.fetch(`militaria1_${user.id}`);
        if (militaria2 !== null && timeout - (Date.now() - militaria2) > 0) {
            const time = ms(timeout - (Date.now() - militaria2));

            const timeEmbed = new Discord.EmbedBuilder()
                .setColor(0x992d22)
                .setTitle(`**Exército Brasileiro**`)
                .setDescription(
                    `<a:nao:868232161289986128>|${message.author}, Você Já Trabalhou recentemente! Aguarde \`${time.hours} Horas, ${time.minutes} Minutos, e ${time.seconds} Segundos\`! Para Trabalhar Novamente!`
                )
                .setFooter({ text: `© RPG - OneBot` });

            message.channel.send({ embeds: [timeEmbed] });
        } else {
            let dinheiro = Math.floor(Math.random() * 1200) + 400;
            let flexões = Math.floor(Math.random() * 400) + 200;

            const embed = new Discord.EmbedBuilder()
                .setColor(0x992d22)
                .setTitle(`Trabalho Militar`)
                .setDescription(
                    `Parabéns ${user}, Você fez ${flexões} Flexões, Por isso, O Exército lhe pagou ***${dinheiro} RPG Coins***`
                )
                .setFooter({ text: `© RPG OneBot` })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
            db.add(`rpgcoins_${user.id}`, dinheiro);
            db.set(`militaria2_${user.id}`, Date.now());
        }
    }
};
