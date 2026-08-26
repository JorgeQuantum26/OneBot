const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');
const NIVEL_MAXIMO_CONSTRUCAO = 100;

const CONSTRUCOES = {
    // 🪖 MILITAR
    quartel: { nome: "Quartel", emoji: "🪖", custo: { dinheiro: 50000, pedra: 2000, madeira: 1500, ferro: 800 }, categoria: "militar", efeito: "Reduz custo de infantaria", consumo: 20 },
    base_aerea: { nome: "Base Aérea", emoji: "✈️", custo: { dinheiro: 200000, pedra: 5000, ferro: 3000, aluminio: 1000 }, categoria: "militar", efeito: "Reduz custo de aviões", consumo: 40 },
    porto_militar: { nome: "Porto Militar", emoji: "🚢", custo: { dinheiro: 150000, pedra: 4000, ferro: 3500, madeira: 2500 }, categoria: "militar", efeito: "Reduz custo de navios", consumo: 35 },
   fabrica_drones: { 
    nome: "Fábrica de Drones", 
    emoji: "🛸", 
    custo: { dinheiro: 5000000, ferro: 2000, silicio: 1000, aluminio: 500 }, 
    categoria: "militar", 
    efeito: "Acelera produção de drones em +10%/nível",
    consumo: 50 
   },
    // 🏭 ECONOMIA
    industria: { nome: "Indústria", emoji: "🏭", custo: { dinheiro: 100000, pedra: 3000, ferro: 2000, carvao: 1500 }, categoria: "economia", efeito: "Aumenta produtividade geral", consumo: 50 },
    usina: { nome: "Usina de Energia", emoji: "⚡", custo: { dinheiro: 80000, pedra: 2500, carvao: 3000, cobre: 800 }, categoria: "economia", efeito: "Produz 500 MW de energia", consumo: 8, producao: 500 },
    banco: { nome: "Banco Central", emoji: "🏦", custo: { dinheiro: 200000, pedra: 3000, ouro: 500, ferro: 1000 }, categoria: "economia", efeito: "Controla inflação", consumo: 10 },
    mineradora: { nome: "Mineradora", emoji: "⛏️", custo: { dinheiro: 120000, ferro: 3000, pedra: 4000, carvao: 2000 }, categoria: "economia", efeito: "Aumenta extração de recursos", consumo: 40 },
    refinaria: { nome: "Refinaria de Petróleo", emoji: "🛢️", custo: { dinheiro: 300000, petroleo: 500, ferro: 4000, cobre: 1500 }, categoria: "economia", efeito: "Processa petróleo bruto", consumo: 60 },
    siderurgica: { nome: "Siderúrgica", emoji: "🔥", custo: { dinheiro: 250000, ferro: 5000, carvao: 4000, pedra: 2000 }, categoria: "economia", efeito: "Produz aço para construções", consumo: 80 },

    // 🌾 CIVIL
    fazenda: { nome: "Fazenda", emoji: "🌾", custo: { dinheiro: 40000, madeira: 3500, comida: 5000 }, categoria: "civil", efeito: "Aumenta produção de comida", consumo: 5 },
    hospital: { nome: "Hospital", emoji: "🏥", custo: { dinheiro: 150000, pedra: 3000, madeira: 1500, ferro: 1000 }, categoria: "civil", efeito: "Aumenta aprovação popular", consumo: 15 },
    escola: { nome: "Escola", emoji: "📚", custo: { dinheiro: 80000, madeira: 2500, pedra: 1500 }, categoria: "civil", efeito: "Aumenta produtividade", consumo: 5 },
    universidade: { nome: "Universidade", emoji: "🎓", custo: { dinheiro: 250000, madeira: 3000, pedra: 2500, ouro: 300 }, categoria: "civil", efeito: "Aumenta pesquisa e tecnologia", consumo: 15 },

    // 🔬 TECNOLOGIA
    laboratorio: { nome: "Laboratório", emoji: "🔬", custo: { dinheiro: 180000, pedra: 2000, silicio: 500, cobre: 400 }, categoria: "tecnologia", efeito: "Acelera pesquisas", consumo: 10 },
    centro_pesquisa: { nome: "Centro de Pesquisa", emoji: "🏛️", custo: { dinheiro: 500000, pedra: 4000, silicio: 1000, grafeno: 100 }, categoria: "tecnologia", efeito: "Pesquisa avançada", consumo: 20 },
    satelite: { nome: "Satélite", emoji: "🛰️", custo: { dinheiro: 350000, ouro: 1500, titanio: 300, silicio: 800 }, categoria: "tecnologia", efeito: "Aumenta reputação global", consumo: 30 },
    centro_espacial: { nome: "Centro Espacial", emoji: "🚀", custo: { dinheiro: 1000000, titanio: 500, silicio: 1500, grafeno: 200 }, categoria: "tecnologia", efeito: "Lançamento de foguetes", consumo: 200 },

    // ⚡ ENERGIA RENOVÁVEL
    hidreletrica: { nome: "Hidrelétrica", emoji: "🌊", custo: { dinheiro: 500000, pedra: 8000, ferro: 5000, cobre: 2000 }, categoria: "energia", efeito: "Produz 800 MW de energia limpa", consumo: 5, producao: 800 },
    parque_eolico: { nome: "Parque Eólico", emoji: "💨", custo: { dinheiro: 300000, ferro: 3000, aluminio: 1500 }, categoria: "energia", efeito: "Produz ~300 MW (varia com vento)", consumo: 3, producao: 300 },
    solar: { nome: "Usina Solar", emoji: "🌞", custo: { dinheiro: 350000, silicio: 2000, aluminio: 1200 }, categoria: "energia", efeito: "Produz ~400 MW (varia com sol)", consumo: 2, producao: 400 },
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais) return message.channel.send("❌ Você não possui país.");

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return;
    if (pais.governador !== userId) return message.channel.send("❌ Apenas o governador pode construir.");

    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? `${dados.bandeira} ${dados.nomeFormal}` : nomePais;

    // ================= MENU =================
    if (!args[0]) {
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🏗️ Planejamento Nacional — ${nomeFormal}`)
            .setColor('#e67e22')
            .setDescription("Use: `B!construir <tipo> <nível>`\nEx: `B!construir usina 10`\n");

        const categorias = {
            '🪖 Militar': ['quartel', 'base_aerea', 'porto_militar', 'fabrica_drones'],
            '🏭 Economia': ['industria', 'usina', 'banco', 'mineradora', 'refinaria', 'siderurgica'],
            '🌾 Civil': ['fazenda', 'hospital', 'escola', 'universidade'],
            '🔬 Tecnologia': ['laboratorio', 'centro_pesquisa', 'satelite', 'centro_espacial'],
            '⚡ Energia': ['hidreletrica', 'parque_eolico', 'solar']
        };

        for (const [catNome, catKeys] of Object.entries(categorias)) {
            let texto = '';
            for (const key of catKeys) {
                const c = CONSTRUCOES[key];
                if (!c) continue;
                
                const nivelAtual = Number(pais.construcoes?.[key]?.nivel || pais.construcoes?.[key] || 0);
                const recursosStr = Object.entries(c.custo)
                    .filter(([k]) => k !== "dinheiro")
                    .map(([k, v]) => `${k}: ${v.toLocaleString('pt-BR')}`)
                    .join(", ") || "—";
                
                texto += `${c.emoji} **${c.nome}** (\`${key}\`) Nv.${nivelAtual}\n`;
                texto += `💰 ${c.custo.dinheiro.toLocaleString('pt-BR')} | 📦 ${recursosStr}\n`;
                texto += `⚙️ ${c.efeito}`;
                if (c.producao) texto += `\n⚡ Produção: ${c.producao} MW/unidade`;
                if (c.consumo) texto += `\n🔌 Consumo: ${c.consumo} MW/unidade`;
                texto += '\n\n';
            }
            embed.addFields({ name: catNome, value: texto, inline: false });
        }

        // Resumo energético
        const producaoAtual = pais.producaoEnergetica || 0;
        const consumoAtual = pais.consumoEnergetico || 0;
        embed.addFields({ name: '⚡ Balanço Energético Atual', value: `🔋 Produção: **${producaoAtual.toLocaleString('pt-BR')} MW**\n` +
            `🔌 Consumo: **${consumoAtual.toLocaleString('pt-BR')} MW**\n` +
            `📊 Saldo: **${(producaoAtual - consumoAtual).toLocaleString('pt-BR')} MW**`, inline: false });

        embed.setFooter({ text: 'Sistema Nacional de Infraestrutura • OneBot' });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= PROCESSAMENTO =================
    const tipo = args[0].toLowerCase();
    const construcao = CONSTRUCOES[tipo];

    if (!construcao) return message.channel.send("❌ Construção inválida. Use `B!construir` para ver opções.");

    const nivelAtual = Number(pais.construcoes?.[tipo]?.nivel || pais.construcoes?.[tipo] || 0);

 let nivelDesejado;
if (args[1] && !isNaN(args[1])) {
    // Se o número for MENOR que o atual, significa que quer ADICIONAR
    if (parseInt(args[1]) <= nivelAtual) {
        nivelDesejado = nivelAtual + parseInt(args[1]);
    } else {
        nivelDesejado = parseInt(args[1]);
    }
} else {
    nivelDesejado = nivelAtual + 1;
}

    const diff = nivelDesejado - nivelAtual;
    if (nivelDesejado > NIVEL_MAXIMO_CONSTRUCAO) {
        return message.channel.send(
            `❌ O nível máximo de uma construção é **${NIVEL_MAXIMO_CONSTRUCAO}**.`
        );
    }

    // Calcular custo total com inflação
    let custoTotal = { dinheiro: 0 };
    for (const r in construcao.custo) {
        if (r !== "dinheiro") custoTotal[r] = 0;
    }

    const inflacao = 1 + Math.max(0, (pais.inflacao || 0.05));

    for (let i = nivelAtual + 1; i <= nivelDesejado; i++) {
       const escala = 1 + (i * 0.001);
        
        for (const r in construcao.custo) {
            custoTotal[r] += Math.floor(construcao.custo[r] * escala * inflacao);
        }
    }

    // Validação
    if ((pais.tesouro || 0) < custoTotal.dinheiro) {
        return message.channel.send(
            `❌ Tesouro insuficiente!\n💰 Necessário: **${custoTotal.dinheiro.toLocaleString('pt-BR')}**\n💰 Disponível: **${(pais.tesouro || 0).toLocaleString('pt-BR')}**`
        );
    }

    for (const r in custoTotal) {
        if (r === "dinheiro") continue;
        if ((pais[r] || 0) < custoTotal[r]) {
            return message.channel.send(
                `❌ Falta **${r}**!\n📦 Necessário: **${custoTotal[r].toLocaleString('pt-BR')}**\n📦 Disponível: **${(pais[r] || 0).toLocaleString('pt-BR')}**`
            );
        }
    }

    // Aplicar
    db.subtract(`pais_${nomePais}.tesouro`, custoTotal.dinheiro);
    for (const r in custoTotal) {
        if (r === "dinheiro") continue;
        db.subtract(`pais_${nomePais}.${r}`, custoTotal[r]);
    }
    db.set(`pais_${nomePais}.construcoes.${tipo}.nivel`, nivelDesejado);

    // Efeitos
    let impactoDiplomatico = 0;
    let impactoEconomico = 0;
    let impactoEstabilidade = 0;

    if (tipo === "industria") {
        db.add(`pais_${nomePais}.produtividade`, diff * 0.03);
        impactoEconomico += diff * 2;
    }
    if (tipo === "usina" || tipo === "hidreletrica" || tipo === "parque_eolico" || tipo === "solar") {
        const atual = db.get(`pais_${nomePais}.custosGerais`) || 1;
        db.set(`pais_${nomePais}.custosGerais`, atual * Math.pow(0.99, diff));
        impactoEconomico += diff * 2;
    }
    if (tipo === "fazenda") {
        db.add(`pais_${nomePais}.agricultura`, diff * 1000);
        impactoEstabilidade += diff * 2;
    }
    if (tipo === "banco") {
        db.subtract(`pais_${nomePais}.inflacao`, diff * 0.002);
        impactoEconomico += diff;
    }
    if (tipo === "hospital") {
        impactoEstabilidade += diff * 3;
    }
    if (tipo === "escola" || tipo === "universidade") {
        db.add(`pais_${nomePais}.produtividade`, diff * 0.02);
        impactoEconomico += diff;
    }
    if (tipo === "laboratorio") {
        db.add(`pais_${nomePais}.tecnologia`, diff * 0.05);
        impactoEconomico += diff * 2;
    }
    if (tipo === "centro_pesquisa") {
        db.add(`pais_${nomePais}.tecnologia`, diff * 0.10);
        impactoEconomico += diff * 3;
    }
    if (tipo === "satelite" || tipo === "centro_espacial") {
        impactoDiplomatico += diff * 3;
    }
    if (tipo === "mineradora") {
        db.add(`pais_${nomePais}.mineracao.eficiencia`, diff * 0.1);
        impactoEconomico += diff * 2;
    }
    if (tipo === "refinaria") {
        db.add(`pais_${nomePais}.produtividade`, diff * 0.04);
        impactoEconomico += diff * 2;
    }
    if (tipo === "siderurgica") {
        db.add(`pais_${nomePais}.produtividade`, diff * 0.05);
        impactoEconomico += diff * 3;
    }
    if (construcao.categoria === "militar") {
        impactoDiplomatico -= diff;
        impactoEstabilidade += diff;
    }
        // ⚡ ADICIONE JUNTO COM OS OUTROS EFEITOS:
    if (tipo === "fabrica_drones") {
        // O bônus é lido diretamente pelo drones.js (não precisa de db.add)
        impactoEconomico += diff * 2;
        impactoEstabilidade += diff;
    }

    // Aplicar impactos
    db.add(`pais_${nomePais}.reputacaoDiplomatica`, impactoDiplomatico);
    db.add(`pais_${nomePais}.pib`, impactoEconomico * 1000);
    db.add(`pais_${nomePais}.aprovacaoPopular`, impactoEstabilidade);

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    db.set(`pais_${nomePais}.reputacaoDiplomatica`, clamp(db.get(`pais_${nomePais}.reputacaoDiplomatica`) || 50, 0, 100));
    db.set(`pais_${nomePais}.aprovacaoPopular`, clamp(db.get(`pais_${nomePais}.aprovacaoPopular`) || 50, 0, 100));

    // ================= UI =================
    const primeiraVez = nivelAtual === 0;
    const verbo = primeiraVez ? 'construída' : 'expandida';
    const acao = primeiraVez ? 'construiu' : 'expandiu';
    
    // Impacto energético
    let impactoEnergetico = 0;
    if (construcao.producao) {
        impactoEnergetico = diff * construcao.producao;
    }
    
    const consumoAdicional = diff * (construcao.consumo || 0);

    const embed = new Discord.EmbedBuilder()
        .setTitle(`${construcao.emoji} ${primeiraVez ? 'Construção' : 'Expansão'} — ${construcao.nome}`)
        .setColor(primeiraVez ? 0x00FF00 : 0x0099FF)
        .setDescription(
            primeiraVez 
                ? `**${construcao.nome}** foi construída com sucesso!` 
                : `**${construcao.nome}** foi expandida com sucesso!\n\n📊 ${nivelAtual} → **${nivelDesejado}** (+${diff})`
        )
        .addFields({ name: '💰 Custo Total', value: `${custoTotal.dinheiro.toLocaleString('pt-BR')} moedas`, inline: true })
        .addFields({ name: '📦 Recursos', value: Object.entries(custoTotal)
                .filter(([k]) => k !== "dinheiro")
                .map(([k, v]) => `${k}: ${v.toLocaleString('pt-BR')}`)
                .join("\n") || "Nenhum", inline: true })
        .addFields({ name: '📊 Impactos', value: `🌍 Diplomacia: ${impactoDiplomatico >= 0 ? '+' : ''}${impactoDiplomatico}\n` +
            `📈 Economia: +${impactoEconomico}\n` +
            `😊 Estabilidade: +${impactoEstabilidade}`, inline: false });

    if (impactoEnergetico > 0) {
        embed.addFields({ name: '⚡ Impacto Energético', value: `🔋 Produção adicional: **+${impactoEnergetico.toLocaleString('pt-BR')} MW**\n` +
            `📊 Produção total: **${((pais.producaoEnergetica || 0) + impactoEnergetico).toLocaleString('pt-BR')} MW**`, inline: false });
    }
    
    if (consumoAdicional > 0) {
        embed.addFields({ name: '🔌 Novo Consumo', value: `⚡ Consumo adicional: **+${consumoAdicional.toLocaleString('pt-BR')} MW/ciclo**\n` +
            `⚠️ Consumo total: **${((pais.consumoEnergetico || 0) + consumoAdicional).toLocaleString('pt-BR')} MW**`, inline: false });
    }

    embed.setFooter({ text: 'Sistema Nacional de Infraestrutura • OneBot' })
         .setTimestamp();

    // ================= NOTÍCIAS =================
    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaNacional(nomePais, {
            titulo: primeiraVez ? `🏗️ Nova ${construcao.nome} Inaugurada!` : `🏛️ ${construcao.nome} Expandida!`,
            descricao: primeiraVez
                ? `O governo de ${nomeFormal} ${acao} a primeira **${construcao.nome}** do país!\n\n📊 Nível: **${nivelDesejado}**${impactoEnergetico > 0 ? `\n⚡ Produção: +${impactoEnergetico.toLocaleString('pt-BR')} MW` : ''}`
                : `O governo de ${nomeFormal} ${acao} **${construcao.nome}**.\n\n📊 Nível: ${nivelAtual} → ${nivelDesejado}${impactoEnergetico > 0 ? `\n⚡ Produção adicional: +${impactoEnergetico.toLocaleString('pt-BR')} MW` : ''}`,
            tipo: 'governo', impacto: 'positivo', timestamp: Date.now(), pais: nomePais
        });

        if (diff >= 5 || construcao.categoria === "militar" || impactoEnergetico > 5000) {
            engine.publicarNoticiaGlobal({
                titulo: primeiraVez ? `🌍 ${nomeFormal} inaugura ${construcao.nome}` : `🌍 ${nomeFormal} amplia ${construcao.nome}`,
                descricao: primeiraVez
                    ? `O país construiu sua primeira **${construcao.nome}**.${impactoEnergetico > 0 ? ` Potência de ${impactoEnergetico.toLocaleString('pt-BR')} MW.` : ''}`
                    : `O país expandiu **${construcao.nome}** para nível ${nivelDesejado}.${impactoEnergetico > 0 ? ` +${impactoEnergetico.toLocaleString('pt-BR')} MW.` : ''}`,
                tipo: 'global', impacto: construcao.categoria === "militar" ? "atenção" : "positivo", timestamp: Date.now()
            });
        }
    }

    message.channel.send({ embeds: [embed] });
};