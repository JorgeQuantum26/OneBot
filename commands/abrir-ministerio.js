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

    if (!nomePais) return message.channel.send("❌ Você não possui país.");

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return;

    if (pais.governador !== userId)
        return message.channel.send("❌ Apenas o governador.");

    const funcao = (args[0] || "").toLowerCase();
    const orcamento = parseInt(args[1]);

    if (!FUNCOES[funcao]) {
        return message.channel.send(
            `📜 Funções disponíveis:\n` +
            Object.entries(FUNCOES)
                .map(([k, v]) => `• \`${k}\` → ${v}`)
                .join("\n")
        );
    }

    if (!orcamento || orcamento <= 0)
        return message.channel.send("❌ Informe um orçamento válido.");

    const tesouro = pais.tesouro || 0;

    if (tesouro < orcamento)
        return message.channel.send("❌ Tesouro insuficiente.");

    // 🏛️ criação com nível
    db.set(`pais_${nomePais}.ministerios.${funcao}`, {
        nome: FUNCOES[funcao],
        funcao,
        orcamento,
        nivel: 1,
        funcionarios: []
    });

    db.subtract(`pais_${nomePais}.tesouro`, orcamento);

    const embed = new Discord.EmbedBuilder()
        .setTitle("🏛️ Ministério Criado")
        .setColor('#3498db')
        .setDescription(`Novo ministério instituído em **${nomePais}**`)
        .addFields({ name: "🏢 Tipo", value: FUNCOES[funcao], inline: true })
        .addFields({ name: "💰 Orçamento", value: orcamento.toLocaleString("pt-BR"), inline: true })
        .addFields({ name: "📊 Nível Inicial", value: "1", inline: true })
        .setFooter({ text: "Administração Pública • RPG Mundi" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};