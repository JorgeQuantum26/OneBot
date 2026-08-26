const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    let listaPaises = db.get('lista_paises') || [];

    if (listaPaises.length === 0) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Não há países registrados.`);
    }

    let valores = listaPaises.map(nomePais => {
        let paisData = db.get(`pais_${nomePais}`) || {};
        let pib = paisData.pib || 0;
        let populacao = paisData.populacao || 1;
        let exportacoes = paisData.exportacoes || 0;
        let bombasNucleares = paisData.bombasNucleares || 0;
        let tesouro = paisData.tesouro || 0;
        let infraestrutura = paisData.infraestrutura || 0;
        let pibPerCapita = populacao > 0 ? pib / populacao : 0;

        return {
            nome: nomePais,
            pibPerCapita,
            exportacoes,
            bombasNucleares,
            tesouro,
            infraestrutura
        };
    });

    valores.sort((a, b) => b.tesouro - a.tesouro);

    let embed = new Discord.EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle('🌍 Ranking dos Países')
        .setDescription('Ranking ordenado pelo tesouro dos países:')
        .setFooter({ text: '© RPG Mundi - OneBot' })
        .setTimestamp();

    for (let i = 0; i < Math.min(valores.length, 10); i++) {
        let v = valores[i];
        embed.addFields({ name: `#${i + 1} 🏴 ${v.nome}`, value: `💰 Tesouro: **${v.tesouro.toLocaleString('pt-BR')}**\n🏗️ Infraestrutura: **Nível ${v.infraestrutura}/5**\n🚢 Exportações: **${v.exportacoes.toLocaleString('pt-BR')}**\n💣 Bombas Nucleares: **${v.bombasNucleares}**`, inline: false });
    }

    message.channel.send({ embeds: [embed] });
};
