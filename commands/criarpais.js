const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { NOMES_PAISES, getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = args[0] ? args[0].toLowerCase() : null;

    if (!nomePais) {
        return message.channel.send(
            `<:recusado:1031262539272687777>**|** Informe o nome do país!\n\n` +
            `**Como usar:**\n` +
            `\`B!criarpais <nome-do-país>\` — Assume um país real existente (controlado por IA)\n` +
            `\`B!criarpais <nome-personalizado>\` — Cria um país totalmente novo\n\n` +
            `**Países reais disponíveis:** Use \`B!lista-paises\` para ver todos.`
        );
    }

    let jaTemPais = (db.get(`${userId}.pais`) || '').toLowerCase() || null;
    if (jaTemPais) {
        const paisAtual = db.get(`pais_${jaTemPais}`);
        if (!paisAtual || paisAtual.governador !== userId) {
            db.delete(`${userId}.pais`);
            jaTemPais = null;
        }
    }
    if (jaTemPais) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Você já governa **${jaTemPais}**! Use \`B!abandonar-pais\` antes de assumir outro.`);
    }

    const dadosReais = getDadosPais(nomePais);
    const paisExistente = db.get(`pais_${nomePais}`);
    const umMes = 30 * 24 * 60 * 60 * 1000;
    const mandatoExpira = Date.now() + umMes;

    // ⚡ SCHEMA BASE COMPLETO (usado em ambos os casos)
    const schemaBase = {
        governador: userId,
        isNPC: false,
        mandatoExpiraEm: mandatoExpira,
        
        // 🏗️ CONSTRUÇÕES (TODOS os tipos)
        construcoes: {
            quartel: 0,
            base_aerea: 0,
            porto_militar: 0,
            industria: 0,
            fazenda: 0,
            usina: 0,
            laboratorio: 0,
            mina: 0,
            banco: 0,
            universidade: 0,
            hospital: 0,
            ferrovia: 0,
            porto: 0,
            aeroporto: 0
        },
        
        // ⛏️ MINERAÇÃO
        mineracao: {
            nivel: 1,
            eficiencia: 1.0,
            investimento: 0
        },
        
        // 👥 Cidadania
        cidadaos: [],
        funcionarios: [],
        funcionariosIA: [],
        
        // 🏛️ Governo
        ministerios: {},
        parlamentoPendente: 0,
        leisAprovadas: [],
        leisVetadas: [],
        
        // 📊 Economia
        gastos: 0,
        receita: 0,
        lucroImpostos: 0,
        exportacoes: 0,
        importacoes: 0,
        taxaCrescimentoEconomico: 0.02,
        historicoCambio: [],
        
        // 🌍 Diplomacia
        rotasComerciais: [],
        embargos: [],
        sancoes: [],
        aliancas: [],
        reputacaoDiplomatica: 50,
        historicoDiplomatico: [],
        
        // ⚔️ Militar
        exercito: {
            infantaria: 0,
            tanques: 0,
            avioes: 0,
            navios: 0,
            manutencao: 0
        },
        bombasNucleares: 0,
        
        // 👍 Popularidade
        aprovacaoPopular: 50,
        produtividade: 1.0,
    };

    // ================= PAÍS EXISTENTE (NPC) =================
    if (paisExistente) {
        if (!paisExistente.isNPC) {
            return message.channel.send(`<:recusado:1031262539272687777>**|** O país **${nomePais}** já está sob controle de outro jogador!`);
        }

        // ⚡ ATUALIZAR dados mantendo estruturas existentes
        db.set(`pais_${nomePais}.governador`, userId);
        db.set(`pais_${nomePais}.isNPC`, false);
        db.set(`pais_${nomePais}.mandatoExpiraEm`, mandatoExpira);
        
        // ⚡ GARANTIR que estruturas essenciais existem
        if (!paisExistente.construcoes) {
            db.set(`pais_${nomePais}.construcoes`, schemaBase.construcoes);
        }
        if (!paisExistente.mineracao) {
            db.set(`pais_${nomePais}.mineracao`, schemaBase.mineracao);
        }
        if (!paisExistente.exercito || typeof paisExistente.exercito !== 'object') {
            db.set(`pais_${nomePais}.exercito`, schemaBase.exercito);
        }
        if (!paisExistente.aliancas) {
            db.set(`pais_${nomePais}.aliancas`, []);
        }
        if (!paisExistente.reputacaoDiplomatica) {
            db.set(`pais_${nomePais}.reputacaoDiplomatica`, 50);
        }
        if (!paisExistente.historicoDiplomatico) {
            db.set(`pais_${nomePais}.historicoDiplomatico`, []);
        }
        if (!paisExistente.aprovacaoPopular) {
            db.set(`pais_${nomePais}.aprovacaoPopular`, 50);
        }
        if (!paisExistente.produtividade) {
            db.set(`pais_${nomePais}.produtividade`, 1.0);
        }
        
        db.set(`${userId}.pais`, nomePais);

        const dados = dadosReais || paisExistente;
        const paisAtualizado = db.get(`pais_${nomePais}`);

        const noticia = {
            titulo: `🏴 Novo Governador em ${nomePais}`,
            descricao: `**${message.author.tag}** assumiu o controle de **${dados.bandeira || '🏳️'} ${dados.nomeFormal || nomePais}**! O país anteriormente era governado por IA.`,
            tipo: 'governo', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomePais, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`${dados.bandeira || '🏳️'} Posse Assumida — ${dados.nomeFormal || nomePais}`)
            .setDescription(
                `<:aceitado:1031262771326759002> **${message.author.tag}** assumiu o governo de **${dados.nomeFormal || nomePais}**!\n` +
                `Você herda toda a estrutura econômica e militar do país controlado por IA.`
            )
            .addFields({ name: '💰 Tesouro', value: `${(paisAtualizado.tesouro || 0).toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '👥 População', value: `${(paisAtualizado.populacao || 0).toLocaleString('pt-BR')} hab.`, inline: true })
            .addFields({ name: '🏗️ Infraestrutura', value: `Nível ${paisAtualizado.infraestrutura || 0}/5`, inline: true })
            .addFields({ name: '💱 Moeda', value: `${paisAtualizado.moeda || 'Moeda local'} (${paisAtualizado.simboloMoeda || '?'})`, inline: true })
            .addFields({ name: '💣 Arsenal Nuclear', value: `${paisAtualizado.bombasNucleares || 0} unidades`, inline: true })
            .addFields({ name: '⚔️ Exército Total', value: `${((paisAtualizado.exercito?.infantaria || 0) + (paisAtualizado.exercito?.tanques || 0) + (paisAtualizado.exercito?.avioes || 0) + (paisAtualizado.exercito?.navios || 0)).toLocaleString('pt-BR')} tropas`, inline: true })
            .addFields({ name: '🤝 Alianças', value: `${(paisAtualizado.aliancas || []).length} aliança(s)`, inline: true })
            .addFields({ name: '🚢 Rotas Comerciais', value: `${(paisAtualizado.rotasComerciais || []).length} rota(s)`, inline: true })
            .addFields({ name: '📅 Mandato até', value: new Date(mandatoExpira).toLocaleDateString('pt-BR'), inline: true })
            .setFooter({ text: 'Use B!ajuda {rpg} para ver todos os comandos disponíveis' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= PAÍS REAL (NOVO) =================
    if (dadosReais) {
        const dadosPais = {
            ...schemaBase,
            
            // Dados do país real
            nomeFormal: dadosReais.nomeFormal,
            bandeira: dadosReais.bandeira,
            moeda: dadosReais.moeda,
            simboloMoeda: dadosReais.simbolo,
            valorMoeda: dadosReais.valorMoeda,
            personalidade: dadosReais.personalidade,
            
            // Economia
            tesouro: dadosReais.tesouro,
            tesouroNacional: Math.floor(dadosReais.tesouro * 0.3),
            populacao: dadosReais.populacao,
            infraestrutura: dadosReais.infraestrutura,
            agricultura: dadosReais.agricultura,
            ouro: dadosReais.ouro,
            comida: dadosReais.comida,
            madeira: dadosReais.madeira,
            pedra: dadosReais.pedra,
            pib: dadosReais.tesouro * 2,
            inflacao: dadosReais.inflacao,
            taxaImposto: dadosReais.taxaImposto,
            
            // Arsenal
            bombasNucleares: dadosReais.bombasNucleares,
            
            // Histórico
            historicoCambio: [dadosReais.valorMoeda],
        };
        
        db.set(`pais_${nomePais}`, dadosPais);
        db.set(`${userId}.pais`, nomePais);
        
        const lista = db.get('lista_paises') || [];
        if (!lista.includes(nomePais)) {
            lista.push(nomePais);
            db.set('lista_paises', lista);
        }

        const embed = new Discord.EmbedBuilder()
            .setColor('#2ecc71')
            .setTitle(`${dadosReais.bandeira} ${dadosReais.nomeFormal} — Fundado!`)
            .setDescription(`<:aceitado:1031262771326759002> **${message.author.tag}** assumiu o governo de **${dadosReais.nomeFormal}**!`)
            .addFields({ name: '💰 Tesouro', value: `${dadosReais.tesouro.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '👥 População', value: `${dadosReais.populacao.toLocaleString('pt-BR')} hab.`, inline: true })
            .addFields({ name: '💣 Arsenal Nuclear', value: `${dadosReais.bombasNucleares} unidades`, inline: true })
            .addFields({ name: '💱 Moeda', value: `${dadosReais.moeda} (${dadosReais.simbolo})`, inline: true })
            .addFields({ name: '📊 Inflação Atual', value: `${(dadosReais.inflacao * 100).toFixed(1)}%`, inline: true })
            .addFields({ name: '🏗️ Infraestrutura', value: `Nível ${dadosReais.infraestrutura}/5`, inline: true })
            .addFields({ name: '⚔️ Exército Inicial', value: '0 tropas (recrute com B!exercito)', inline: true })
            .addFields({ name: '📅 Mandato até', value: new Date(mandatoExpira).toLocaleDateString('pt-BR'), inline: true })
            .setFooter({ text: 'Use B!ajuda {rpg} para ver todos os comandos disponíveis' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= PAÍS PERSONALIZADO =================
    const nomePaisTrim = args.join(' ').toLowerCase();
    const nomeFormalPersonalizado = args.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(' ');
    
    const dadosPaisPersonalizado = {
        ...schemaBase,
        
        nomeFormal: nomeFormalPersonalizado,
        bandeira: '🏳️',
        moeda: 'Moeda Nacional',
        simboloMoeda: 'MN',
        valorMoeda: 0.50,
        personalidade: 'equilibrado',
        
        tesouro: 5000,
        tesouroNacional: 1000,
        populacao: 100000,
        infraestrutura: 1,
        agricultura: 500,
        ouro: 200,
        comida: 500,
        madeira: 300,
        pedra: 300,
        pib: 10000,
        inflacao: 0.10,
        taxaImposto: 0.10,
        taxaCrescimentoEconomico: 0.01,
        
        historicoCambio: [0.50],
    };
    
    db.set(`pais_${nomePaisTrim}`, dadosPaisPersonalizado);
    db.set(`${userId}.pais`, nomePaisTrim);
    
    const lista = db.get('lista_paises') || [];
    if (!lista.includes(nomePaisTrim)) {
        lista.push(nomePaisTrim);
        db.set('lista_paises', lista);
    }

    const embed = new Discord.EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle(`🏳️ País Personalizado Criado!`)
        .setDescription(`<:aceitado:1031262771326759002> **${message.author.tag}** fundou **${nomeFormalPersonalizado}**! Você é o primeiro governador!`)
        .addFields({ name: '💰 Tesouro Inicial', value: '5.000 moedas', inline: true })
        .addFields({ name: '👥 População', value: '100.000 hab.', inline: true })
        .addFields({ name: '🏗️ Infraestrutura', value: 'Nível 1/5', inline: true })
        .addFields({ name: '🌾 Agricultura', value: '500', inline: true })
        .addFields({ name: '💱 Moeda', value: 'Moeda Nacional (MN)', inline: true })
        .addFields({ name: '📊 Inflação', value: '10.0%', inline: true })
        .addFields({ name: '⚔️ Exército', value: '0 tropas (recrute com B!exercito)', inline: true })
        .addFields({ name: '📅 Mandato até', value: new Date(mandatoExpira).toLocaleDateString('pt-BR'), inline: true })
        .setFooter({ text: 'País personalizado — construa do zero! Use B!ajuda {rpg}' })
        .setTimestamp();
    
    return message.channel.send({ embeds: [embed] });
};