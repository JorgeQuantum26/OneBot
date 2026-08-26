const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const nomePais = args[0]?.toLowerCase();

    if (!nomePais) {
        return message.channel.send(`❌ Use: B!relatorio-investimentos <país>`);
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País não encontrado.`);

    const f = (n) => (n || 0).toLocaleString('pt-BR');

    const embed = new Discord.EmbedBuilder()
        .setTitle(`📊 Relatório Nacional — ${nomePais}`)
        .setColor('#3498db')

        .addFields({ name: '👥 População', value: f(pais.populacao), inline: true })
        .addFields({ name: '🏗️ Infraestrutura', value: `Nível ${f(pais.infraestrutura)}`, inline: true })
        .addFields({ name: '📈 Inflação', value: `${((pais.inflacao || 0) * 100).toFixed(2)}%`, inline: true })

        .addFields({ name: '💰 Economia', value: `🏦 Tesouro: **${f(pais.tesouro)}**\n` +
            `🏛️ Tesouro Nacional: **${f(pais.tesouroNacional)}**`, inline: true })

        .addFields({ name: '📦 Recursos', value: `🪙 Ouro: **${f(pais.ouro)}**\n` +
            `🍞 Comida: **${f(pais.comida)}**\n` +
            `🪵 Madeira: **${f(pais.madeira)}**\n` +
            `🪨 Pedra: **${f(pais.pedra)}**`, inline: true })

        .addFields({ name: '🏭 Mineração', value: pais.mineracao
                ? `🏗️ Nível: **${f(pais.mineracao.nivel)}**\n` +
                  `⚙️ Eficiência: **${pais.mineracao.eficiencia.toFixed(2)}x**\n` +
                  `💰 Investido: **${f(pais.mineracao.investimento)}**`
                : 'Não desenvolvida', inline: false })

        .addFields({ name: '🌍 Comércio', value: `📤 Exportações: **${f(pais.exportacoes)}**\n` +
            `📥 Importações: **${f(pais.importacoes)}**`, inline: true })

        .setFooter({ text: 'Sistema Econômico • RPG Mundi' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}; 