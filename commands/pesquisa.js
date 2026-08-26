const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

const TECNOLOGIAS = {
    militar_basico: {
        nome: 'Doutrina Militar Básica',
        ramo: 'militar',
        nivel: 1,
        custo_base: 50000,
        tempo_pesquisa: 3,
        pre_requisitos: [],
        bonus: { exercito_ataque: 1.05 },
        descricao: 'Treinamento militar padronizado e táticas básicas.',
        emoji: '⚔️'
    },
    militar_avancado: {
        nome: 'Doutrina Militar Avançada',
        ramo: 'militar',
        nivel: 2,
        custo_base: 200000,
        tempo_pesquisa: 5,
        pre_requisitos: ['militar_basico'],
        bonus: { exercito_ataque: 1.10 },
        descricao: 'Táticas modernas de guerra mecanizada.',
        emoji: '🎖️'
    },
    fisica_nuclear: {
        nome: 'Física Nuclear',
        ramo: 'nuclear',
        nivel: 1,
        custo_base: 100000,
        tempo_pesquisa: 5,
        pre_requisitos: [],
        bonus: { pesquisa_geral: 1.05 },
        descricao: 'Compreensão da fissão nuclear e radioatividade.',
        emoji: '⚛️'
    },
    enriquecimento_uranio: {
        nome: 'Enriquecimento de Urânio',
        ramo: 'nuclear',
        nivel: 2,
        custo_base: 300000,
        tempo_pesquisa: 8,
        pre_requisitos: ['fisica_nuclear'],
        bonus: { producao_nuclear: 1.20 },
        descricao: 'Capacidade de enriquecer urânio para armas.',
        emoji: '☢️'
    },
    ogivas_nucleares: {
        nome: 'Ogivas Nucleares',
        ramo: 'nuclear',
        nivel: 3,
        custo_base: 1000000,
        tempo_pesquisa: 12,
        pre_requisitos: ['enriquecimento_uranio'],
        bonus: { poder_nuclear: 1.30 },
        descricao: 'Produção de ogivas nucleares.',
        emoji: '💣'
    },
    inteligencia_basica: {
        nome: 'Serviço de Inteligência',
        ramo: 'espionagem',
        nivel: 1,
        custo_base: 75000,
        tempo_pesquisa: 4,
        pre_requisitos: [],
        bonus: { informacao: 1.10 },
        descricao: 'Criação da agência nacional de inteligência.',
        emoji: '🕵️'
    },
    exploracao_espacial: {
        nome: 'Programa Espacial',
        ramo: 'espacial',
        nivel: 1,
        custo_base: 200000,
        tempo_pesquisa: 6,
        pre_requisitos: ['fisica_nuclear'],
        bonus: { pesquisa_geral: 1.08 },
        descricao: 'Desenvolvimento de foguetes para o espaço.',
        emoji: '🚀'
    },
    industria_avancada: {
        nome: 'Indústria Avançada',
        ramo: 'economia',
        nivel: 1,
        custo_base: 80000,
        tempo_pesquisa: 4,
        pre_requisitos: [],
        bonus: { producao_industrial: 1.10 },
        descricao: 'Modernização do parque industrial.',
        emoji: '🏭'
    },
    revolucao_verde: {
        nome: 'Revolução Verde',
        ramo: 'agricultura',
        nivel: 1,
        custo_base: 50000,
        tempo_pesquisa: 3,
        pre_requisitos: [],
        bonus: { producao_comida: 1.15 },
        descricao: 'Novas técnicas agrícolas e fertilizantes.',
        emoji: '🌾'
    }
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send('❌ Você não possui um país!');

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send('❌ País não encontrado.');
    if (pais.governador !== userId) return message.channel.send('❌ Apenas o governador pode gerenciar pesquisas.');

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;

    const pesquisasConcluidas = pais.tecnologias || [];
    const pesquisaAtual = pais.pesquisaAtual || null;
    const laboratorios = Number(pais.construcoes?.laboratorio?.nivel || pais.construcoes?.laboratorio || 0);

    const subcmd = (args[0] || '').toLowerCase();

    // ================= ÁRVORE DE TECNOLOGIA =================
    if (!subcmd || subcmd === 'arvore' || subcmd === 'tree') {
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🌳 Árvore de Tecnologia — ${nomeFormal}`)
            .setColor('#3498db')
            .setDescription(
                `🔬 Laboratórios: **${laboratorios}**\n` +
                `📚 Tecnologias: **${pesquisasConcluidas.length}**\n` +
                (pesquisaAtual ? `🔍 Pesquisando: **${TECNOLOGIAS[pesquisaAtual.tecnologia]?.emoji || '📋'} ${TECNOLOGIAS[pesquisaAtual.tecnologia]?.nome || '?'}**` : '⏸️ Nenhuma pesquisa ativa')
            );

        const ramos = ['militar', 'nuclear', 'espionagem', 'espacial', 'economia', 'agricultura'];
        const nomesRamos = {
            militar: '⚔️ Ramo Militar',
            nuclear: '☢️ Ramo Nuclear',
            espionagem: '🕵️ Ramo Espionagem',
            espacial: '🚀 Ramo Espacial',
            economia: '💰 Ramo Econômico',
            agricultura: '🌾 Ramo Agrícola'
        };

        for (const ramo of ramos) {
            const tecsRamo = Object.entries(TECNOLOGIAS).filter(function(entry) {
                return entry[1].ramo === ramo;
            });
            
            if (tecsRamo.length === 0) continue;

            let texto = '';
            for (const entry of tecsRamo) {
                const key = entry[0];
                const tec = entry[1];
                const concluida = pesquisasConcluidas.includes(key);
                const disponivel = tec.pre_requisitos.every(function(req) {
                    return pesquisasConcluidas.includes(req);
                });
                const status = concluida ? '✅' : disponivel ? '🔓' : '🔒';
                
                texto += `${status} ${tec.emoji} **${tec.nome}** (Nv.${tec.nivel})\n`;
                texto += `┗ ${tec.descricao}\n`;
                if (!concluida && disponivel) {
                    texto += `┗ 💰 ${tec.custo_base.toLocaleString('pt-BR')} moedas | ⏱️ ${tec.tempo_pesquisa} ciclos\n`;
                    texto += `┗ Use: \`B!pesquisa iniciar ${key}\`\n`;
                }
                texto += '\n';
            }
            embed.addFields({ name: nomesRamos[ramo], value: texto || 'Nenhuma', inline: false });
        }

        embed.addFields({ name: '⚡ Comandos', value: '`B!pesquisa iniciar <id>` — Iniciar pesquisa\n' +
            '`B!pesquisa status` — Ver progresso\n' +
            '`B!pesquisa cancelar` — Cancelar pesquisa', inline: false });

        embed.setFooter({ text: 'Centro Nacional de Pesquisa • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= INICIAR PESQUISA =================
    if (subcmd === 'iniciar' || subcmd === 'start') {
        const tecId = (args[1] || '').toLowerCase();
        
        if (!tecId || !TECNOLOGIAS[tecId]) {
            return message.channel.send('❌ Tecnologia inválida. Use `B!pesquisa` para ver a árvore.');
        }

        if (pesquisaAtual) {
            const nomeAtual = TECNOLOGIAS[pesquisaAtual.tecnologia]?.nome || 'desconhecida';
            return message.channel.send(`❌ Você já está pesquisando **${nomeAtual}**. Cancele primeiro.`);
        }

        const tec = TECNOLOGIAS[tecId];
        
        if (pesquisasConcluidas.includes(tecId)) {
            return message.channel.send(`✅ Você já pesquisou **${tec.nome}**!`);
        }

        // Verificar pré-requisitos
        const faltam = tec.pre_requisitos.filter(function(req) {
            return !pesquisasConcluidas.includes(req);
        });
        
        if (faltam.length > 0) {
            const nomesFaltam = faltam.map(function(f) {
                return TECNOLOGIAS[f]?.nome || f;
            }).join(', ');
            return message.channel.send(`🔒 Pré-requisitos faltando: ${nomesFaltam}`);
        }

        // Calcular custo
        const inflacao = Number(pais.inflacao) || 0.05;
        const fatorInflacao = 1 + inflacao * 10;
        const fatorLaboratorio = Math.max(0.5, 1 - laboratorios * 0.05);
        const custoFinal = Math.floor(tec.custo_base * fatorInflacao * fatorLaboratorio);

        const tesouro = Number(pais.tesouro) || 0;
        if (tesouro < custoFinal) {
            return message.channel.send(`❌ Tesouro insuficiente! Custo: ${custoFinal.toLocaleString('pt-BR')} moedas.`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, custoFinal);
        db.set(`pais_${nomePais}.pesquisaAtual`, {
            tecnologia: tecId,
            inicio: Date.now(),
            progresso: 0,
            total: tec.tempo_pesquisa
        });

        return message.channel.send(
            `${tec.emoji} **Pesquisa Iniciada: ${tec.nome}**\n\n` +
            `💰 Custo: ${custoFinal.toLocaleString('pt-BR')} moedas\n` +
            `⏱️ Tempo: ${tec.tempo_pesquisa} ciclos\n` +
            `🔬 Velocidade: ${(1 + laboratorios * 0.1).toFixed(1)}x\n` +
            `📊 Inflação: +${((fatorInflacao - 1) * 100).toFixed(0)}% custo`
        );
    }

    // ================= STATUS =================
    if (subcmd === 'status') {
        if (!pesquisaAtual) {
            return message.channel.send('⏸️ Nenhuma pesquisa em andamento. Use `B!pesquisa` para ver a árvore.');
        }

        const tec = TECNOLOGIAS[pesquisaAtual.tecnologia];
        if (!tec) return message.channel.send('❌ Erro: tecnologia não encontrada.');

        const progresso = pesquisaAtual.progresso || 0;
        const total = pesquisaAtual.total;
        const barra = '🟦'.repeat(Math.floor(progresso)) + '⬜'.repeat(Math.max(0, total - Math.floor(progresso)));
        const porcentagem = Math.floor((progresso / total) * 100);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${tec.emoji} Pesquisa em Andamento`)
            .setColor('#3498db')
            .setDescription(`**${tec.nome}**`)
            .addFields({ name: '📊 Progresso', value: `${barra} ${porcentagem}%`, inline: false })
            .addFields({ name: '⏱️ Ciclos', value: `${Math.floor(progresso)}/${total}`, inline: true })
            .addFields({ name: '🔬 Laboratórios', value: `${laboratorios}`, inline: true })
            .addFields({ name: '📋 Descrição', value: tec.descricao, inline: false })
            .setFooter({ text: 'Centro Nacional de Pesquisa • OneBot' });

        return message.channel.send({ embeds: [embed] });
    }

    // ================= CANCELAR =================
    if (subcmd === 'cancelar') {
        if (!pesquisaAtual) {
            return message.channel.send('❌ Nenhuma pesquisa para cancelar.');
        }

        const tec = TECNOLOGIAS[pesquisaAtual.tecnologia];
        const reembolso = Math.floor((tec?.custo_base || 50000) * 0.3);
        db.add(`pais_${nomePais}.tesouro`, reembolso);
        db.delete(`pais_${nomePais}.pesquisaAtual`);

        return message.channel.send(
            `❌ Pesquisa cancelada.\n` +
            `💰 Reembolso: ${reembolso.toLocaleString('pt-BR')} moedas (30%)`
        );
    }

    return message.channel.send('❌ Comando inválido. Use `B!pesquisa` para ver a árvore de tecnologia.');
};

exports.TECNOLOGIAS = TECNOLOGIAS;