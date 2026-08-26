const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

    const nomePais = args[0]?.toLowerCase();

    if (!nomePais) {
        return message.channel.send(
            "❌ Informe o país.\n\n" +
            "`B!deletarmsm <país> <tesouro> <tesouroNacional> <inflacao> <receita> <gastos> <lucroImpostos> <producaoEnergetica> <consumoEnergetico> <populacao>`"
        );
    }

    const pais = db.get(`pais_${nomePais}`);

    if (!pais) {
        return message.channel.send("❌ País não encontrado.");
    }

    // Precisamos de 9 valores depois do país
    if (args.length < 10) {
        return message.channel.send(
            "❌ Você precisa informar todos os valores.\n\n" +
            "**Ordem:**\n" +
            "1. Tesouro\n" +
            "2. Tesouro Nacional\n" +
            "3. Inflação\n" +
            "4. Receita total\n" +
            "5. Gastos totais\n" +
            "6. Impostos arrecadados\n" +
            "7. Produção energética\n" +
            "8. Consumo energético\n" +
            "9. População\n\n" +
            "**Exemplo:**\n" +
            "`B!deletarmsm Brasil 339751640171 1577199660194 0.05 1000000 500000 750000 73779232 12127545748 556595171`"
        );
    }

    const tesouro = Number(args[1]);
    const tesouroNacional = Number(args[2]);
    const inflacao = Number(args[3]);
    const receita = Number(args[4]);
    const gastos = Number(args[5]);
    const lucroImpostos = Number(args[6]);
    const producaoEnergetica = Number(args[7]);
    const consumoEnergetico = Number(args[8]);
    const populacao = Number(args[9]);
    const comida = Number(args[10]);
    const usina = Number(args[11]);

    const valores = [
        tesouro,
        tesouroNacional,
        inflacao,
        receita,
        gastos,
        lucroImpostos,
        producaoEnergetica,
        consumoEnergetico,
        populacao
    ];

    if (valores.some(v => !Number.isFinite(v))) {
        return message.channel.send(
            "❌ Um ou mais valores informados não são números válidos."
        );
    }

    // 💰 ECONOMIA
    db.set(`pais_${nomePais}.tesouro`, tesouro);
    db.set(`pais_${nomePais}.tesouroNacional`, tesouroNacional);
    db.set(`pais_${nomePais}.inflacao`, inflacao);

    // 📊 ACUMULADOS
    db.set(`pais_${nomePais}.receita`, receita);
    db.set(`pais_${nomePais}.gastos`, gastos);
    db.set(`pais_${nomePais}.lucroImpostos`, lucroImpostos);

    // ⚡ ENERGIA
    db.set(`pais_${nomePais}.producaoEnergetica`, producaoEnergetica);
    db.set(`pais_${nomePais}.consumoEnergetico`, consumoEnergetico);

    // 👥 POPULAÇÃO
    db.set(`pais_${nomePais}.populacao`, populacao);
    db.set(`pais_${nomePais}.comida`, comida);
db.set(`pais_${nomePais}.construcoes.usina.nivel`, usina);

    // NPC
    db.set(`pais_${nomePais}.isNPC`, true);

    return message.channel.send(
        `✅ Dados de **${nomePais}** corrigidos com sucesso!\n\n` +
        `🏦 Tesouro: **${tesouro.toLocaleString("pt-BR")}**\n` +
        `🏛️ Tesouro Nacional: **${tesouroNacional.toLocaleString("pt-BR")}**\n` +
        `📊 Inflação: **${(inflacao * 100).toFixed(2)}%**\n` +
        `📈 Receita: **${receita.toLocaleString("pt-BR")}**\n` +
        `📉 Gastos: **${gastos.toLocaleString("pt-BR")}**\n` +
        `💰 Impostos: **${lucroImpostos.toLocaleString("pt-BR")}**\n` +
        `🔋 Produção: **${producaoEnergetica.toLocaleString("pt-BR")} MW**\n` +
        `🔌 Consumo: **${consumoEnergetico.toLocaleString("pt-BR")} MW**\n` +
        `👤 População: **${populacao.toLocaleString("pt-BR")}**`
    );
};