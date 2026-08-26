const { EmbedBuilder } = require('discord.js');
const parseMs = require('parse-ms');
const db = require('./systems/firestore');

exports.run = async (bot, message, args) => {
    let user = message.mentions.users.first();

    let autor = message.author;

    let timeout = 600000;

    let ban = await db.fetch(`banido_${user.id}`);
    if (ban >= 1)
        return message.channel.send(
            `${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `
        );

    if (!user)
        return message.channel.send(
            `<a:nao:868232161289986128>**|** ${autor}, Você precisa mencionar alguém para Envenenar`
        );

    if (user.id == autor.id) {
        return message.channel.send(` ${autor} você não pode se auto-envenemar!`);
    }

    let autor_money = await db.fetch(`venenof_${user.id}`);

    let item1 = await db.fetch(`venenof_${autor.id}`);
    if (item1 < 1)
        return message.channel.send(
            `<a:nao:868232161289986128>**|** ${autor}, Você não possuí **1** Frasco de Veneno!`
        );

    let daily = await db.fetch(`ven_${autor.id}`);

    if (daily !== null && timeout - (Date.now() - daily) > 0) {
        let time = ms(timeout - (Date.now() - daily));

        let timeEmbed = new EmbedBuilder()

            .setColor('#000001')

            .setDescription(
                `<a:nao:868232161289986128>|Você já realizou um envenenamento hoje!\n\nTente novamente daqui a **${time.hours}h ${time.minutes}m ${time.seconds}s**`
            );

        message.channel.send({ embeds: [timeEmbed] });
    } else {
        let sorte = Math.floor(Math.random() * 4) + 1;

        if (sorte == 2) {
            const procurado = 'Procurado';
            let embed1 = new EmbedBuilder()
                .setTitle(`❌ | Seu Envenenamento Falhou!`)
                .setDescription(
                    `${message.author}, Você tentou envenenar ${user}, mas você falhou e foi descoberto! Agora você está como **Procurado**`
                )
                .setFooter({ text: '© RPG OneBot' })
                .setTimestamp();
            db.subtract(`venenof_${autor.id}`, 1);
            db.set(`proc_${autor.id}`, procurado);
            message.channel.send({ embeds: [embed1] });
        } else {
            let embed2 = new EmbedBuilder()
                .setColor('Random')
                .setTitle(`✅ | Sucesso!`)
                .setDescription(`${autor}, Você envenenou ${user} Com sucesso!`)
                .setFooter({ text: '© RPG OneBot' })
                .setTimestamp();

            db.subtract(`venenof_${autor.id}`, 1);
            db.add(`veneno1_${user.id}`, 1);
            db.set(`ven_${autor.id}`, Date.now());

            message.channel.send({ embeds: [embed2] });
        }
    }
};
