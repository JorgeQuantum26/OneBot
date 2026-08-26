const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

// 🦠 DOENÇAS E EVENTOS DE SAÚDE
const DOENCAS = {
    gripe_comum: { nome: 'Gripe Comum', emoji: '🤧', mortalidade: 0.0001, contagio: 0.3, duracao: 3, gravidade: 'leve' },
    dengue: { nome: 'Dengue', emoji: '🦟', mortalidade: 0.001, contagio: 0.15, duracao: 7, gravidade: 'media' },
    colera: { nome: 'Cólera', emoji: '💧', mortalidade: 0.01, contagio: 0.2, duracao: 5, gravidade: 'grave', requer: 'saneamento_basico' },
    tuberculose: { nome: 'Tuberculose', emoji: '🫁', mortalidade: 0.02, contagio: 0.1, duracao: 30, gravidade: 'grave' },
    malaria: { nome: 'Malária', emoji: '🦟', mortalidade: 0.015, contagio: 0.12, duracao: 14, gravidade: 'grave' },
    covid_variante: { nome: 'Nova Variante Viral', emoji: '🦠', mortalidade: 0.005, contagio: 0.4, duracao: 14, gravidade: 'pandemica' },
    peste: { nome: 'Peste Bubônica', emoji: '🐀', mortalidade: 0.05, contagio: 0.08, duracao: 21, gravidade: 'catastrofica' },
    Ebola: { nome: 'Febre Hemorrágica', emoji: '🩸', mortalidade: 0.5, contagio: 0.05, duracao: 21, gravidade: 'catastrofica' },
};

// 💉 PROGRAMAS DE SAÚDE
const PROGRAMAS_SAUDE = {
    saneamento_basico: { nome: 'Saneamento Básico', emoji: '🚰', custo: 50000000, efeito: 'Reduz doenças hídricas em 80%', previne: ['colera', 'dengue'] },
    vacinacao_massiva: { nome: 'Vacinação em Massa', emoji: '💉', custo: 30000000, efeito: 'Imuniza 60% da população', previne: ['gripe_comum', 'covid_variante', 'tuberculose'] },
    controle_pragas: { nome: 'Controle de Pragas', emoji: '🐀', custo: 20000000, efeito: 'Reduz vetores de doenças', previne: ['malaria', 'dengue', 'peste'] },
    hospitais_campanha: { nome: 'Hospitais de Campanha', emoji: '🏕️', custo: 40000000, efeito: '+5000 leitos temporários', leitos_extra: 5000 },
    quarentena_obrigatoria: { nome: 'Quarentena Obrigatória', emoji: '🔒', custo: 10000000, efeito: 'Reduz contágio em 50%', reduz_contagio: 0.5 },
    pesquisa_vacina: { nome: 'Pesquisa de Vacina', emoji: '🔬', custo: 100000000, efeito: 'Desenvolve vacina em 5 ciclos', pesquisa: true },
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send('❌ Você não possui um país!');

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send('❌ País não encontrado.');
    if (pais.governador !== userId) return message.channel.send('❌ Apenas o governador pode gerenciar a saúde.');

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;

    const subcmd = (args[0] || '').toLowerCase();

    // ================= PAINEL DE SAÚDE =================
    if (!subcmd || subcmd === 'painel' || subcmd === 'status') {
        const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
        const capacidadeTotal = hospitais * 1000;
        const feridos = pais.feridos_acidente || 0;
        const doentes = pais.doentes_ativos || 0;
        const ocupacao = pais.ocupacao_hospitalar || 0;
        const programasAtivos = pais.programas_saude || [];
        const epidemiaAtiva = pais.epidemia_ativa || null;
        
        // Mortalidade infantil e expectativa de vida
        const infraestrutura = pais.infraestrutura || 0;
        const expectativaVida = Math.floor(55 + infraestrutura * 5 + (hospitais > 0 ? 10 : 0));
        const mortalidadeInfantil = Math.max(1, 50 - infraestrutura * 5 - (hospitais > 0 ? 10 : 0));
        
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🏥 Ministério da Saúde — ${nomeFormal}`)
            .setColor(epidemiaAtiva ? 0xFF0000 : ocupacao > 80 ? 0xFFA500 : 0x00FF00)
            .setDescription(
                `📊 **Status Geral:** ${epidemiaAtiva ? '🚨 EPIDEMIA ATIVA!' : ocupacao > 80 ? '⚠️ Sobrecarga' : '✅ Estável'}\n` +
                `🦠 Doenças ativas: **${doentes.toLocaleString('pt-BR')}**`
            )
            .addFields({ name: '🏥 Infraestrutura', value: `🏥 Hospitais: **${hospitais}** (${capacidadeTotal.toLocaleString('pt-BR')} leitos)\n` +
                `📊 Ocupação: **${ocupacao.toFixed(1)}%**\n` +
                `🤕 Feridos: **${feridos.toLocaleString('pt-BR')}**\n` +
                `💰 Custo: **${(hospitais * 50000).toLocaleString('pt-BR')}**/ciclo`, inline: true })
            .addFields({ name: '👥 População', value: `👶 Mort. Infantil: **${mortalidadeInfantil}/1000**\n` +
                `📅 Expect. Vida: **${expectativaVida} anos**\n` +
                `💀 Óbitos/ciclo: **${Math.floor(pais.obitos_ciclo || 0).toLocaleString('pt-BR')}**`, inline: true })
            .addFields({ name: '💉 Programas Ativos', value: programasAtivos.length > 0 
                    ? programasAtivos.map(p => `${PROGRAMAS_SAUDE[p]?.emoji || '📋'} ${PROGRAMAS_SAUDE[p]?.nome || p}`).join('\n')
                    : 'Nenhum programa ativo', inline: true });

        if (epidemiaAtiva) {
            const doenca = DOENCAS[epidemiaAtiva.doenca];
            embed.addFields({ name: '🚨 EPIDEMIA ATIVA!', value: `${doenca?.emoji || '🦠'} **${doenca?.nome || epidemiaAtiva.doenca}**\n` +
                `💀 Mortalidade: **${(doenca?.mortalidade * 100).toFixed(1)}%**\n` +
                `🔬 Contágio: **${(doenca?.contagio * 100).toFixed(0)}%**\n` +
                `⏱️ Duração: **${doenca?.duracao} ciclos**\n` +
                `🤒 Infectados: **${(epidemiaAtiva.infectados || 0).toLocaleString('pt-BR')}**`, inline: false });
        }

        embed.addFields({ name: '⚡ Comandos', value: '`B!saude programa <tipo>` — Iniciar programa de saúde\n' +
            '`B!saude programas` — Ver programas disponíveis\n' +
            '`B!saude vacinar` — Campanha de vacinação\n' +
            '`B!saude quarentena` — Decretar quarentena\n' +
            '`B!saude abrir` — Encerrar quarentena', inline: false });

        embed.setFooter({ text: 'Ministério da Saúde • OneBot' });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= VER PROGRAMAS =================
    if (subcmd === 'programas') {
        const embed = new Discord.EmbedBuilder()
            .setTitle('💉 Programas de Saúde Disponíveis')
            .setColor('#3498db')
            .setDescription('Invista na saúde pública para prevenir doenças e epidemias.');

        for (const [key, prog] of Object.entries(PROGRAMAS_SAUDE)) {
            const ativo = (pais.programas_saude || []).includes(key);
            embed.addFields({ name: `${prog.emoji} ${prog.nome} ${ativo ? '✅' : ''}`, value: `📋 ${prog.efeito}\n` +
                `💰 Custo: **${prog.custo.toLocaleString('pt-BR')}** moedas\n` +
                `🛡️ Previne: ${prog.previne ? prog.previne.map(d => DOENCAS[d]?.nome || d).join(', ') : 'N/A'}\n` +
                `Use: \`B!saude programa ${key}\``, inline: false });
        }

        return message.channel.send({ embeds: [embed] });
    }

    // ================= INICIAR PROGRAMA =================
    if (subcmd === 'programa') {
        const programa = args[1]?.toLowerCase();
        if (!programa || !PROGRAMAS_SAUDE[programa]) {
            return message.channel.send('❌ Programa inválido! Use `B!saude programas` para ver opções.');
        }

        const prog = PROGRAMAS_SAUDE[programa];
        const programasAtivos = pais.programas_saude || [];
        
        if (programasAtivos.includes(programa)) {
            return message.channel.send('❌ Este programa já está ativo!');
        }

        const inflacao = Number(pais.inflacao) || 0.05;
        const custoFinal = Math.floor(prog.custo * (1 + inflacao * 5));
        const tesouro = Number(pais.tesouro) || 0;

        if (tesouro < custoFinal) {
            return message.channel.send(`❌ Tesouro insuficiente! Custo: ${custoFinal.toLocaleString('pt-BR')} moedas.`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, custoFinal);
        programasAtivos.push(programa);
        db.set(`pais_${nomePais}.programas_saude`, programasAtivos);
        db.add(`pais_${nomePais}.aprovacaoPopular`, 5);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${prog.emoji} Programa de Saúde Iniciado!`)
            .setColor('#2ecc71')
            .setDescription(`**${prog.nome}** foi implementado em ${nomeFormal}.`)
            .addFields({ name: '💰 Custo', value: `${custoFinal.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🛡️ Efeito', value: prog.efeito, inline: true })
            .addFields({ name: '😊 Aprovação', value: '+5%', inline: true })
            .setFooter({ text: 'Ministério da Saúde • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

        // ================= CAMPANHA DE VACINAÇÃO =================
    if (subcmd === 'vacinar') {
        const programasAtivos = pais.programas_saude || [];
        
        if (!programasAtivos.includes('vacinacao_massiva')) {
            return message.channel.send('❌ Você precisa iniciar o programa **Vacinação em Massa** primeiro!\nUse: `B!saude programa vacinacao_massiva`');
        }

        const custo = Math.floor(20000000 * (1 + (pais.inflacao || 0.05) * 5));
        const tesouro = Number(pais.tesouro) || 0;

        if (tesouro < custo) {
            return message.channel.send(`❌ Tesouro insuficiente! Custo: ${custo.toLocaleString('pt-BR')} moedas.`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, custo);
        db.add(`pais_${nomePais}.vacinados`, Math.floor((pais.populacao || 0) * 0.6));
        db.add(`pais_${nomePais}.aprovacaoPopular`, 8);

        const embed = new Discord.EmbedBuilder()
            .setTitle('💉 Campanha de Vacinação em Massa!')
            .setColor('#2ecc71')
            .setDescription(`Milhões de cidadãos de **${nomeFormal}** foram vacinados!`)
            .addFields({ name: '👥 Vacinados', value: Math.floor((pais.populacao || 0) * 0.6).toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💰 Custo', value: custo.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '😊 Aprovação', value: '+8%', inline: true })
            .addFields({ name: '🛡️ Proteção', value: 'Contra: Gripe, Variantes Virais, Tuberculose', inline: false })
            .setFooter({ text: 'Ministério da Saúde • OneBot' })
            .setTimestamp();

        // Notícia
        const noticia = {
            titulo: '💉 Vacinação em Massa Realizada!',
            descricao: `**${nomeFormal}** vacinou **${Math.floor((pais.populacao || 0) * 0.6).toLocaleString('pt-BR')}** cidadãos contra doenças infecciosas!`,
            tipo: 'social', impacto: 'positivo', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

        return message.channel.send({ embeds: [embed] });
    }

    // ================= DECRETAR QUARENTENA =================
    if (subcmd === 'quarentena') {
        const epidemiaAtiva = pais.epidemia_ativa;
        
        if (!epidemiaAtiva) {
            return message.channel.send('❌ Não há epidemia ativa para decretar quarentena!');
        }

        const programasAtivos = pais.programas_saude || [];
        
        if (programasAtivos.includes('quarentena_obrigatoria')) {
            return message.channel.send('❌ Quarentena já está em vigor!');
        }

        const custo = Math.floor(10000000 * (1 + (pais.inflacao || 0.05) * 5));
        const tesouro = Number(pais.tesouro) || 0;

        if (tesouro < custo) {
            return message.channel.send(`❌ Tesouro insuficiente! Custo: ${custo.toLocaleString('pt-BR')} moedas.`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, custo);
        programasAtivos.push('quarentena_obrigatoria');
        db.set(`pais_${nomePais}.programas_saude`, programasAtivos);
        db.add(`pais_${nomePais}.aprovacaoPopular`, 3);
        db.subtract(`pais_${nomePais}.produtividade`, 0.05); // Economia desacelera

        const embed = new Discord.EmbedBuilder()
            .setTitle('🔒 Quarentena Obrigatória Decretada!')
            .setColor('#e67e22')
            .setDescription(`**${nomeFormal}** decretou quarentena obrigatória para combater a epidemia!`)
            .addFields({ name: '🦠 Efeito', value: 'Reduz contágio em 50%', inline: true })
            .addFields({ name: '💰 Custo', value: custo.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '😊 Aprovação', value: '+3%', inline: true })
            .addFields({ name: '⚠️ Efeito Colateral', value: 'Produtividade -5% (economia desacelera)', inline: false })
            .addFields({ name: '📋 Regras', value: '🏠 Fique em casa\n' +
                '😷 Uso obrigatório de máscara\n' +
                '🚫 Aglomerações proibidas\n' +
                '🏥 Apenas serviços essenciais', inline: false })
            .setFooter({ text: 'Ministério da Saúde • OneBot' })
            .setTimestamp();

        // Notícia
        const noticia = {
            titulo: '🔒 Quarentena Decretada!',
            descricao: `**${nomeFormal}** decretou quarentena obrigatória! Contágio reduzido em 50%.`,
            tipo: 'social', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

        return message.channel.send({ embeds: [embed] });
    }

    //Adicione no saude.js:
if (subcmd === 'fim-quarentena' || subcmd === 'abrir') {
    const programas = pais.programas_saude || [];
    if (!programas.includes('quarentena_obrigatoria')) {
        return message.channel.send('❌ Não há quarentena ativa!');
    }
    const novos = programas.filter(p => p !== 'quarentena_obrigatoria');
    db.set(`pais_${nomePais}.programas_saude`, novos);
    db.add(`pais_${nomePais}.produtividade`, 0.05);
    return message.channel.send('🔓 **Quarentena encerrada!** Economia reaberta! +5% produtividade.');
}
    
    return message.channel.send('❌ Comando inválido. Use `B!saude` para ver o painel.');
}