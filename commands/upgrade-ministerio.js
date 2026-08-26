const Discord = require("discord.js");
const db = require('../systems/rpg-db');

const FUNCOES = {
    economia: '💹 Economia',
    defesa: '⚔️ Defesa',
    agricultura: '🌾 Agricultura',
    comercio: '🚢 Comércio',
    exterior: '🌐 Relações Exteriores',
    saude: '🏥 Saúde',
    educacao: '📚 Educação',
    interior: '🏙️ Interior',
    fazenda: '🏦 Fazenda',
    ciencia: '🔬 Ciência',
    energia: '⚡ Energia'
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais)
        return message.channel.send("❌ Você não possui país.");

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return;

    if (pais.governador !== userId)
        return message.channel.send("❌ Apenas o governador pode gerenciar ministérios.");

    const funcao = (args[0] || "").toLowerCase();
    if (!FUNCOES[funcao]) {
        return message.channel.send(
            `🏛️ Ministérios disponíveis:\n` +
            Object.entries(FUNCOES)
                .map(([k, v]) => `• \`${k}\` → ${v}`)
                .join("\n")
        );
    }

    const ministerio = pais.ministerios?.[funcao];

    if (!ministerio)
        return message.channel.send("❌ Ministério ainda não existe.");

    const nivelAtual = ministerio.nivel || 1;
    const orcAtual = ministerio.orcamento || 500;

    // =========================
    // 📊 PARSE INTELIGENTE
    // =========================
    let nivelAlvo = args[1] ? parseInt(args[1]) : null;
    let novoOrcamento = args[2] ? parseInt(args[2]) : null;

    let modoIncremento = false;

    // se não passou nível → +1 automático
    if (!nivelAlvo || isNaN(nivelAlvo)) {
        nivelAlvo = nivelAtual + 1;
        modoIncremento = true;
    }

    if (nivelAlvo <= nivelAtual) {
        return message.channel.send(`❌ O nível deve ser maior que ${nivelAtual}.`);
    }

    if (nivelAlvo > 100) {
        return message.channel.send("❌ Nível máximo permitido: 100.");
    }

    // =========================
    // 💰 CÁLCULO DE CUSTO
    // =========================
    const base = orcAtual;
    let custo = 0;

    for (let i = nivelAtual; i < nivelAlvo; i++) {
        custo += base * Math.pow(1.3, i);
    }

    custo = Math.floor(custo);

    const tesouro = pais.tesouro || 0;

    if (tesouro < custo)
        return message.channel.send(`❌ Tesouro insuficiente.\n💰 Necessário: **${custo.toLocaleString("pt-BR")}**`);

    // =========================
    // 💸 APLICA CUSTO
    // =========================
    db.subtract(`pais_${nomePais}.tesouro`, custo);

    db.set(`pais_${nomePais}.ministerios.${funcao}.nivel`, nivelAlvo);

    // =========================
    // 💰 ORÇAMENTO (OPCIONAL)
    // =========================
    let orcFinal = orcAtual;

    if (novoOrcamento && !isNaN(novoOrcamento) && novoOrcamento > 0) {
        const diff = novoOrcamento - orcAtual;

        if (diff > 0) {
            if (pais.tesouro < diff) {
                return message.channel.send("❌ Sem tesouro para aumentar orçamento.");
            }

            db.subtract(`pais_${nomePais}.tesouro`, diff);
            orcFinal = novoOrcamento;
            db.set(`pais_${nomePais}.ministerios.${funcao}.orcamento`, orcFinal);
        }
    }

    // =========================
    // 🎨 UI MELHORADA
    // =========================
    const embed = new Discord.EmbedBuilder()
        .setTitle("🏛️ Upgrade Ministerial")
        .setColor('#2ecc71')
        .setDescription(
            `📌 Ministério: **${FUNCOES[funcao]}**\n` +
            `🧠 Modo: ${modoIncremento ? "Incremento (+1 automático)" : "Definido pelo usuário"}`
        )
        .addFields({ name: "📊 Nível anterior", value: nivelAtual, inline: true })
        .addFields({ name: "📊 Novo nível", value: nivelAlvo, inline: true })
        .addFields({ name: "💰 Custo total", value: custo.toLocaleString("pt-BR"), inline: true })
        .addFields({ name: "💸 Orçamento", value: orcFinal.toLocaleString("pt-BR"), inline: true })
        .addFields({ name: "🏦 Tesouro restante", value: (pais.tesouro).toLocaleString("pt-BR"), inline: true })
        .setFooter({ text: "Sistema de Governo • RPG Mundi" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};