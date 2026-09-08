// ==========================================
// COMMANDS/PAINEL-DIPLOMATICO.JS - PARTE 1 DE 3
// ==========================================
const { ContainerBuilder, TextDisplayBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const db = require('../systems/rpg-db');
const { TIPOS_PROPOSTA, criarProposta, enviarPropostaComBotao } = require('../systems/propostas-engine');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
        const userId = message.author.id;
        const nomePais = db.get(`${userId}.pais`);

        if (!nomePais) {
                return message.channel.send('❌ Você não governa nenhum país.');
        }

        const pais = db.get(`pais_${nomePais}`);
        if (!pais) return;

        let propostas = db.get(`propostas_${nomePais}`) || [];

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

        const acao = (args[0] || '').toLowerCase();
        const quantidade = parseInt(args[3]);

        if (acao === 'propor' || acao === 'enviar') {
                const paisAlvo = (args[1] || '').toLowerCase();
                const tipoProposta = (args[2] || '').toLowerCase();

                if (!paisAlvo) {
                        return message.channel.send('❌ Especifique o país destino.\nUse: `B!painel-diplomatico propor <país> <tipo>`');
                }

                if (!tipoProposta) {
                        return mostrarTiposProposta(message, paisAlvo);
                }

                const dadosAlvo = getDadosPais(paisAlvo);
                if (!dadosAlvo) {
                        return message.channel.send(`❌ País **${paisAlvo}** não encontrado no sistema.`);
                }

                if (paisAlvo === nomePais.toLowerCase()) {
                        return message.channel.send('❌ Você não pode enviar propostas para seu próprio país.');
                }

                if (!TIPOS_PROPOSTA[tipoProposta]) {
                        return message.channel.send(
                                `❌ Tipo de proposta inválido: **${tipoProposta}**\n` +
                                `Tipos disponíveis: ${Object.keys(TIPOS_PROPOSTA).map((t) => `\`${t}\``).join(', ')}`
                        );
                }

                const propostasExistentes = db.get(`propostas_${paisAlvo}`) || [];
                const jaExiste = propostasExistentes.some(
                        (p) => p.status === 'pendente' && (p.remetente === nomePais || p.de === nomePais) && p.tipo === tipoProposta
                );

                if (jaExiste) {
                        return message.channel.send(`⚠️ Já existe uma proposta de **${TIPOS_PROPOSTA[tipoProposta].label}** pendente para **${getNomeFormal(paisAlvo)}**.`);
                }

                const embargosAlvo = db.get(`pais_${paisAlvo}.embargos`) || [];
                const meusEmbargos = pais.embargos || [];

                if (embargosAlvo.includes(nomePais)) {
                        return message.channel.send(`🚫 **${getNomeFormal(paisAlvo)}** possui embargo contra seu país. Não é possível enviar propostas.`);
                }

                if (meusEmbargos.includes(paisAlvo)) {
                        return message.channel.send(`🚫 Você possui embargo contra **${getNomeFormal(paisAlvo)}**. Remova o embargo primeiro.`);
                }

                const termos = montarTermosProposta(tipoProposta, nomePais, paisAlvo, quantidade);
                if (termos.erro) {
                        return message.channel.send(termos.erro);
                }

                try {
                        const proposta = criarProposta(nomePais, paisAlvo, tipoProposta, termos);
                        await enviarPropostaComBotao(client, proposta);

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

                        const displayConfirmacao = new TextDisplayBuilder().setContent(
                                `### ${TIPOS_PROPOSTA[tipoProposta].emoji} Proposta Enviada com Sucesso!\n` +
                                `Sua proposta foi enviada para **${getNomeFormal(paisAlvo)}**.\n\n` +
                                `• **Tipo:** ${TIPOS_PROPOSTA[tipoProposta].label}\n` +
                                `• **ID:** \`${proposta.id}\`\n` +
                                `• **Expira em:** 10 minutos\n\n` +
                                `📝 **Detalhes:** ${termos.descricao}`
                        );

                        const containerConfirmacao = new ContainerBuilder()
                                .setAccentColor(0x2ecc71)
                                .addTextDisplayComponents(displayConfirmacao);

                        return message.channel.send({ components: [containerConfirmacao], flags: MessageFlags.IsComponentsV2 });
                } catch (error) {
                        console.error('Erro ao enviar proposta:', error);
                        return message.channel.send('❌ Erro ao enviar proposta. Tente novamente.');
                }
        }
        // ==========================================
        // COMMANDS/PAINEL-DIPLOMATICO.JS - PARTE 2 DE 3
        // ==========================================
        if (acao === 'aceitar' || acao === 'recusar') {
                const cleanId = (args[1] || '').trim();
                if (!cleanId) return message.channel.send('❌ Informe o ID da proposta.');

                const index = propostas.findIndex((p) => p.id === cleanId && p.status === 'pendente');
                if (index === -1) return message.channel.send('❌ Proposta não encontrada ou já foi respondida.');

                const proposta = propostas[index];
                const destinatarioProposta = (proposta.destinatario || proposta.para || '').toLowerCase();

                if (destinatarioProposta !== nomePais.toLowerCase()) {
                        return message.channel.send(`❌ Essa proposta é para **${getNomeFormal(proposta.para || proposta.destinatario)}**, não para o seu país.`);
                }

                const remetente = proposta.remetente || proposta.de;
                const tipoInfo = TIPOS_PROPOSTA[proposta.tipo] || { emoji: '📋', label: proposta.tipo };

                if (acao === 'aceitar') {
                        proposta.status = 'aceita';
                        propostas[index] = proposta;
                        db.set(`propostas_${nomePais}`, propostas);

                        aplicarReputacao(remetente, +5, 'Proposta aceita');
                        aplicarReputacao(nomePais, +3, 'Acordo firmado');
                        aplicarEfeitosProposta(nomePais, remetente, proposta);

                        if (client.paisEngine) {
                                const nomeFormalDest = getNomeExtenso(nomePais);
                                const nomeFormalRem = getNomeExtenso(remetente);

                                client.paisEngine.publicarNoticiaNacional(nomePais, {
                                        titulo: `${tipoInfo.emoji} Acordo Diplomático Firmado`,
                                        descricao: `**${nomeFormalDest}** firmou um acordo de **${tipoInfo.label.toLowerCase()}** com **${nomeFormalRem}**.\n\n📋 *Detalhes:* ${proposta.termos?.descricao || 'Cooperação mútua estabelecida.'}`,
                                        tipo: 'comercio',
                                        impacto: 'positivo',
                                        timestamp: Date.now(),
                                        pais: nomePais
                                });
                        }

                        return message.channel.send(
                                `✅ **Acordo firmado com sucesso!**\n\n` +
                                `${tipoInfo.emoji} **${getNomeFormal(nomePais)}** agora possui um acordo de **${tipoInfo.label.toLowerCase()}** com **${getNomeFormal(remetente)}**.\n` +
                                `🆔 ID: \`${cleanId}\``
                        );
                }

                if (acao === 'recusar') {
                        proposta.status = 'recusada';
                        propostas[index] = proposta;
                        db.set(`propostas_${nomePais}`, propostas);

                        aplicarReputacao(remetente, -5, 'Proposta recusada');
                        aplicarReputacao(nomePais, -2, 'Recusa diplomática');

                        return message.channel.send(`❌ **Proposta rejeitada.** As relações com **${getNomeFormal(remetente)}** sofreram impacto.`);
                }
        }

        const pendentes = propostas.filter((p) => p.status === 'pendente');

        if (!acao) {
                const visualPanel = criarPainelInterativo(nomePais, pais, pendentes);
                return message.channel.send({ components: [visualPanel], flags: MessageFlags.IsComponentsV2 });
        }

        const rep = pais.reputacaoDiplomatica || 50;
        const embargos = pais.embargos || [];
        const aliancas = pais.aliancas || [];
        const rotas = pais.rotasComerciais || [];

        const barraReputacao = '🟩'.repeat(Math.max(0, Math.floor(rep / 10))) + '⬛'.repeat(Math.max(0, 10 - Math.floor(rep / 10)));
        let statusDip = '⚖️ Neutro';
        let corEmbed = 0x3498db;
        let iconeStatus = '🌐';

        if (rep >= 75) { statusDip = 'Potência Diplomática'; corEmbed = 0x2ecc71; iconeStatus = '🟢'; }
        else if (rep >= 50) { statusDip = 'Relações Estáveis'; corEmbed = 0xf1c40f; iconeStatus = '🟡'; }
        else if (rep >= 30) { statusDip = 'Tensões Diplomáticas'; corEmbed = 0xe67e22; iconeStatus = '⚠️'; }
        else { statusDip = 'Isolamento Internacional'; corEmbed = 0xe74c3c; iconeStatus = '🚫'; }

        const listaEmbargos = embargos.length > 0 ? embargos.map((e) => `🚫 ${getNomeFormal(e)}`).join('\n') : '✅ Nenhum';
        const listaAliancas = aliancas.length > 0 ? aliancas.map((a) => `🤝 ${getNomeFormal(a)}`).join('\n') : 'Nenhuma aliança ativa';
        const listaRotas = rotas.length > 0 ? rotas.map((r) => `🚢 ${getNomeFormal(r.parceiro)}`).join('\n') : 'Nenhuma rota ativa';

        const embedText = new TextDisplayBuilder().setContent(
                `## 🏛️ Painel Diplomático — ${getNomeFormal(nomePais)}\n` +
                `### ${iconeStatus} Status: ${statusDip}\n` +
                `🌍 **Reputação Internacional:** ${rep}/100\n${barraReputacao}\n\n` +
                `• 📬 **Propostas Pendentes:** \`${pendentes.length}\` aguardando resposta\n` +
                `• 🤝 **Alianças Ativas:** \`${aliancas.length}\` | 🚢 **Rotas Ativas:** \`${rotas.length}\`\n\n` +
                `### ⚔️ Sanções & Embargos:\n${listaEmbargos}\n\n` +
                `### 🛡️ Alinhamentos Militares:\n${listaAliancas}\n\n` +
                `### 📊 Parceiros Comerciais:\n${listaRotas}\n\n` +
                `⚡ **Comandos de Ação:**\n` +
                `• \`B!painel-diplomatico propor <país> <tipo>\`\n` +
                `• \`B!painel-diplomatico aceitar <id>\`\n` +
                `• \`B!painel-diplomatico recusar <id>\``
        );

        const mainContainer = new ContainerBuilder()
                .setAccentColor(corEmbed)
                .addTextDisplayComponents(embedText);

        return message.channel.send({ components: [mainContainer], flags: MessageFlags.IsComponentsV2 });
};

function criarNavegacaoDiplomatica(nomePais, propostas) {
        const row = new ActionRowBuilder()
                .addComponents(
                        new ButtonBuilder()
                                .setCustomId(`rpg_diplomacia:atualizar:${nomePais}`)
                                .setLabel('Atualizar')
                                .setStyle(ButtonStyle.Primary),
                        new ButtonBuilder()
                                .setCustomId(`rpg_hub:diplomacia:${nomePais}`)
                                .setLabel('Voltar ao país')
                                .setStyle(ButtonStyle.Secondary)
                );
        const proposta = propostas[0];
        if (proposta) {
                row.addComponents(
                        new ButtonBuilder()
                                .setCustomId(`rpg_diplomacia:ver:${nomePais}:${proposta.id}`)
                                .setLabel('Ver proposta')
                                .setStyle(ButtonStyle.Success)
                );
        }
        return row;
}

function criarPainelInterativo(nomePais, pais, propostas) {
        const rep = Number(pais.reputacaoDiplomatica) || 50;
        const texto = new TextDisplayBuilder().setContent(
                `## 🏛️ Painel Diplomático\n**${getDadosPais(nomePais)?.nomeFormal || nomePais}**\n\n` +
                `🌍 Reputação: **${rep}/100**\n📬 Propostas pendentes: **${propostas.length}**\n` +
                `🤝 Alianças: **${(pais.aliancas || []).length}**\n🚢 Rotas: **${(pais.rotasComerciais || []).length}**\n\n` +
                'Use os controles abaixo para atualizar, voltar ao país ou abrir uma proposta.'
        );
        return new ContainerBuilder()
                .setAccentColor(rep >= 50 ? 0x2ecc71 : 0xe67e22)
                .addTextDisplayComponents(texto)
                .addActionRowComponents(criarNavegacaoDiplomatica(nomePais, propostas));
}

function renderizarDetalheProposta(nomePais, proposta) {
        const texto = new TextDisplayBuilder().setContent(
                `## 📜 Proposta Diplomática\n**${proposta.tipo}**\n\n` +
                `De: **${proposta.nomeRemetente || proposta.remetente}**\n` +
                `Para: **${proposta.nomeDestinatario || proposta.destinatario}**\n` +
                `ID: ${proposta.id}\n\n${proposta.termos?.descricao || 'Sem detalhes adicionais.'}`
        );
        const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`aceitar_${proposta.id}`).setLabel('Aceitar').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId(`recusar_${proposta.id}`).setLabel('Recusar').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId(`rpg_diplomacia:voltar:${nomePais}`).setLabel('Voltar').setStyle(ButtonStyle.Secondary)
        );
        return new ContainerBuilder().setAccentColor(0x3498db).addTextDisplayComponents(texto).addActionRowComponents(row);
}

module.exports.criarPainelInterativo = criarPainelInterativo;
module.exports.renderizarDetalheProposta = renderizarDetalheProposta;
