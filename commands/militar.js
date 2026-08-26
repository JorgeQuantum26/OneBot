const Discord = require('discord.js');
const db = require('../systems/rpg-db');

module.exports = {
    name: 'militar',
    description: 'Veja seu perfil militar!',
    run: async (client, message, args) => {
        let user = message.mentions.users.first() || message.author;

        let Civil = await db.fetch(`militar_${user.id}`);
        let ban = await db.fetch(`banido_${user.id}`);
        if (ban >= 1)
            return message.channel.send(
                `${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `
            );

        let cargo = await db.fetch(`cargo_${user.id}`);
        if (cargo === null) cargo = 'Nenhum';

        if (Civil <= 0)
            return message.channel.send(
                `<a:nao:868232161289986128>**|**${user} não é militar! Aguarde para ${user} ser recrutado!`
            );

        const embed = new Discord.EmbedBuilder()
            .setColor(0x992d22)
            .setTitle(`**Perfil Militar**`)
            .setDescription(`\n\nNome: ${user}\nPatente: ${cargo}\n\nNome + Patente: ${cargo}, ${user.username}. `);

        message.channel.send({ embeds: [embed] });
    }
};
