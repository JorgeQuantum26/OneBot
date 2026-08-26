const Discord = require("discord.js");
const db = require('../systems/rpg-db');

const recursos = [
    "ouro", "comida", "madeira", "pedra",
    "ferro", "carvao", "cobre", "aluminio",
    "diamante", "petroleo", "uranio", "titanio",
    "silicio", "litio", "grafeno", "terras_raras",
    "gas_natural", "helio3"
];

const INFO_RECURSOS = {
    ouro: { emoji: '🟡', nome: 'Ouro' },
    comida: { emoji: '🌾', nome: 'Comida' },
    madeira: { emoji: '🪵', nome: 'Madeira' },
    pedra: { emoji: '🪨', nome: 'Pedra' },
    ferro: { emoji: '⚙️', nome: 'Ferro' },
    carvao: { emoji: '🪨', nome: 'Carvão' },
    cobre: { emoji: '🟤', nome: 'Cobre' },
    aluminio: { emoji: '⬜', nome: 'Alumínio' },
    diamante: { emoji: '💎', nome: 'Diamante' },
    petroleo: { emoji: '🛢️', nome: 'Petróleo' },
    uranio: { emoji: '☢️', nome: 'Urânio' },
    titanio: { emoji: '🔩', nome: 'Titânio' },
    silicio: { emoji: '🔮', nome: 'Silício' },
    litio: { emoji: '🔋', nome: 'Lítio' },
    grafeno: { emoji: '⬛', nome: 'Grafeno' },
    terras_raras: { emoji: '🧲', nome: 'Terras Raras' },
    gas_natural: { emoji: '💨', nome: 'Gás Natural' },
    helio3: { emoji: '🌙', nome: 'Hélio-3' }
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send("❌ Você não possui um país.");

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send("❌ País não encontrado.");
    if (pais.governador !== userId) return message.channel.send("❌ Apenas o governador pode coletar.");

    const recurso = (args[0] || "").toLowerCase();

    if (!recursos.includes(recurso)) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('⛏️ Coleta de Recursos')
            .setColor('#f1c40f')
            .setDescription('Use: `B!coletar-recursos <recurso>`\n\n**Recursos disponíveis:**');
        
        const categorias = {
            'Básicos': ['ouro', 'comida', 'madeira', 'pedra'],
            'Minerais Industriais': ['ferro', 'carvao', 'cobre', 'aluminio'],
            'Valiosos': ['diamante', 'petroleo', 'uranio', 'titanio'],
            'Tecnológicos': ['silicio', 'litio', 'grafeno', 'terras_raras'],
            'Combustíveis': ['gas_natural'],
            'Espaciais': ['helio3']
        };
        
        for (const [cat, recs] of Object.entries(categorias)) {
            const texto = recs.map(r => {
                const info = INFO_RECURSOS[r];
                const qtd = Number(pais[r]) || 0;
                return `${info?.emoji || '📦'} **${info?.nome || r}**: ${qtd.toLocaleString('pt-BR')}`;
            }).join('\n');
            embed.addFields({ name: cat, value: texto, inline: false });
        }
        
        embed.setFooter({ text: 'Ministério de Recursos • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    const info = INFO_RECURSOS[recurso] || { emoji: '📦', nome: recurso };

    const mineracao = pais.mineracao || {};
    const nivel = mineracao.nivel || 1;
    const eficiencia = mineracao.eficiencia || 1;

    // ⚡ CORRIGIDO: Limitar eficiência para evitar explosão
    const eficienciaLimitada = Math.min(eficiencia, 100);
    const base = Math.sqrt(nivel) * Math.log10(eficienciaLimitada + 1) * 100;

    const construcoes = pais.construcoes || {};
    const industria = Number(construcoes.industria?.nivel || construcoes.industria || 0);
    const usinas = Number(construcoes.usina?.nivel || construcoes.usina || 0);
    const mineradora = Number(construcoes.mineradora?.nivel || construcoes.mineradora || 0);

    // ⚡ CORRIGIDO: Bônus com cap para evitar explosão
    const bonusIndustria = 1 + Math.min(industria, 100) * 0.02;
    const bonusUsina = 1 + Math.min(usinas, 100) * 0.015;
    const bonusMineradora = 1 + Math.min(mineradora, 100) * 0.1;

    const quantidade = Math.floor(
        base *
        (Math.random() * 2 + 4) *
        bonusIndustria *
        bonusUsina *
        bonusMineradora
    );

    const reducaoCusto = Math.max(0.5, 1 - Math.min(usinas, 100) * 0.01);

    // ⚡ CORRIGIDO: Raiz quadrada do nível + cap
    const preco = Math.floor(
        (quantidade * 5 + Math.sqrt(Math.min(nivel, 10000000)) * 1000) * reducaoCusto
    );

    const tesouro = Number(db.get(`pais_${nomePais}.tesouro`)) || 0;

    if (tesouro < preco) {
        return message.channel.send(
            `❌ Tesouro insuficiente.\n💰 Necessário: **${preco.toLocaleString("pt-BR")}** moedas\n💵 Disponível: **${tesouro.toLocaleString("pt-BR")}** moedas`
        );
    }

    const bonusRaridade = {
        ouro: 0.6, comida: 1.2, madeira: 1.0, pedra: 0.9,
        ferro: 0.8, carvao: 0.9, cobre: 0.7, aluminio: 0.6,
        diamante: 0.3, petroleo: 0.5, uranio: 0.2, titanio: 0.4,
        silicio: 0.6, litio: 0.5, grafeno: 0.2, terras_raras: 0.3,
        gas_natural: 0.7, helio3: 0.1
    };

    const bonus = bonusRaridade[recurso] || 1;
    const finalQtd = Math.floor(quantidade * bonus);

    db.add(`pais_${nomePais}.${recurso}`, finalQtd);
    db.subtract(`pais_${nomePais}.tesouro`, preco);
    db.add(`pais_${nomePais}.gastos`, preco);

    const embed = new Discord.EmbedBuilder()
        .setTitle(`${info.emoji} Extração de ${info.nome}`)
        .setColor("DARK_GOLD")
        .setDescription(`Equipes de mineração extraíram **${info.nome}** com sucesso.`)
        .addFields({ name: "📦 Coletado", value: `+ **${finalQtd.toLocaleString("pt-BR")}** ${info.nome}`, inline: true })
        .addFields({ name: "🏭 Eficiência", value: `${(eficiencia * 100).toFixed(1)}%`, inline: true })
        .addFields({ name: "⛏️ Mineração", value: `Nv. ${nivel}`, inline: true })
        .addFields({ name: "💰 Custo", value: `-${preco.toLocaleString("pt-BR")} moedas`, inline: true })
        .addFields({ name: "🏦 Tesouro", value: `${(tesouro - preco).toLocaleString("pt-BR")}`, inline: true })
        .addFields({ name: "📊 Infraestrutura", value: `🏭 Indústria: ${industria}\n⚡ Usinas: ${usinas}\n⛏️ Mineradora: ${mineradora}`, inline: false })
        .setFooter({ text: "Sistema de Mineração • OneBot" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};