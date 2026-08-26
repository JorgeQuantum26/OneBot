const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const nomePais = args[0] || db.get(`${message.author.id}.pais`);

    if (!nomePais)
        return message.channel.send("❌ Informe o país.");

    const pais = db.get(`pais_${nomePais}`);
    if (!pais)
        return message.channel.send("❌ País não encontrado.");

    const ministerios = pais.ministerios || {};
    const lista = Object.values(ministerios);

    if (lista.length === 0)
        return message.channel.send("🏛️ Nenhum ministério criado.");

    const embed = new Discord.EmbedBuilder()
        .setTitle(`🏛️ Ministérios de ${nomePais}`)
        .setColor('#3498db')
        .setTimestamp();

    for (const min of lista) {
        embed.addFields({ name: `🏛️ ${min.nome}`, value: `💰 Orçamento: **${min.orcamento.toLocaleString("pt-BR")}**
📊 Nível: **${min.nivel || 1}**
👥 Funcionários: **${min.funcionarios.length}**`, inline: false });
    }

    const custoTotal = lista.reduce(
        (a, m) => a + (m.orcamento || 0),
        0
    );

    embed.setFooter({ text: `Total: ${lista.length} ministérios • Custo: ${custoTotal.toLocaleString("pt-BR")} moedas/ciclo` });

    message.channel.send({ embeds: [embed] });
};