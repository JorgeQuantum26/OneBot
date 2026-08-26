const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais) {
        return message.channel.send("❌ Você não governa nenhum país.");
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return;

    if (pais.governador !== userId) {
        return message.channel.send("❌ Apenas o governador pode usar isso.");
    }

    const alvo = (args[0] || "").toLowerCase();

    if (!alvo) {
        return message.channel.send("❌ Use: `B!remover-sancao <pais>`");
    }

    const paisAlvo = db.get(`pais_${alvo}`);
    if (!paisAlvo) {
        return message.channel.send("❌ País inválido.");
    }

    // =========================
    // 🚫 EMBARGOS (array simples)
    // =========================
    let embargosMeu = pais.embargos || [];
    let embargosAlvo = paisAlvo.embargos || [];

    const antes1 = embargosMeu.length;
    const antes2 = embargosAlvo.length;

    embargosMeu = embargosMeu.filter(p => p !== alvo);
    embargosAlvo = embargosAlvo.filter(p => p !== nomePais);

    db.set(`pais_${nomePais}.embargos`, embargosMeu);
    db.set(`pais_${alvo}.embargos`, embargosAlvo);

    // =========================
    // ⚖️ SANÇÕES (array de objetos)
    // =========================
    let sancoesMeu = pais.sancoes || [];
    let sancoesAlvo = paisAlvo.sancoes || [];

    sancoesMeu = sancoesMeu.filter(s => s.pais !== alvo);
    sancoesAlvo = sancoesAlvo.filter(s => s.pais !== nomePais);

    db.set(`pais_${nomePais}.sancoes`, sancoesMeu);
    db.set(`pais_${alvo}.sancoes`, sancoesAlvo);

    const removidos =
        (antes1 - embargosMeu.length) +
        (antes2 - embargosAlvo.length) +
        (pais.sancoes?.length - sancoesMeu.length || 0) +
        (paisAlvo.sancoes?.length - sancoesAlvo.length || 0);

    const embed = new Discord.EmbedBuilder()
        .setTitle("🕊️ Sanções Removidas")
        .setColor('#2ecc71')
        .setDescription(
            `O governo de **${nomePais}** removeu sanções contra **${alvo}**.\n\n` +
            `📉 Registros removidos: **${removidos}**`
        )
        .addFields({ name: "🤝 Relação", value: `${nomePais} ↔ ${alvo}`, inline: true })
        .setFooter({ text: "Sistema Diplomático • RPG Mundi" })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};