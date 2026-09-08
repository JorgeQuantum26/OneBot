const db = require('./rpg-db');
const { getDadosPais } = require('./real-countries-data');

const TIPOS_PROPOSTA = {
    rota_comercial: { emoji: '🚢', label: 'Rota Comercial', descricaoBase: 'propõe abrir uma rota comercial bilateral' },
    alianca_militar: { emoji: '🤝', label: 'Aliança Militar', descricaoBase: 'propõe um pacto de aliança militar' },
    acordo_agricola: { emoji: '🌾', label: 'Acordo Agrícola', descricaoBase: 'propõe um acordo de cooperação agrícola' },
    acordo_financeiro: { emoji: '💰', label: 'Acordo Financeiro', descricaoBase: 'propõe um auxílio financeiro mútuo' },
    tratado_paz: { emoji: '🕊️', label: 'Tratado de Paz', descricaoBase: 'propõe normalizar as relações diplomáticas' },
    fornecimento_armas: { emoji: '⚔️', label: 'Fornecimento de Armas', descricaoBase: 'propõe vender armamentos' },
    acordo_cientifico: { emoji: '🔬', label: 'Acordo Científico', descricaoBase: 'propõe um acordo de desenvolvimento tecnológico' },
};

// ⚡ FUNÇÃO DE NORMALIZAÇÃO DE NOMES
function normalizarNomePais(nome) {
    if (!nome) return '';
    const normalized = nome.toLowerCase();
    if (!db.has(`pais_alias_${normalized}`)) {
        db.set(`pais_alias_${normalized}`, nome);
    }
    return nome;
}

function criarProposta(remetente, destinatario, tipo, termos = {}) {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    // Normaliza nomes
    const remetenteNormalizado = normalizarNomePais(remetente);
    const destinatarioNormalizado = normalizarNomePais(destinatario);
    
    const dadosRem = getDadosPais(remetenteNormalizado);
    const dadosDest = getDadosPais(destinatarioNormalizado);
    const nomeRem = dadosRem ? `${dadosRem.bandeira} ${dadosRem.nomeFormal}` : remetenteNormalizado;
    const nomeDest = dadosDest ? `${dadosDest.bandeira} ${dadosDest.nomeFormal}` : destinatarioNormalizado;
    const tipoInfo = TIPOS_PROPOSTA[tipo] || { emoji: '📋', label: tipo };

    const proposta = {
        id,
        tipo,
        remetente: remetenteNormalizado,
        destinatario: destinatarioNormalizado,
        nomeRemetente: nomeRem,
        nomeDestinatario: nomeDest,
        de: nomeRem,        // ⚡ ALIAS para compatibilidade
        para: nomeDest,     // ⚡ ALIAS para compatibilidade
        termos,
        criadaEm: Date.now(),
        expiraEm: Date.now() + 10 * 60 * 1000,
        status: 'pendente'
    };

    let lista = db.get(`propostas_${destinatarioNormalizado}`) || [];
    lista = lista.filter(p => p.status === 'pendente' && p.expiraEm > Date.now());
    lista.push(proposta);
    db.set(`propostas_${destinatarioNormalizado}`, lista);

    return proposta;
}

async function enviarPropostaComBotao(client, proposta) {
    const destinatario = proposta.destinatario;
    const canalId = db.get(`canal_noticias_${destinatario}`);
    if (!canalId) return;
    const canal = client.channels.cache.get(canalId);
    if (!canal) return;

    const Discord = require('discord.js');
    const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
    const tipoInfo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };

    const embed = new Discord.EmbedBuilder()
        .setTitle(`${tipoInfo.emoji} Proposta Diplomática Recebida!`)
        .setDescription(
            `**${proposta.nomeRemetente}** ${TIPOS_PROPOSTA[proposta.tipo]?.descricaoBase || 'enviou uma proposta'} com **${proposta.nomeDestinatario}**.\n\n` +
            (proposta.termos.descricao || '') +
            `\n\n*⏰ Expira em 10 minutos.*`
        )
        .addFields({ name: '🆔 ID', value: proposta.id, inline: true })
        .addFields({ name: '📋 Tipo', value: tipoInfo.label, inline: true })
        .setColor('#f1c40f')
        .setTimestamp();

    if (proposta.termos.valorEnviado) embed.addFields({ name: '💰 Valor Oferecido', value: proposta.termos.valorEnviado.toLocaleString('pt-BR') + ' moedas', inline: true });
    if (proposta.termos.condicao) embed.addFields({ name: '📌 Condição', value: proposta.termos.condicao, inline: true });

    const btnAceitar = new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel('✅ Aceitar')
        .setCustomId(`aceitar_${proposta.id}`);

    const btnRecusar = new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel('❌ Recusar')
        .setCustomId(`recusar_${proposta.id}`);

    const row = new ActionRowBuilder().addComponents(btnAceitar, btnRecusar);

    canal.send({ embeds: [embed], components: [row] }).catch(() => {});
}

async function handlePropostaButton(client, interaction) {
    const customId = interaction.customId;
    const isAceitar = customId.startsWith('aceitar_');
    const isRecusar = customId.startsWith('recusar_');
    if (!isAceitar && !isRecusar) return false;

    const propostaId = customId.replace('aceitar_', '').replace('recusar_', '');
    const userId = interaction.user.id;
    
    // ⚡ Pega nome original
    const nomePaisOriginal = db.get(`${userId}.pais`);
    if (!nomePaisOriginal) {
        return interaction.followUp({ content: '❌ Você não governa nenhum país!', ephemeral: true });
    }
    const nomePais = nomePaisOriginal.toLowerCase();
    
    // ⚡ Busca flexível de propostas
    let propostas = db.get(`propostas_${nomePaisOriginal}`) || db.get(`propostas_${nomePais}`) || [];
    
    const pais = db.get(`pais_${nomePaisOriginal}`) || db.get(`pais_${nomePais}`);
    if (!pais || pais.governador !== userId) {
        return interaction.followUp({ content: '❌ Você não é o governador deste país!', ephemeral: true });
    }

    // ⚡ Busca case-insensitive
    const idx = propostas.findIndex(p => 
        p.id === propostaId && 
        p.status === 'pendente' &&
        (p.destinatario === nomePaisOriginal || 
         p.destinatario === nomePais ||
         p.destinatario?.toLowerCase() === nomePais ||
         p.para?.toLowerCase() === nomePais)
    );
    
    if (idx === -1) return interaction.followUp({ content: '❌ Proposta não encontrada ou já respondida!', ephemeral: true });

    const proposta = propostas[idx];
    
    if (proposta.expiraEm < Date.now()) {
        propostas[idx].status = 'expirada';
        db.set(`propostas_${nomePaisOriginal}`, propostas);
        return interaction.followUp({ content: '⏰ Esta proposta expirou!', ephemeral: true });
    }
    
    // ⚡ Validação case-insensitive
    if ((proposta.destinatario?.toLowerCase() !== nomePais) && 
        (proposta.para?.toLowerCase() !== nomePais)) {
        return interaction.followUp({ content: '❌ Esta proposta não é para o seu país!', ephemeral: true });
    }

    const Discord = require('discord.js');
    const tipoInfo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };

    if (isAceitar) {
        propostas[idx].status = 'aceita';
        db.set(`propostas_${nomePaisOriginal}`, propostas);
        await aplicarProposta(client, proposta);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${tipoInfo.emoji} Proposta Aceita!`)
            .setDescription(`**${proposta.nomeDestinatario}** aceitou a proposta de **${proposta.nomeRemetente}**!\n${proposta.termos.descricao || ''}`)
            .setColor('#2ecc71').setTimestamp();

        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal({ 
                titulo: `${tipoInfo.emoji} Acordo Internacional`, 
                descricao: `**${proposta.nomeDestinatario}** aceitou a proposta de **${proposta.nomeRemetente}**: **${tipoInfo.label}**`, 
                tipo: 'comercio', 
                impacto: 'positivo', 
                timestamp: Date.now(), 
                pais: nomePaisOriginal 
            });
        }

        await interaction.message.edit({ embeds: [embed], components: [] }).catch(() => {});
        return interaction.followUp({ content: '✅ Você aceitou a proposta! O acordo foi firmado.', ephemeral: true });
    }

    if (isRecusar) {
        propostas[idx].status = 'recusada';
        db.set(`propostas_${nomePaisOriginal}`, propostas);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${tipoInfo.emoji} Proposta Recusada`)
            .setDescription(`**${proposta.nomeDestinatario}** recusou a proposta de **${proposta.nomeRemetente}**.`)
            .setColor('#e74c3c').setTimestamp();

        await interaction.message.edit({ embeds: [embed], components: [] }).catch(() => {});
        return interaction.followUp({ content: '❌ Proposta recusada.', ephemeral: true });
    }
    return true;
}

async function aplicarProposta(client, proposta) {
    const { remetente, destinatario, tipo, termos } = proposta;

    switch (tipo) {
        case 'rota_comercial':
            const rotasRem = db.get(`pais_${remetente}.rotasComerciais`) || [];
            const rotasDest = db.get(`pais_${destinatario}.rotasComerciais`) || [];
            if (!rotasRem.find(r => r.parceiro === destinatario)) rotasRem.push({ parceiro: destinatario, tipo: 'bilateral', abertaEm: Date.now() });
            if (!rotasDest.find(r => r.parceiro === remetente)) rotasDest.push({ parceiro: remetente, tipo: 'bilateral', abertaEm: Date.now() });
            db.set(`pais_${remetente}.rotasComerciais`, rotasRem);
            db.set(`pais_${destinatario}.rotasComerciais`, rotasDest);
            break;

        case 'alianca_militar':
            let aliancasRem = db.get(`pais_${remetente}.aliancas`) || [];
            let aliancasDest = db.get(`pais_${destinatario}.aliancas`) || [];
            if (!aliancasRem.includes(destinatario)) aliancasRem.push(destinatario);
            if (!aliancasDest.includes(remetente)) aliancasDest.push(remetente);
            db.set(`pais_${remetente}.aliancas`, aliancasRem);
            db.set(`pais_${destinatario}.aliancas`, aliancasDest);
            break;

        case 'acordo_agricola':
            db.add(`pais_${remetente}.agricultura`, 500);
            db.add(`pais_${destinatario}.agricultura`, 500);
            db.add(`pais_${remetente}.comida`, 2000);
            db.add(`pais_${destinatario}.comida`, 2000);
            break;

        case 'acordo_financeiro':
            const valor = termos.valorEnviado || 1000;
            if ((db.get(`pais_${remetente}.tesouro`) || 0) >= valor) {
                db.subtract(`pais_${remetente}.tesouro`, valor);
                db.add(`pais_${destinatario}.tesouro`, valor);
            }
            break;

        case 'tratado_paz':
            let embRem = db.get(`pais_${remetente}.embargos`) || [];
            let embDest = db.get(`pais_${destinatario}.embargos`) || [];
            embRem = embRem.filter(e => e !== destinatario);
            embDest = embDest.filter(e => e !== remetente);
            db.set(`pais_${remetente}.embargos`, embRem);
            db.set(`pais_${destinatario}.embargos`, embDest);
            let sancRem = db.get(`pais_${remetente}.sancoes`) || [];
            let sancDest = db.get(`pais_${destinatario}.sancoes`) || [];
            sancRem = sancRem.filter(s => s.pais !== destinatario);
            sancDest = sancDest.filter(s => s.pais !== remetente);
            db.set(`pais_${remetente}.sancoes`, sancRem);
            db.set(`pais_${destinatario}.sancoes`, sancDest);
            break;

        case 'fornecimento_armas':
            const qtd = termos.quantidadeArmas || 10;
            const custoArmas = qtd * 500;
            if ((db.get(`pais_${destinatario}.tesouro`) || 0) >= custoArmas) {
                db.subtract(`pais_${destinatario}.tesouro`, custoArmas);
                db.add(`pais_${destinatario}.exercito.infantaria`, qtd * 100);
                db.add(`pais_${remetente}.tesouro`, custoArmas);
            }
            break;

        case 'acordo_cientifico':
            db.add(`pais_${remetente}.infraestrutura`, 0.5);
            db.add(`pais_${destinatario}.infraestrutura`, 0.5);
            break;
    }
}

module.exports = { criarProposta, enviarPropostaComBotao, handlePropostaButton, TIPOS_PROPOSTA };