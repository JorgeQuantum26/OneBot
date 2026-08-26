// commands/governo.js
const { ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');
const { criarBotoes } = require('../systems/rpg-hub'); // Certifique-se de que essa função injeta o país no customId!
const { getPaisState } = require('../systems/pais-state');

const NOMES_BONITOS = {
    quartel: 'Quartéis',
    base_aerea: 'Bases Aéreas',
    porto_militar: 'Portos Militares',
    industria: 'Indústrias',
    usina: 'Usinas de Energia',
    banco: 'Bancos Centrais',
    mineradora: 'Mineradoras',
    refinaria: 'Refinarias de Petróleo',
    siderurgica: 'Siderúrgicas',
    fazenda: 'Fazendas',
    hospital: 'Hospitais',
    escola: 'Escolas',
    universidade: 'Universidades',
    laboratorio: 'Laboratórios',
    centro_pesquisa: 'Centros de Pesquisa',
    satelite: 'Satélites',
    centro_espacial: 'Centros Espaciais',
    hidreletrica: 'Hidrelétricas',
    parque_eolico: 'Parques Eólicos',
    solar: 'Usinas Solares',
    usina_nuclear: 'Usinas Nucleares'
};

exports.run = async (client, message) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais) return message.channel.send('❌ Você não possui país.');

    const contexto = getPaisState(nomePais);
    if (!contexto) return;

    const pais = contexto.estado;
    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? `${dados.bandeira} ${dados.nomeFormal}` : `🏳️ ${pais.nomeFormal || nomePais}`;

    // 💰 Economia
    const pib = pais.pib || 0;
    const inflacao = ((pais.inflacao || 0) * 100).toFixed(2);
    const tesouro = pais.tesouro || 0;
    const tesouroNacional = pais.tesouroNacional || 0;
    const gastos = pais.gastos || 0;

    // ⚡ Energia
    const producaoEnergetica = pais.producaoEnergetica || 0;
    const consumoEnergetico = pais.consumoEnergetico || 0;
    const saldoEnergetico = pais.saldoEnergetico || 0;
    const statusEnergia = saldoEnergetico >= 0 ? '✅ Estável' : '🔴 Déficit';

    // 👥 Sociedade
    const populacao = pais.populacao || 0;
    const aprovacao = pais.aprovacaoPopular || 50;
    const comida = pais.comida || 0;
    const comidaPorPessoa = populacao > 0 ? (comida / populacao).toFixed(2) : '0.00';
    const statusComida = comidaPorPessoa > 1 ? '✅ Abundante' : comidaPorPessoa > 0.5 ? '⚠️ Escassa' : '🔴 Fome';

    // 🏥 Saúde
    const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
    const capacidadeHospitais = hospitais * 1000;
    const feridos = pais.feridos_acidente || 0;
    const doentes = pais.doentes_ativos || 0;
    const ocupacaoHospitalar = pais.ocupacao_hospitalar || 0;
    const epidemiaAtiva = pais.epidemia_ativa || null;
    const expectativaVida = Math.floor(55 + (pais.infraestrutura || 0) * 5 + (hospitais > 0 ? 10 : 0));

    // 🌍 Diplomacia
    const diplomacia = pais.reputacaoDiplomatica || 50;
    const aliancas = (pais.aliancas || []).length;
    const rotas = (pais.rotasComerciais || []).length;
    const fantoches = (() => {
        const lista = db.get('lista_paises') || [];
        let count = 0;
        for (const p of lista) {
            const d = db.get(`pais_${p}`);
            if (d && (d.controladoPor === nomePais || d.tributoPara === nomePais)) count++;
        }
        return count;
    })();

    // ⚔️ Exército
    const ex = pais.exercito || {};
    const totalForca =
        (ex.infantaria || 0) * 1 + (ex.tanques || 0) * 10 + (ex.avioes || 0) * 15 + (ex.navios || 0) * 12;
    const arsenal = pais.arsenal_nuclear || {};
    const ogivas =
        (Number(arsenal.ogiva_base) || 0) +
        (Number(arsenal.ogiva_avancada) || 0) +
        (Number(arsenal.ogiva_hidrogenio) || 0) +
        (Number(arsenal.missil_icbm) || 0);

    // 🏛️ Construções
    const construcoes = pais.construcoes || {};
    const listaConstrucoes =
        Object.entries(construcoes)
            .map(([key, val]) => {
                const nivel = typeof val === 'object' ? (val.nivel ?? 0) : (val ?? 0);
                if (nivel <= 0) return null;
                const nomeBonito = NOMES_BONITOS[key] || key;
                return `• ${nomeBonito}: **${nivel.toLocaleString('pt-BR')}**`;
            })
            .filter(Boolean)
            .join('\n') || 'Nenhuma construção';

    // 📦 Recursos
    const recursos = [
        { nome: 'Ouro', emoji: '🥇', valor: pais.ouro },
        { nome: 'Comida', emoji: '🌾', valor: pais.comida },
        { nome: 'Madeira', emoji: '🌲', valor: pais.madeira },
        { nome: 'Pedra', emoji: '🪨', valor: pais.pedra },
        { nome: 'Ferro', emoji: '⚙️', valor: pais.ferro },
        { nome: 'Carvão', emoji: '🪨', valor: pais.carvao },
        { nome: 'Cobre', emoji: '🟤', valor: pais.cobre },
        { nome: 'Alumínio', emoji: '⬜', valor: pais.aluminio },
        { nome: 'Urânio', emoji: '☢️', valor: pais.uranio },
        { nome: 'Petróleo', emoji: '🛢️', valor: pais.petroleo }
    ].filter((r) => (r.valor || 0) > 0);

    const recursosStr =
        recursos.length > 0
            ? recursos.map((r) => `${r.emoji} ${r.nome}: **${(r.valor || 0).toLocaleString('pt-BR')}**`).join('\n')
            : 'Nenhum recurso';

    // 📊 Status Geral
    let statusNacao = '⚠️ Instável';
    if (aprovacao > 80 && diplomacia > 70) statusNacao = '🌍 Potência Global';
    else if (aprovacao > 60) statusNacao = '📈 Estável';
    else if (aprovacao < 30) statusNacao = '🔥 Crise Interna';

    // 🧱 RENDERIZAÇÃO VIA COMPONENTES V2 (Para bater com o IsComponentV2 do seu bot)
    const textoGoverno = new TextDisplayBuilder().setContent(
        `## 🏛️ Governo — ${nomeFormal}\n` +
            `📊 **Status:** ${statusNacao} | 🌍 **Reputação:** ${diplomacia}/100 | 😊 **Aprovação:** ${aprovacao}%\n\n` +
            `### 💰 Economia\n` +
            `• Tesouro: **${tesouro.toLocaleString('pt-BR')} moedas**\n` +
            `• Tesouro Nacional: **${tesouroNacional.toLocaleString('pt-BR')} moedas**\n` +
            `• PIB: **${pib.toLocaleString('pt-BR')}**\n` +
            `• Inflação: **${inflacao}%**\n` +
            `• Gastos do Ciclo: **${gastos.toLocaleString('pt-BR')}**\n\n` +
            `### ⚡ Energia\n` +
            `• 🔋 Produção: **${producaoEnergetica.toLocaleString('pt-BR')} MW**\n` +
            `• 🔌 Consumo: **${consumoEnergetico.toLocaleString('pt-BR')} MW**\n` +
            `• 📊 Saldo: **${saldoEnergetico.toLocaleString('pt-BR')} MW** (${statusEnergia})\n\n` +
            `### 👥 Sociedade & 🍞 Alimentação\n` +
            `• População: **${populacao.toLocaleString('pt-BR')} habitantes**\n` +
            `• Estoque de Comida: **${comida.toLocaleString('pt-BR')}**\n` +
            `• Comida/hab: **${comidaPorPessoa}** (${statusComida})\n\n` +
            `### 🏥 Saúde Pública\n` +
            `• Hospitais Ativos: **${hospitais}** (${capacidadeHospitais.toLocaleString('pt-BR')} leitos)\n` +
            `• Ocupação Hospitalar: **${ocupacaoHospitalar.toFixed(1)}%**\n` +
            `• Doentes/Feridos: **${doentes.toLocaleString('pt-BR')}** / **${feridos.toLocaleString('pt-BR')}**\n` +
            `• Expectativa de Vida: **${expectativaVida} anos**\n` +
            `• Situação Sanitária: ${epidemiaAtiva ? '🚨 **EPIDEMIA ATIVA!**' : '✅ Sob controle'}\n\n` +
            `### 🌍 Relações Exteriores\n` +
            `• Alianças Militares: **${aliancas}** | Rotas Comerciais: **${rotas}** | Colônias/Fantoches: **${fantoches}**\n\n` +
            `### ⚔️ Forças Armadas\n` +
            `• 🪖 Infantaria: **${(ex.infantaria || 0).toLocaleString('pt-BR')}**\n` +
            `• 🚗 Tanques: **${(ex.tanques || 0).toLocaleString('pt-BR')}**\n` +
            `• ✈️ Aviões: **${(ex.avioes || 0).toLocaleString('pt-BR')}**\n` +
            `• 🚢 Navios: **${(ex.navios || 0).toLocaleString('pt-BR')}**\n` +
            `• 💣 Arsenal Nuclear: **${ogivas.toLocaleString('pt-BR')} ogivas**\n` +
            `• 🔋 **Poder Militar Total:** **${totalForca.toLocaleString('pt-BR')}**\n\n` +
            `### 🧱 Infraestrutura Construída\n${listaConstrucoes}\n\n` +
            `### 📦 Depósito de Recursos\n${recursosStr}`
    );

    const painelContainer = new ContainerBuilder()
        .setAccentColor(0x3498db) // Cor azul em formato numérico
        .addTextDisplayComponents(textoGoverno);

    const rpgHub = require('../systems/rpg-hub');
    const botoesRow = rpgHub.criarBotoes(nomePais);

    // Enviando os componentes de forma estruturada como uma lista simples, sem usar o spread (...) quebradiço
    painelContainer.addActionRowComponents(botoesRow);
    return message.channel.send({ components: [painelContainer], flags: MessageFlags.IsComponentsV2 });
};
