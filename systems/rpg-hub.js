// systems/rpg-hub.js
const {
    ContainerBuilder,
    TextDisplayBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    MessageFlags
} = require('discord.js');
const db = require('./rpg-db');
const { getPaisState } = require('./pais-state');
const { conferirPais } = require('./pais-conferencia');

const SECOES = {
    visao: 'Visão geral',
    economia: 'Economia',
    militar: 'Militar',
    diplomacia: 'Diplomacia',
    guerras: 'Guerras'
};

function numero(valor) {
    return (Number(valor) || 0).toLocaleString('pt-BR');
}

/**
 * Cria a fileira de botões injetando o país usando dois pontos (:) como divisor seguro
 */
function criarBotoes(nomePais) {
    const row = new ActionRowBuilder();

    Object.keys(SECOES).forEach((secao) => {
        row.addComponents(
            new ButtonBuilder()
                .setStyle(secao === 'visao' ? ButtonStyle.Success : ButtonStyle.Primary)
                .setLabel(SECOES[secao])
                .setCustomId(`rpg_hub:${secao}:${nomePais.toLowerCase()}`) // 💡 Divisor ':' impede quebra em países com hífen ou sub-traço
        );
    });

    return row;
}

/**
 * Renderiza o painel utilizando ContainerBuilder nativo do padrão IsComponentsV2
 */
function renderizar(nomePais, secao = 'visao') {
    const contexto = getPaisState(nomePais);
    if (!contexto) return null;

    const pais = contexto.estado;
    const dados = contexto.base;
    const nome = `${dados?.bandeira || pais.bandeira || '🏳️'} ${dados?.nomeFormal || pais.nomeFormal || nomePais}`;

    const guerras = (db.get('guerras_ativas') || []).filter(
        (guerra) =>
            guerra.atacante?.toLowerCase() === nomePais.toLowerCase() ||
            guerra.defensor?.toLowerCase() === nomePais.toLowerCase()
    );

    const ex = pais.exercito || {};
    const construcoes = pais.construcoes || {};

    let corpoTexto = `## 🗺️ RPG Mundi • ${SECOES[secao] || SECOES.visao}\n**${nome}**\n*Acompanhe e administre o estado atual do país.*\n\n`;

    // Monta as seções em blocos de texto Markdown limpos para o TextDisplayBuilder
    if (secao === 'economia') {
        corpoTexto +=
            `### 💰 Finanças\n` +
            `• Tesouro: **${numero(pais.tesouro)}**\n` +
            `• Reserva: **${numero(pais.tesouroNacional)}**\n` +
            `• PIB: **${numero(pais.pib)}**\n` +
            `• Receita: **${numero(pais.receita)}**\n` +
            `• Gastos: **${numero(pais.gastos)}**\n\n` +
            `### 📈 Indicadores\n` +
            `• Inflação: **${((Number(pais.inflacao) || 0) * 100).toFixed(2)}%**\n` +
            `• Imposto: **${((Number(pais.taxaImposto) || 0) * 100).toFixed(2)}%**\n` +
            `• Produtividade: **${pais.produtividade || 1}**`;
    } else if (secao === 'militar') {
        corpoTexto +=
            `### ⚔️ Forças Armadas\n` +
            `• Infantaria: **${numero(ex.infantaria)}**\n` +
            `• Tanques: **${numero(ex.tanques)}**\n` +
            `• Aviões: **${numero(ex.avioes)}**\n` +
            `• Navios: **${numero(ex.navios)}**\n\n` +
            `### 🏛️ Estrutura de Defesa\n` +
            `• Nível do Quartel: **${numero(construcoes.quartel)}**\n` +
            `• Bases Militares: **${(pais.bases_militares || []).length}**\n` +
            `• Arsenal Nuclear: **${numero(pais.bombasNucleares)} ogivas**`;
    } else if (secao === 'diplomacia') {
        corpoTexto +=
            `### 🌍 Relações Internacionais\n` +
            `• Reputação Diplomática: **${numero(pais.reputacaoDiplomatica || 50)}/100**\n` +
            `• Alianças Ativas: **${(pais.aliancas || []).length}**\n` +
            `• Embargos Sofridos: **${(pais.embargos || []).length}**\n` +
            `• Rotas Comerciais: **${(pais.rotasComerciais || []).length}**`;
    } else if (secao === 'guerras') {
        const textoGuerras = guerras.length
            ? guerras
                  .map(
                      (g) =>
                          `⚔️ **${g.atacante} x ${g.defensor}** • Progresso: ${g.progresso || 0}% • Status: \`${g.status || 'ativa'}\``
                  )
                  .join('\n')
            : 'Nenhum conflito militar ativo.';
        corpoTexto += `### 🎖️ Conflitos Ativos\n${textoGuerras}`;
    } else {
        const conferencia = conferirPais(nomePais);
        const resumoConferencia = conferencia.ok
            ? '✅ Conferência nacional sem anomalias detectadas.'
            : `⚠️ Conferência nacional: **${conferencia.anomalias.length} anomalia(s)** detectada(s). Use B!conferencia-nacional para detalhes.`;
        corpoTexto +=
            `### 📊 Situação Interna\n` +
            `• População Civil: **${numero(pais.populacao)} habitantes**\n` +
            `• Infraestrutura Geral: **${numero(pais.infraestrutura)}**\n` +
            `• Aprovação do Governo: **${numero(pais.aprovacaoPopular || 50)}%**\n` +
            `• Status Político: **${pais.status || 'Soberano'}**\n\n` +
            `### 🔎 Verificação de Dados\n${resumoConferencia}\n\n` +
            `### 🧭 Navegação\nUse os botões abaixo para alternar entre os sub-painéis de finanças, forças, diplomacia e guerras. As ações de jogo continuam nos comandos próprios.`;
    }

    // Define a barra lateral de cor do contêiner arredondado V2
    const corBorda = secao === 'militar' || secao === 'guerras' ? 0x992d22 : 0x3498db;

    const display = new TextDisplayBuilder().setContent(corpoTexto);

    return new ContainerBuilder()
        .setAccentColor(corBorda)
        .addTextDisplayComponents(display)
        .addActionRowComponents(criarBotoes(nomePais));
}

/**
 * Interceptador de clique síncrono do index.js
 */
async function handleButton(interaction, userId) {
    // rpg_hub:secao:nomePais
    const partes = interaction.customId.split(':');
    const secao = partes[1];
    const nomePais = partes[2];

    // Validação em caixa baixa para evitar falhas de digitação de strings do Discord
    const paisDoJogador = (db.get(`${userId}.pais`) || '').toLowerCase();

    if (paisDoJogador !== nomePais?.toLowerCase()) {
        return interaction.reply({ content: '❌ Este painel não pertence ao seu país atual.', ephemeral: true });
    }

    const containerV2 = renderizar(nomePais, secao);
    if (!containerV2) {
        return interaction.reply({
            content: '❌ O estado do país não pôde ser processado na memória.',
            ephemeral: true
        });
    }

    // Atualiza a mensagem utilizando estritamente a nova engine V2 (enviando via array de components)
    return interaction.update({ components: [containerV2], flags: MessageFlags.IsComponentsV2 });
}

module.exports = { criarBotoes, renderizar, handleButton };
