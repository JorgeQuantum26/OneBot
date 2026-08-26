const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../systems/rpg-db');
const { TIPOS_PROPOSTA, criarProposta, enviarPropostaComBotao } = require('../systems/propostas-engine');
const { getDadosPais, PAISES_REAIS } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais) {
        return message.channel.send('❌ Você não governa nenhum país.');
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return;

    let propostas = db.get(`propostas_${nomePais}`) || [];

    // =========================
    // 📌 FUNÇÕES AUXILIARES
    // =========================

    const getNomeFormal = (nome) => {
        const dados = getDadosPais(nome);
        return dados ? `${dados.bandeira} ${dados.nomeFormal}` : nome;
    };

    const getNomeExtenso = (nome) => {
        const dados = getDadosPais(nome);
        return dados ? dados.nomeFormal : nome;
    };

    const aplicarReputacao = (alvo, valor, motivo) => {
        const atual = db.get(`pais_${alvo}.reputacaoDiplomatica`) || 50;
        const nova = Math.max(0, Math.min(100, atual + valor));
        db.set(`pais_${alvo}.reputacaoDiplomatica`, nova);

        const hist = db.get(`pais_${alvo}.historicoDiplomatico`) || [];
        hist.unshift({ valor, motivo, timestamp: Date.now() });
        if (hist.length > 20) hist.pop();
        db.set(`pais_${alvo}.historicoDiplomatico`, hist);
    };

    // =========================
    // 📤 ENVIAR PROPOSTA
    // =========================

    const acao = (args[0] || '').toLowerCase();
    const quantidade = parseInt(args[3]);
    if (acao === 'propor' || acao === 'enviar') {
        const paisAlvo = (args[1] || '').toLowerCase();
        const tipoProposta = (args[2] || '').toLowerCase();

        // Validações
        if (!paisAlvo) {
            return message.channel.send(
                '❌ Especifique o país destino.\nUse: `B!painel-diplomatico propor <país> <tipo>`'
            );
        }

        if (!tipoProposta) {
            return mostrarTiposProposta(message, paisAlvo);
        }

        // Verificar se o país alvo existe
        const dadosAlvo = getDadosPais(paisAlvo);
        if (!dadosAlvo) {
            return message.channel.send(`❌ País **${paisAlvo}** não encontrado no sistema.`);
        }

        // Verificar se não é o próprio país
        if (paisAlvo === nomePais.toLowerCase()) {
            return message.channel.send('❌ Você não pode enviar propostas para seu próprio país.');
        }

        // Verificar se o tipo é válido
        if (!TIPOS_PROPOSTA[tipoProposta]) {
            return message.channel.send(
                `❌ Tipo de proposta inválido: **${tipoProposta}**\n` +
                    `Tipos disponíveis: ${Object.keys(TIPOS_PROPOSTA)
                        .map((t) => `\`${t}\``)
                        .join(', ')}`
            );
        }

        // Verificar se já existe proposta pendente entre os países
        const propostasExistentes = db.get(`propostas_${paisAlvo}`) || [];
        const jaExiste = propostasExistentes.some(
            (p) => p.status === 'pendente' && (p.remetente === nomePais || p.de === nomePais) && p.tipo === tipoProposta
        );

        if (jaExiste) {
            return message.channel.send(
                `⚠️ Já existe uma proposta de **${TIPOS_PROPOSTA[tipoProposta].label}** pendente para **${getNomeFormal(paisAlvo)}**.`
            );
        }

        // Verificar embargos
        const embargosAlvo = db.get(`pais_${paisAlvo}.embargos`) || [];
        const meusEmbargos = pais.embargos || [];

        if (embargosAlvo.includes(nomePais)) {
            return message.channel.send(
                `🚫 **${getNomeFormal(paisAlvo)}** possui embargo contra seu país. Não é possível enviar propostas.`
            );
        }

        if (meusEmbargos.includes(paisAlvo)) {
            return message.channel.send(
                `🚫 Você possui embargo contra **${getNomeFormal(paisAlvo)}**. Remova o embargo primeiro.`
            );
        }

        // Montar termos da proposta
        const termos = montarTermosProposta(tipoProposta, nomePais, paisAlvo, quantidade);
        if (termos.erro) {
            return message.channel.send(termos.erro);
        }
        // Criar e enviar proposta
        try {
            const proposta = criarProposta(nomePais, paisAlvo, tipoProposta, termos);

            // Enviar com botão se possível
            await enviarPropostaComBotao(client, proposta);

            // Notificar que a proposta foi enviada
            if (client.paisEngine) {
                client.paisEngine.publicarNoticiaNacional(nomePais, {
                    titulo: `📤 Proposta Diplomática Enviada`,
                    descricao: `Você enviou uma proposta de **${TIPOS_PROPOSTA[tipoProposta].label.toLowerCase()}** para **${getNomeExtenso(paisAlvo)}**.\n\n📋 *${termos.descricao}*`,
                    tipo: 'comercio',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: nomePais
                });
            }

            const embedConfirmacao = new EmbedBuilder()
                .setTitle(`${TIPOS_PROPOSTA[tipoProposta].emoji} Proposta Enviada com Sucesso!`)
                .setDescription(
                    `Sua proposta foi enviada para **${getNomeFormal(paisAlvo)}**.\n\n` +
                        `📋 **Tipo:** ${TIPOS_PROPOSTA[tipoProposta].label}\n` +
                        `🆔 **ID:** \`${proposta.id}\`\n` +
                        `⏰ **Expira em:** 10 minutos\n\n` +
                        `📝 **Detalhes:** ${termos.descricao}`
                )
                .setColor('#2ecc71')
                .setFooter({ text: 'Aguardando resposta do destinatário...' })
                .setTimestamp();

            return message.channel.send({ embeds: [embedConfirmacao] });
        } catch (error) {
            console.error('Erro ao enviar proposta:', error);
            return message.channel.send('❌ Erro ao enviar proposta. Tente novamente.');
        }
    }

    // =========================
    // ⚡ ACEITAR / RECUSAR
    // =========================

    const cleanId = (args[1] || '').trim();

    if (acao === 'aceitar' || acao === 'recusar') {
        if (!cleanId) {
            return message.channel.send('❌ Informe o ID da proposta.');
        }

        // Busca simplificada e flexível
        const index = propostas.findIndex((p) => p.id === cleanId && p.status === 'pendente');

        if (index === -1) {
            return message.channel.send('❌ Proposta não encontrada ou já foi respondida.');
        }

        const proposta = propostas[index];

        // Validação de destinatário case-insensitive
        const destinatarioProposta = (proposta.destinatario || proposta.para || '').toLowerCase();
        if (destinatarioProposta !== nomePais.toLowerCase()) {
            const nomeMostrar = getNomeFormal(proposta.para || proposta.destinatario);
            return message.channel.send(`❌ Essa proposta é para **${nomeMostrar}**, não para o seu país.`);
        }

        // Pega remetente com fallback
        const remetente = proposta.remetente || proposta.de;
        if (!remetente) {
            return message.channel.send('❌ Proposta corrompida: remetente não identificado.');
        }

        const tipoInfo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };

        // ================= ACEITAR =================
        if (acao === 'aceitar') {
            proposta.status = 'aceita';
            propostas[index] = proposta;
            db.set(`propostas_${nomePais}`, propostas);

            aplicarReputacao(remetente, +5, 'Proposta aceita');
            aplicarReputacao(nomePais, +3, 'Acordo firmado');

            // Aplicar efeitos da proposta
            aplicarEfeitosProposta(nomePais, remetente, proposta);

            // Usar o engine do client para publicar notícia
            if (client.paisEngine) {
                const nomeFormalDest = getNomeExtenso(nomePais);
                const nomeFormalRem = getNomeExtenso(remetente);

                // Notícia para o destinatário
                client.paisEngine.publicarNoticiaNacional(nomePais, {
                    titulo: `${tipoInfo.emoji} Acordo Diplomático Firmado`,
                    descricao: `**${nomeFormalDest}** firmou um acordo de **${tipoInfo.label.toLowerCase()}** com **${nomeFormalRem}**.\n\n📋 *Detalhes:* ${proposta.termos?.descricao || 'Cooperação mútua estabelecida.'}`,
                    tipo: 'comercio',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                });

                // Notícia para o remetente
                client.paisEngine.publicarNoticiaNacional(remetente, {
                    titulo: `${tipoInfo.emoji} Proposta Diplomática Aceita`,
                    descricao: `**${nomeFormalDest}** aceitou sua proposta de **${tipoInfo.label.toLowerCase()}**.\n\n📋 *Acordo firmado com sucesso.*`,
                    tipo: 'comercio',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: remetente
                });

                // Notícia global
                client.paisEngine.publicarNoticiaGlobal({
                    titulo: `${tipoInfo.emoji} Novo Acordo Internacional`,
                    descricao: `**${nomeFormalDest}** e **${nomeFormalRem}** estabeleceram um pacto de **${tipoInfo.label.toLowerCase()}**, fortalecendo laços diplomáticos entre as nações.`,
                    tipo: 'comercio',
                    impacto: 'positivo',
                    timestamp: Date.now(),
                    pais: nomePais
                });
            }

            const nomeFormalDest = getNomeFormal(nomePais);
            const nomeFormalRem = getNomeFormal(remetente);

            return message.channel.send(
                `✅ **Acordo firmado com sucesso!**\n\n` +
                    `${tipoInfo.emoji} **${nomeFormalDest}** agora possui um acordo de **${tipoInfo.label.toLowerCase()}** com **${nomeFormalRem}**.\n` +
                    `🆔 ID: \`${cleanId}\`\n` +
                    `📰 Notícias publicadas nacional e internacionalmente.`
            );
        }

        // ================= RECUSAR =================
        if (acao === 'recusar') {
            proposta.status = 'recusada';
            propostas[index] = proposta;
            db.set(`propostas_${nomePais}`, propostas);

            aplicarReputacao(remetente, -5, 'Proposta recusada');
            aplicarReputacao(nomePais, -2, 'Recusa diplomática');

            // Notícia de recusa
            if (client.paisEngine) {
                const nomeFormalDest = getNomeExtenso(nomePais);
                const nomeFormalRem = getNomeExtenso(remetente);

                client.paisEngine.publicarNoticiaNacional(nomePais, {
                    titulo: `❌ Proposta Diplomática Recusada`,
                    descricao: `**${nomeFormalDest}** recusou a proposta de **${tipoInfo.label.toLowerCase()}** enviada por **${nomeFormalRem}**.\n\n⚠️ As relações diplomáticas podem ser afetadas.`,
                    tipo: 'comercio',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: nomePais
                });

                client.paisEngine.publicarNoticiaNacional(remetente, {
                    titulo: `❌ Proposta Rejeitada`,
                    descricao: `**${nomeFormalDest}** rejeitou sua proposta de **${tipoInfo.label.toLowerCase()}**.\n\n📉 Sua reputação diplomática foi levemente afetada.`,
                    tipo: 'comercio',
                    impacto: 'negativo',
                    timestamp: Date.now(),
                    pais: remetente
                });
            }

            const nomeFormalDest = getNomeFormal(nomePais);
            const nomeFormalRem = getNomeFormal(remetente);

            return message.channel.send(
                `❌ **Proposta recusada.**\n\n` +
                    `${tipoInfo.emoji} A proposta de **${tipoInfo.label.toLowerCase()}** de **${nomeFormalRem}** foi rejeitada por **${nomeFormalDest}**.\n` +
                    `🆔 ID: \`${cleanId}\`\n` +
                    `⚠️ Impacto diplomático aplicado.`
            );
        }
    }

    // =========================
    // 📊 PAINEL DIPLOMÁTICO
    // =========================

    const pendentes = propostas.filter((p) => p.status === 'pendente');

    if (!acao) {
        return message.channel.send(criarPainelInterativo(nomePais, pais, pendentes));
    }

    const rep = pais.reputacaoDiplomatica || 50;
    const embargos = pais.embargos || [];
    const aliancas = pais.aliancas || [];
    const rotas = pais.rotasComerciais || [];

    // Barra de reputação visual
    const barraReputacao =
        '🟩'.repeat(Math.max(0, Math.floor(rep / 10))) + '⬛'.repeat(Math.max(0, 10 - Math.floor(rep / 10)));

    // Status diplomático
    let statusDip = '⚖️ Neutro';
    let corEmbed = 'BLUE';
    let iconeStatus = '🌐';

    if (rep >= 75) {
        statusDip = 'Potência Diplomática';
        corEmbed = 0x00ff00;
        iconeStatus = '🟢';
    } else if (rep >= 50) {
        statusDip = 'Relações Estáveis';
        corEmbed = 0xffff00;
        iconeStatus = '🟡';
    } else if (rep >= 30) {
        statusDip = 'Tensões Diplomáticas';
        corEmbed = 0xffa500;
        iconeStatus = '⚠️';
    } else {
        statusDip = 'Isolamento Internacional';
        corEmbed = 0xff0000;
        iconeStatus = '🚫';
    }

    // Formatar listas com nomes formais
    const listaEmbargos = embargos.length > 0 ? embargos.map((e) => `🚫 ${getNomeFormal(e)}`).join('\n') : '✅ Nenhum';

    const listaAliancas =
        aliancas.length > 0 ? aliancas.map((a) => `🤝 ${getNomeFormal(a)}`).join('\n') : 'Nenhuma aliança ativa';

    const listaRotas =
        rotas.length > 0 ? rotas.map((r) => `🚢 ${getNomeFormal(r.parceiro)}`).join('\n') : 'Nenhuma rota ativa';

    // Histórico diplomático formatado
    const historico =
        (pais.historicoDiplomatico || [])
            .slice(0, 5)
            .map((h) => {
                const icone = h.valor > 0 ? '📈' : '📉';
                const sinal = h.valor > 0 ? '+' : '';
                return `${icone} ${sinal}${h.valor} rep • ${h.motivo}`;
            })
            .join('\n') || '📜 Sem registros diplomáticos';

    const nomeFormalPais = getNomeFormal(nomePais);

    // Embed principal do painel
    const embed = new EmbedBuilder()
        .setTitle(`🏛️ Painel Diplomático — ${nomeFormalPais}`)
        .setColor(corEmbed)
        .setDescription(
            `### ${iconeStatus} Status: ${statusDip}\n` +
                `🌍 **Reputação Internacional:** ${rep}/100\n` +
                `${barraReputacao}\n\n` +
                `*A reputação afeta a disposição de outras nações em propor acordos.*`
        )
        .addFields({
            name: '📬 Propostas Pendentes',
            value: `**${pendentes.length}** proposta(s) aguardando resposta`,
            inline: true
        })
        .addFields({ name: '🤝 Alianças Militares', value: `**${aliancas.length}** aliança(s) ativa(s)`, inline: true })
        .addFields({ name: '🚢 Rotas Comerciais', value: `**${rotas.length}** rota(s) estabelecida(s)`, inline: true })
        .addFields({ name: '⚔️ Sanções & Embargos', value: listaEmbargos, inline: true })
        .addFields({ name: '🛡️ Aliados', value: listaAliancas, inline: true })
        .addFields({ name: '📊 Parceiros Comerciais', value: listaRotas, inline: true })
        .addFields({ name: '📜 Histórico Diplomático Recente', value: historico, inline: false });

    // Seção de propostas pendentes
    if (pendentes.length > 0) {
        const propostasFormatadas = pendentes
            .slice(0, 5)
            .map((p) => {
                const nomeRemetente = getNomeFormal(p.remetente || p.de);
                const tipoLabel = TIPOS_PROPOSTA[p.tipo]?.label || p.tipo || 'Desconhecido';
                const tipoEmoji = TIPOS_PROPOSTA[p.tipo]?.emoji || '📋';
                const expiraEm = Math.floor((p.expiraEm - Date.now()) / 60000);

                return (
                    `${tipoEmoji} **${tipoLabel}**\n` +
                    `┗ De: ${nomeRemetente}\n` +
                    `┗ ID: \`${p.id}\`\n` +
                    `┗ Expira em: ${expiraEm} min`
                );
            })
            .join('\n\n');

        embed.addFields({ name: '📨 Propostas Recentes', value: propostasFormatadas, inline: false });
    }

    // Comandos disponíveis
    embed.addFields({
        name: '⚡ Comandos de Ação',
        value:
            '`B!painel-diplomatico propor <país> <tipo>` • Enviar proposta\n' +
            '`B!painel-diplomatico aceitar <id>` • Aceitar proposta\n' +
            '`B!painel-diplomatico recusar <id>` • Recusar proposta',
        inline: false
    });

    // Análise estratégica baseada na reputação
    let analise = '';
    if (rep >= 75) {
        analise =
            '🌐 **Alta Influência Global**\nSeu país é respeitado internacionalmente. Acordos avançados e alianças estratégicas são comuns. Nações frequentemente buscam sua parceria.';
    } else if (rep >= 50) {
        analise =
            '⚖️ **Diplomacia Estável**\nRelações equilibradas com a comunidade internacional. Mantenha acordos ativos e evite conflitos desnecessários para melhorar sua posição.';
    } else if (rep >= 30) {
        analise =
            '⚠️ **Tensões Crescentes**\nSua reputação está comprometida. Outras nações podem hesitar em propor acordos. Considere melhorar relações com tratados de paz e cooperação.';
    } else {
        analise =
            '🚫 **Isolamento Crítico**\nBaixíssima confiança internacional. Risco elevado de sanções e embargos. Ações diplomáticas urgentes são necessárias para reverter este cenário.';
    }

    embed.addFields({ name: '📌 Análise Estratégica', value: analise, inline: false });

    // Dicas baseadas na situação atual
    let dicas = [];
    if (rotas.length === 0) dicas.push('🚢 Abra rotas comerciais para gerar renda passiva');
    if (aliancas.length === 0) dicas.push('🤝 Considere formar alianças militares para proteção');
    if (embargos.length > 0) dicas.push('🕊️ Negocie tratados de paz para remover sanções');
    if (pendentes.length > 3) dicas.push('📬 Múltiplas propostas pendentes - revise urgentemente');
    if (rep < 40) dicas.push('📈 Melhore sua reputação aceitando acordos benéficos');
    if (rep >= 70) dicas.push('🌐 Use sua influência para propor acordos vantajosos');

    if (dicas.length > 0) {
        embed.addFields({ name: '💡 Recomendações', value: dicas.map((d) => `• ${d}`).join('\n'), inline: false });
    }

    embed.setFooter({ text: `🕊️ Sistema Diplomático • ${new Date().toLocaleString('pt-BR')}` }).setTimestamp();

    return message.channel.send({ embeds: [embed] });
};

// ⚡ FUNÇÃO: Mostrar tipos de proposta disponíveis
function criarPainelInterativo(nomePais, pais, pendentes) {
    const rep = Math.max(0, Math.min(100, Number(pais.reputacaoDiplomatica) || 50));
    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? `${dados.bandeira} ${dados.nomeFormal}` : nomePais;
    const embed = new EmbedBuilder()
        .setTitle(`🏛️ Painel Diplomático — ${nomeFormal}`)
        .setColor(rep >= 70 ? 0x2ecc71 : rep >= 40 ? 0xf1c40f : 0xe74c3c)
        .setDescription(`🌍 Reputação internacional: **${rep}/100**\n📬 Propostas pendentes: **${pendentes.length}**`)
        .addFields({ name: '🤝 Alianças', value: `${(pais.aliancas || []).length}`, inline: true })
        .addFields({ name: '🚢 Rotas', value: `${(pais.rotasComerciais || []).length}`, inline: true })
        .addFields({ name: '🚫 Embargos', value: `${(pais.embargos || []).length}`, inline: true });

    if (pendentes.length === 0) {
        embed.addFields({
            name: '📭 Caixa diplomática',
            value: 'Nenhuma proposta pendente no momento.',
            inline: false
        });
    } else {
        embed.addFields({
            name: '📨 Propostas',
            value: pendentes
                .slice(0, 5)
                .map((proposta) => {
                    const tipo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };
                    const remetente =
                        proposta.nomeRemetente || proposta.remetente || proposta.de || 'País desconhecido';
                    return `${tipo.emoji} **${tipo.label}** de ${remetente}`;
                })
                .join('\n'),
            inline: false
        });
    }

    const botoes = pendentes
        .slice(0, 5)
        .map((proposta) =>
            new ButtonBuilder()
                .setCustomId(`rpg_diplomacia:ver:${proposta.id}`)
                .setLabel(`Ver ${proposta.tipo}`.slice(0, 80))
                .setStyle(ButtonStyle.Primary)
        );
    botoes.push(
        new ButtonBuilder()
            .setCustomId(`rpg_diplomacia:atualizar:${nomePais}`)
            .setLabel('Atualizar')
            .setStyle(ButtonStyle.Secondary)
    );

    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(botoes.slice(0, 5))] };
}

function renderizarDetalheProposta(nomePais, proposta) {
    const tipo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };
    const embed = new EmbedBuilder()
        .setTitle(`${tipo.emoji} Proposta Diplomática`)
        .setColor(0xf1c40f)
        .setDescription(proposta.termos?.descricao || 'Sem detalhes adicionais.')
        .addFields(
            {
                name: 'De',
                value: proposta.nomeRemetente || proposta.remetente || proposta.de || 'Desconhecido',
                inline: true
            },
            {
                name: 'Para',
                value: proposta.nomeDestinatario || proposta.destinatario || proposta.para || nomePais,
                inline: true
            },
            { name: 'Expira', value: new Date(proposta.expiraEm).toLocaleString('pt-BR'), inline: true }
        );
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aceitar_${proposta.id}`).setLabel('Aceitar').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`recusar_${proposta.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`rpg_diplomacia:voltar:${nomePais}`)
            .setLabel('Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    return { embeds: [embed], components: [row] };
}

function mostrarTiposProposta(message, paisAlvo) {
    const embed = new EmbedBuilder()
        .setTitle('📋 Tipos de Proposta Disponíveis')
        .setDescription(
            `Para enviar uma proposta para **${paisAlvo}**, use:\n\`B!painel-diplomatico propor ${paisAlvo} <tipo>\`\n\nEscolha um dos tipos abaixo:`
        )
        .setColor('#3498db');

    for (const [tipo, info] of Object.entries(TIPOS_PROPOSTA)) {
        const exemplos = {
            rota_comercial: 'Gera renda passiva para ambos',
            alianca_militar: 'Defesa mútua em caso de ataque',
            acordo_agricola: '+500 agricultura, +2000 comida',
            acordo_financeiro: 'Transferência de moedas entre países',
            tratado_paz: 'Remove sanções e embargos',
            fornecimento_armas: 'Venda de armamentos',
            acordo_cientifico: '+0.5 infraestrutura para ambos'
        };

        embed.addFields({
            name: `${info.emoji} ${info.label}`,
            value: `📝 ${exemplos[tipo] || info.descricaoBase}\n🔑 Tipo: \`${tipo}\``,
            inline: true
        });
    }

    embed.setFooter({ text: '💡 Dica: Países com alta reputação têm mais chances de aceitar propostas' });

    return message.channel.send({ embeds: [embed] });
}

module.exports.criarPainelInterativo = criarPainelInterativo;
module.exports.renderizarDetalheProposta = renderizarDetalheProposta;

// ⚡ FUNÇÃO: Montar termos específicos para cada tipo de proposta
function montarTermosProposta(tipo, remetente, destinatario, quantidade) {
    const nomeRem = getDadosPais(remetente);
    const nomeDest = getDadosPais(destinatario);
    const nomeFormalRem = nomeRem ? nomeRem.nomeFormal : remetente;
    const nomeFormalDest = nomeDest ? nomeDest.nomeFormal : destinatario;

    const termos = { descricao: '' };

    switch (tipo) {
        case 'rota_comercial':
            termos.descricao = `Abertura de rota comercial bilateral entre ${nomeFormalRem} e ${nomeFormalDest}, gerando renda passiva a cada ciclo para ambos os países.`;
            break;

        case 'alianca_militar':
            termos.descricao = `Pacto de defesa mútua: em caso de ataque a qualquer uma das nações, o aliado intervirá militarmente em defesa.`;
            break;

        case 'acordo_agricola':
            termos.descricao = `Acordo de cooperação agrícola: ambos os países recebem +500 em agricultura e +2000 em comida.`;
            break;

        case 'acordo_financeiro':
            const tesouro = db.get(`pais_${remetente}.tesouro`) || 0;
            const valorAEnviar = quantidade || 50000;
            if (tesouro < valorAEnviar) {
                termos.erro = `❌ Seu país não tem recursos suficientes para enviar ${valorAEnviar.toLocaleString('pt-BR')} moedas.`;
                return termos;
            }
            const valor = Math.floor(Math.min(tesouro * 0.1, valorAEnviar));
            termos.valorEnviado = valor;
            termos.descricao = `Auxílio financeiro de **${valor.toLocaleString('pt-BR')}** moedas de ${nomeFormalRem} para ${nomeFormalDest}.`;
            break;

        case 'tratado_paz':
            termos.descricao = `Normalização completa das relações diplomáticas, removendo todas as sanções e embargos entre as nações.`;
            break;

        case 'fornecimento_armas':
            const qtdArmas = 50;
            termos.quantidadeArmas = qtdArmas;
            termos.descricao = `Fornecimento de ${qtdArmas} unidades de armamentos por ${qtdArmas * 500} moedas.`;
            break;

        case 'acordo_cientifico':
            termos.descricao = `Acordo de desenvolvimento tecnológico conjunto: +0.5 de infraestrutura para ambos os países.`;
            break;

        default:
            termos.descricao = `Proposta de cooperação diplomática entre as nações.`;
    }

    return termos;
}

// ⚡ FUNÇÃO AUXILIAR: Aplicar efeitos das propostas
function aplicarEfeitosProposta(destinatario, remetente, proposta) {
    const { tipo, termos } = proposta;

    switch (tipo) {
        case 'rota_comercial':
            const rotasRem = db.get(`pais_${remetente}.rotasComerciais`) || [];
            const rotasDest = db.get(`pais_${destinatario}.rotasComerciais`) || [];
            if (!rotasRem.find((r) => r.parceiro === destinatario)) {
                rotasRem.push({ parceiro: destinatario, tipo: 'bilateral', abertaEm: Date.now() });
            }
            if (!rotasDest.find((r) => r.parceiro === remetente)) {
                rotasDest.push({ parceiro: remetente, tipo: 'bilateral', abertaEm: Date.now() });
            }
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
            const valor = termos?.valorEnviado || 1000;
            if ((db.get(`pais_${remetente}.tesouro`) || 0) >= valor) {
                db.subtract(`pais_${remetente}.tesouro`, valor);
                db.add(`pais_${destinatario}.tesouro`, valor);
            }
            break;

        case 'tratado_paz':
            let embRem = db.get(`pais_${remetente}.embargos`) || [];
            let embDest = db.get(`pais_${destinatario}.embargos`) || [];
            embRem = embRem.filter((e) => e !== destinatario);
            embDest = embDest.filter((e) => e !== remetente);
            db.set(`pais_${remetente}.embargos`, embRem);
            db.set(`pais_${destinatario}.embargos`, embDest);

            let sancRem = db.get(`pais_${remetente}.sancoes`) || [];
            let sancDest = db.get(`pais_${destinatario}.sancoes`) || [];
            sancRem = sancRem.filter((s) => s.pais !== destinatario);
            sancDest = sancDest.filter((s) => s.pais !== remetente);
            db.set(`pais_${remetente}.sancoes`, sancRem);
            db.set(`pais_${destinatario}.sancoes`, sancDest);
            break;

        case 'fornecimento_armas':
            const qtd = termos?.quantidadeArmas || 10;
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
