// Ver ações
const Discord = require('discord.js');
const db = require('../systems/firestore');

module.exports = {
    nome: 'ver-acoes',
    descricao: 'Mostra as ações que você possui na carteira.',
    run: async (client, message, args) => {
        let user = message.author;
        const carteira = db.get(`carteira_${user.id}`) || {};

        if (Object.keys(carteira).length === 0) {
            return message.channel.send("Você não possui nenhuma ação na carteira.");
        }

        // Formata os nomes das ações e as quantidades
        const nomesAcoes = Object.keys(carteira).map(acao => acao.split('_')[1] || acao).join('\n');
        const quantidades = Object.values(carteira).join('\n');

        const embed = new Discord.EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ações na Carteira')
            .setDescription('Ações que você possui na carteira:')
            .addFields({ name: 'Nome da Ação', value: nomesAcoes, inline: false })
            .addFields({ name: 'Quantidade', value: quantidades, inline: false });

        message.channel.send({ embeds: [embed] });
    },
};
