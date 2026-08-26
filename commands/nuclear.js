const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');
const { reduzirPopulacao } = require('../systems/pais-mutacoes');

const NUCLEAR_DATA = {
    uranio_por_ogiva: 100,
    uranio_por_usina: 500,
    tempo_enriquecimento: 3,
    custo_enriquecimento: 500000,

    ogiva_base: {
        nome: 'Ogiva de Fissão (Tipo A)',
        poder: 1,
        custo_uranio: 100,
        custo_dinheiro: 5000000,
        tempo_producao: 5,
        tecnologia_necessaria: 'fisica_nuclear'
    },
    ogiva_avancada: {
        nome: 'Ogiva Termonuclear (Tipo B)',
        poder: 10,
        custo_uranio: 500,
        custo_dinheiro: 20000000,
        tempo_producao: 10,
        tecnologia_necessaria: 'enriquecimento_uranio'
    },
    ogiva_hidrogenio: {
        nome: 'Bomba de Hidrogênio (Tipo C)',
        poder: 100,
        custo_uranio: 2000,
        custo_dinheiro: 100000000,
        tempo_producao: 20,
        tecnologia_necessaria: 'ogivas_nucleares'
    },
    missil_icbm: {
        nome: 'Míssil ICBM',
        poder: 50,
        custo_uranio: 1000,
        custo_dinheiro: 50000000,
        tempo_producao: 15,
        tecnologia_necessaria: 'ogivas_nucleares'
    },

    usina_nuclear: {
        nome: 'Usina Nuclear',
        custo_uranio: 500,
        custo_dinheiro: 100000000,
        tempo_construcao: 8,
        producao_energia: 500,
        reducao_custos: 0.1,
        tecnologia_necessaria: 'fisica_nuclear'
    },

    chance_acidente: 0.001,
    chance_vazamento: 0.0005,
    custo_limpeza: 50000000,
    dano_reputacao: 30,
    dano_populacao: 0.05
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send('❌ Você não possui um país!');

    let pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send('❌ País não encontrado.');
    if (pais.governador !== userId)
        return message.channel.send('❌ Apenas o governador pode gerenciar o programa nuclear.');

    // Inicializar dados
    if (pais.bombasNucleares > 0 && !pais.arsenal_nuclear) {
        db.set(`pais_${nomePais}.arsenal_nuclear`, {
            ogiva_base: pais.bombasNucleares || 0,
            ogiva_avancada: 0,
            ogiva_hidrogenio: 0,
            missil_icbm: 0
        });
        db.set(`pais_${nomePais}.bombasNucleares`, 0);
    }
    if (!pais.arsenal_nuclear) {
        db.set(`pais_${nomePais}.arsenal_nuclear`, {
            ogiva_base: 0,
            ogiva_avancada: 0,
            ogiva_hidrogenio: 0,
            missil_icbm: 0
        });
    }
    if (pais.funcionarios_nucleares === undefined) db.set(`pais_${nomePais}.funcionarios_nucleares`, 0);
    if (pais.protocolos_seguranca === undefined) db.set(`pais_${nomePais}.protocolos_seguranca`, 0);
    if (pais.treinamento_nuclear === undefined) db.set(`pais_${nomePais}.treinamento_nuclear`, 0);
    pais = db.get(`pais_${nomePais}`) || pais;

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;

    const tecnologias = pais.tecnologias || [];
    const temFisicaNuclear = tecnologias.includes('fisica_nuclear');
    const temEnriquecimento = tecnologias.includes('enriquecimento_uranio');
    const temOgivas = tecnologias.includes('ogivas_nucleares');

    if (!temFisicaNuclear) {
        const embed = new Discord.EmbedBuilder()
            .setTitle('🔒 Acesso Restrito')
            .setColor('#e74c3c')
            .setDescription('Você precisa pesquisar **Física Nuclear** primeiro!')
            .addFields({ name: '🔬 Como desbloquear', value: '`B!pesquisa iniciar fisica_nuclear`', inline: false })
            .setFooter({ text: 'Autoridade Nacional de Energia Nuclear • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    const subcmd = (args[0] || '').toLowerCase();
    const inflacao = Number(pais.inflacao) || 0.05;
    const fatorInflacao = 1 + inflacao * 5;

    // ================= PAINEL NUCLEAR =================
    if (!subcmd || subcmd === 'painel' || subcmd === 'status') {
        const paisAtual = db.get(`pais_${nomePais}`);
        const uranioBruto = Number(paisAtual.uranio) || 0;
        const uranioEnriquecido = Number(paisAtual.uranio_enriquecido) || 0;
        const arsenal = paisAtual.arsenal_nuclear || {
            ogiva_base: 0,
            ogiva_avancada: 0,
            ogiva_hidrogenio: 0,
            missil_icbm: 0
        };
        const ogivaBase = Number(arsenal.ogiva_base) || 0;
        const ogivaAvancada = Number(arsenal.ogiva_avancada) || 0;
        const ogivaHidrogenio = Number(arsenal.ogiva_hidrogenio) || 0;
        const ogivaICBM = Number(arsenal.missil_icbm) || 0;
        const ogivasTotal = ogivaBase + ogivaAvancada + ogivaHidrogenio + ogivaICBM;
        const poderTotal = ogivaBase * 1 + ogivaAvancada * 10 + ogivaHidrogenio * 100 + ogivaICBM * 50;
        const usinasNucleares = Number(
            paisAtual.construcoes?.usina_nuclear?.nivel || paisAtual.construcoes?.usina_nuclear || 0
        );
        const enriquecendo = paisAtual.enriquecendo_uranio || null;
        const produzindo = paisAtual.produzindo_ogiva || null;
        const funcionarios = paisAtual.funcionarios_nucleares || 0;
        const funcionariosNecessarios = usinasNucleares * 500;
        const protocolos = paisAtual.protocolos_seguranca || 0;
        const treinamento = paisAtual.treinamento_nuclear || 0;

        let statusAIEA;
        if (ogivasTotal > 50) statusAIEA = '🚨 Sob Vigilância Máxima';
        else if (ogivasTotal > 10) statusAIEA = '⚠️ Monitorado pela AIEA';
        else if (ogivasTotal > 0) statusAIEA = '📋 Inspeções Regulares';
        else statusAIEA = '✅ Programa Pacífico';

        const embed = new Discord.EmbedBuilder()
            .setTitle(`☢️ Programa Nuclear — ${nomeFormal}`)
            .setColor('#992d22')
            .setDescription(
                `**Status:** ${temOgivas ? '✅ Potência Nuclear' : temEnriquecimento ? '⚠️ Em Desenvolvimento' : '🔬 Pesquisa Inicial'}\n` +
                    `**AIEA:** ${statusAIEA}`
            )
            .addFields({
                name: '⛏️ Urânio Bruto',
                value: `${uranioBruto.toLocaleString('pt-BR')} unidades`,
                inline: true
            })
            .addFields({
                name: '⚛️ Urânio Enriquecido',
                value: `${uranioEnriquecido.toLocaleString('pt-BR')} unidades`,
                inline: true
            })
            .addFields({
                name: '💣 Arsenal Nuclear',
                value:
                    `☢️ Fissão (A): **${ogivaBase}**\n` +
                    `🔥 Termonuclear (B): **${ogivaAvancada}**\n` +
                    `💥 Hidrogênio (C): **${ogivaHidrogenio}**\n` +
                    `🚀 ICBM: **${ogivaICBM}**\n` +
                    `📦 Total: **${ogivasTotal}**\n` +
                    `☢️ Poder: **${poderTotal.toLocaleString('pt-BR')}** pts`,
                inline: true
            })
            .addFields({ name: '🏭 Usinas Nucleares', value: `${usinasNucleares} usinas`, inline: true })
            .addFields({
                name: '👷 Funcionários',
                value:
                    `👥 Atual: **${funcionarios.toLocaleString('pt-BR')}**\n` +
                    `📋 Necessário: **${funcionariosNecessarios.toLocaleString('pt-BR')}**\n` +
                    `💰 Salários: **${Math.floor(funcionarios * 15000 * fatorInflacao).toLocaleString('pt-BR')}** moedas/ciclo`,
                inline: true
            })
            .addFields({
                name: '🛡️ Segurança',
                value:
                    `📊 Protocolos: Nv. **${protocolos}/5**\n` +
                    `📚 Treinamento: Nv. **${treinamento}**\n` +
                    `📉 Redução risco: **-${protocolos * 5 + treinamento * 2}%**`,
                inline: true
            })
            .addFields({
                name: '🔬 Tecnologias',
                value:
                    `${temFisicaNuclear ? '✅' : '❌'} Física Nuclear\n` +
                    `${temEnriquecimento ? '✅' : '❌'} Enriquecimento\n` +
                    `${temOgivas ? '✅' : '❌'} Ogivas Nucleares`,
                inline: true
            });

        if (enriquecendo) {
            const prog = enriquecendo.progresso || 0;
            const tot = enriquecendo.total || 3;
            const barra = '🟡'.repeat(prog) + '⬜'.repeat(tot - prog);
            embed.addFields({
                name: '⚛️ Enriquecendo Urânio',
                value: `${barra} **${Math.floor((prog / tot) * 100)}%**`,
                inline: false
            });
        }

        if (produzindo) {
            const prog = produzindo.progresso || 0;
            const tot = produzindo.total || 5;
            const barra = '🔴'.repeat(prog) + '⬜'.repeat(tot - prog);
            embed.addFields({
                name: '💣 Produzindo Ogiva',
                value: `${barra} **${Math.floor((prog / tot) * 100)}%**\n${NUCLEAR_DATA[produzindo.tipo]?.nome || produzindo.tipo}`,
                inline: false
            });
        }

        // Risco
        let riscoTotal = usinasNucleares * 0.001;
        riscoTotal += (uranioEnriquecido / 100000) * 0.01;
        if (enriquecendo) riscoTotal += 0.005;
        if (produzindo) riscoTotal += 0.003;
        riscoTotal += ogivaHidrogenio * 0.005;

        const defictFunc = Math.max(0, funcionariosNecessarios - funcionarios);
        if (defictFunc > 0 && funcionariosNecessarios > 0) {
            riscoTotal += (defictFunc / funcionariosNecessarios) * 0.01;
        }

        const fatorReducao = Math.max(0.1, 1 - protocolos * 0.05 - treinamento * 0.02);
        const riscoFinal = riscoTotal * fatorReducao;

        embed.addFields({
            name: '⚠️ Risco de Acidente',
            value:
                `☢️ Bruto: **${(riscoTotal * 100).toFixed(3)}%/ciclo**\n` +
                `🛡️ Com segurança: **${(riscoFinal * 100).toFixed(3)}%/ciclo**`,
            inline: true
        });

        embed.addFields({
            name: '⚡ Comandos',
            value:
                '`B!nuclear enriquecer <qtd>` — Enriquecer urânio\n' +
                '`B!nuclear produzir <tipo>` — Produzir ogiva\n' +
                '`B!nuclear usina <nível>` — Construir usinas\n' +
                '`B!nuclear equipe` — Gerenciar funcionários\n' +
                '`B!nuclear protocolo` — Protocolos de segurança\n' +
                '`B!nuclear inspecionar` — Relatório de segurança',
            inline: false
        });

        embed.setFooter({ text: 'Autoridade Nacional de Energia Nuclear • OneBot' });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= VER TIPOS DE OGIVAS =================
    if (subcmd === 'tipos') {
        const embed = new Discord.EmbedBuilder()
            .setTitle('💣 Catálogo de Armamentos Nucleares')
            .setColor('#992d22')
            .setDescription('Tipos de ogivas disponíveis para produção:');

        for (const [key, data] of Object.entries(NUCLEAR_DATA)) {
            if (!data.poder) continue;
            const disponivel = tecnologias.includes(data.tecnologia_necessaria);
            embed.addFields({
                name: `${disponivel ? '✅' : '🔒'} ${data.nome} (\`${key}\`)`,
                value:
                    `⚡ Poder: ${data.poder}x Hiroshima\n` +
                    `📦 Urânio: ${data.custo_uranio} enriquecido\n` +
                    `💰 Custo: ${data.custo_dinheiro.toLocaleString('pt-BR')} moedas\n` +
                    `⏱️ Produção: ${data.tempo_producao} ciclos\n` +
                    `🔬 Requer: ${data.tecnologia_necessaria.replace(/_/g, ' ')}`,
                inline: false
            });
        }

        embed.setFooter({ text: 'Use B!nuclear produzir <tipo> para iniciar produção' });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= ENRIQUECER URÂNIO =================
    if (subcmd === 'enriquecer') {
        if (!temEnriquecimento) {
            return message.channel.send('❌ Pesquise **Enriquecimento de Urânio** primeiro!');
        }

        const qtd = args[1] === undefined ? 100 : parseInt(args[1], 10);
        if (!Number.isInteger(qtd) || qtd <= 0) {
            return message.channel.send('❌ A quantidade de urânio deve ser um número inteiro positivo.');
        }
        const uranioBruto = Number(pais.uranio) || 0;
        const custoDinheiro = Math.floor(NUCLEAR_DATA.custo_enriquecimento * (qtd / 100) * fatorInflacao);
        const tesouro = Number(pais.tesouro) || 0;

        if (uranioBruto < qtd) {
            return message.channel.send(
                `❌ Urânio bruto insuficiente! Você tem ${uranioBruto.toLocaleString('pt-BR')} unidades.`
            );
        }

        if (tesouro < custoDinheiro) {
            return message.channel.send(
                `❌ Tesouro insuficiente! Custo: ${custoDinheiro.toLocaleString('pt-BR')} moedas.`
            );
        }

        if (pais.enriquecendo_uranio) {
            return message.channel.send('❌ Você já está enriquecendo urânio! Aguarde concluir.');
        }

        db.subtract(`pais_${nomePais}.uranio`, qtd);
        db.subtract(`pais_${nomePais}.tesouro`, custoDinheiro);
        db.set(`pais_${nomePais}.enriquecendo_uranio`, {
            quantidade: qtd,
            progresso: 0,
            total: NUCLEAR_DATA.tempo_enriquecimento,
            inicio: Date.now()
        });

        if (Math.random() < NUCLEAR_DATA.chance_vazamento) {
            const populacaoAfetada = Math.floor((pais.populacao || 0) * 0.001);
            reduzirPopulacao(nomePais, populacaoAfetada);
            db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 5);

            const embed = new Discord.EmbedBuilder()
                .setTitle('⚠️ Vazamento Radioativo!')
                .setColor('#e67e22')
                .setDescription(
                    'Durante a preparação do enriquecimento, houve um vazamento controlado nas instalações.'
                )
                .addFields({
                    name: '👥 População Afetada',
                    value: `${populacaoAfetada.toLocaleString('pt-BR')} cidadãos expostos`,
                    inline: true
                })
                .addFields({
                    name: '💀 Estimativa de Mortes',
                    value: `${Math.floor(populacaoAfetada * 0.1).toLocaleString('pt-BR')} (10%)`,
                    inline: true
                })
                .addFields({ name: '🌍 Reputação', value: '-5 pontos', inline: true })
                .setFooter({ text: 'Agência Nacional de Segurança Nuclear • OneBot' });
            return message.channel.send({ embeds: [embed] });
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('⚛️ Enriquecimento de Urânio Iniciado')
            .setColor('#f1c40f')
            .setDescription('As centrífugas começaram a girar. O urânio está sendo enriquecido para uso nuclear.')
            .addFields({ name: '📦 Matéria-Prima', value: `${qtd.toLocaleString('pt-BR')} unidades`, inline: true })
            .addFields({ name: '💰 Custo', value: `${custoDinheiro.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '⏱️ Tempo', value: `${NUCLEAR_DATA.tempo_enriquecimento} ciclos`, inline: true })
            .addFields({
                name: '⚠️ Risco',
                value: `${(NUCLEAR_DATA.chance_vazamento * 100).toFixed(2)}%`,
                inline: true
            })
            .setFooter({ text: 'Autoridade Nacional de Energia Nuclear • OneBot' })
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= PRODUZIR OGIVA =================
    if (subcmd === 'produzir' || subcmd === 'fabricar') {
        if (!temOgivas) {
            return message.channel.send('❌ Pesquise **Ogivas Nucleares** primeiro!');
        }

        const tipo = args[1]?.toLowerCase();

        if (!tipo || !NUCLEAR_DATA[tipo] || !NUCLEAR_DATA[tipo].poder) {
            const embedOpcoes = new Discord.EmbedBuilder()
                .setTitle('💣 Escolha o Tipo de Ogiva')
                .setColor('#992d22')
                .setDescription('Use: `B!nuclear produzir <tipo>`\n\n**Tipos disponíveis:**');

            for (const [key, data] of Object.entries(NUCLEAR_DATA)) {
                if (!data.poder) continue;
                const disponivel = tecnologias.includes(data.tecnologia_necessaria);
                const uranioOk = (pais.uranio_enriquecido || 0) >= data.custo_uranio;
                const dinheiroOk = (pais.tesouro || 0) >= Math.floor(data.custo_dinheiro * fatorInflacao);

                embedOpcoes.addFields({
                    name: `${disponivel ? '✅' : '🔒'} ${data.nome} (\`${key}\`)`,
                    value:
                        `⚡ Poder: ${data.poder}x Hiroshima\n` +
                        `📦 Urânio: ${data.custo_uranio} (${uranioOk ? '✅' : '❌'})\n` +
                        `💰 Custo: ${Math.floor(data.custo_dinheiro * fatorInflacao).toLocaleString('pt-BR')} (${dinheiroOk ? '✅' : '❌'})\n` +
                        `⏱️ ${data.tempo_producao} ciclos`,
                    inline: true
                });
            }

            embedOpcoes.setFooter({ text: 'Complexo Militar Nuclear • OneBot' });
            return message.channel.send({ embeds: [embedOpcoes] });
        }

        const ogivaData = NUCLEAR_DATA[tipo];

        if (!tecnologias.includes(ogivaData.tecnologia_necessaria)) {
            return message.channel.send(
                `❌ Você precisa pesquisar **${ogivaData.tecnologia_necessaria.replace(/_/g, ' ')}** primeiro!`
            );
        }

        const uranioEnriquecido = Number(pais.uranio_enriquecido) || 0;
        const tesouro = Number(pais.tesouro) || 0;
        const custoFinal = Math.floor(ogivaData.custo_dinheiro * fatorInflacao);

        if (uranioEnriquecido < ogivaData.custo_uranio) {
            return message.channel.send(`❌ Urânio enriquecido insuficiente!`);
        }

        if (tesouro < custoFinal) {
            return message.channel.send(
                `❌ Tesouro insuficiente! Custo: ${custoFinal.toLocaleString('pt-BR')} moedas.`
            );
        }

        if (pais.produzindo_ogiva) {
            return message.channel.send('❌ Você já está produzindo uma ogiva!');
        }

        db.subtract(`pais_${nomePais}.uranio_enriquecido`, ogivaData.custo_uranio);
        db.subtract(`pais_${nomePais}.tesouro`, custoFinal);
        db.set(`pais_${nomePais}.produzindo_ogiva`, {
            tipo: tipo,
            progresso: 0,
            total: ogivaData.tempo_producao,
            inicio: Date.now()
        });

        const arsenalAtual = pais.arsenal_nuclear || {};
        const totalAtual =
            (Number(arsenalAtual.ogiva_base) || 0) +
            (Number(arsenalAtual.ogiva_avancada) || 0) +
            (Number(arsenalAtual.ogiva_hidrogenio) || 0) +
            (Number(arsenalAtual.missil_icbm) || 0);

        if (totalAtual === 0) {
            const noticia = {
                titulo: '☢️ Alerta Nuclear Global!',
                descricao: `**${nomeFormal}** iniciou a produção de armas nucleares!`,
                tipo: 'militar',
                impacto: 'negativo',
                timestamp: Date.now(),
                pais: nomePais
            };
            const engine = client.paisEngine;
            if (engine) {
                engine.publicarNoticiaGlobal(noticia);
                engine.publicarNoticiaNacional(nomePais, noticia);
            }
            db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 15);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('💣 Produção de Ogiva Nuclear Iniciada')
            .setColor('#992d22')
            .setDescription(`A produção de uma **${ogivaData.nome}** foi iniciada.`)
            .addFields({ name: '📋 Tipo', value: ogivaData.nome, inline: true })
            .addFields({ name: '⚡ Poder', value: `${ogivaData.poder}x Hiroshima`, inline: true })
            .addFields({ name: '💰 Custo', value: `${custoFinal.toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '⏱️ Tempo', value: `${ogivaData.tempo_producao} ciclos`, inline: true })
            .addFields({
                name: '💣 Arsenal',
                value: `${totalAtual} → **${totalAtual}** (após conclusão: +1)`,
                inline: true
            })
            .addFields({ name: '📊 Inflação', value: `${(inflacao * 100).toFixed(1)}%`, inline: true })
            .setFooter({ text: 'Complexo Militar Nuclear • OneBot' })
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= CONSTRUIR USINAS =================
    if (subcmd === 'usina') {
        const usinaData = NUCLEAR_DATA.usina_nuclear;
        const nivelAtual = Number(pais.construcoes?.usina_nuclear?.nivel || pais.construcoes?.usina_nuclear || 0);
        const nivelDesejado = parseInt(args[1]) || nivelAtual + 1;

        if (nivelDesejado <= nivelAtual) return message.channel.send('❌ Nível inválido.');

        const diff = nivelDesejado - nivelAtual;
        const uranioNecessario = usinaData.custo_uranio * diff;
        const dinheiroNecessario = usinaData.custo_dinheiro * diff;
        const tesouro = Number(pais.tesouro) || 0;
        const uranioBruto = Number(pais.uranio) || 0;
        const custoFinal = Math.floor(dinheiroNecessario * fatorInflacao);

        if (uranioBruto < uranioNecessario) return message.channel.send(`❌ Urânio insuficiente!`);
        if (tesouro < custoFinal) return message.channel.send(`❌ Tesouro insuficiente!`);

        db.subtract(`pais_${nomePais}.uranio`, uranioNecessario);
        db.subtract(`pais_${nomePais}.tesouro`, custoFinal);
        db.set(`pais_${nomePais}.construcoes.usina_nuclear.nivel`, nivelDesejado);
        db.subtract(`pais_${nomePais}.inflacao`, 0.01 * diff);
        db.add(`pais_${nomePais}.aprovacaoPopular`, 2 * diff);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🏭 Expansão Nuclear Concluída!')
            .setColor('#2ecc71')
            .setDescription(`${diff} nova(s) usina(s) nuclear(es) conectada(s).`)
            .addFields({ name: '⚡ Nível', value: `${nivelAtual} → **${nivelDesejado}**`, inline: true })
            .addFields({ name: '🔋 Produção', value: `${nivelDesejado * usinaData.producao_energia} MW`, inline: true })
            .addFields({ name: '💰 Custo', value: `${custoFinal.toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '📉 Inflação', value: `-${(0.5 * diff).toFixed(1)}%`, inline: true })
            .addFields({ name: '⚠️ Risco', value: `${(nivelDesejado * 0.001 * 100).toFixed(3)}%/ciclo`, inline: true })
            .addFields({ name: '👷 Funcionários', value: `+${diff * 500} vagas abertas!`, inline: true })
            .setFooter({ text: 'Ministério de Energia • OneBot' })
            .setTimestamp();

        const noticiaUsina = {
            titulo: '🏭 Expansão Nuclear Nacional!',
            descricao: `**${nomeFormal}** construiu **${diff}** nova(s) usina(s) nuclear(es)! ⚡ +${diff * usinaData.producao_energia} MW`,
            tipo: 'governo',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticiaUsina);

        return message.channel.send({ embeds: [embed] });
    }

    // ================= INSPECIONAR =================
    if (subcmd === 'inspecionar' || subcmd === 'seguranca') {
        const paisAtual = db.get(`pais_${nomePais}`);
        const usinasNucleares = Number(
            paisAtual.construcoes?.usina_nuclear?.nivel || paisAtual.construcoes?.usina_nuclear || 0
        );
        const enriquecendo = paisAtual.enriquecendo_uranio || null;
        const produzindo = paisAtual.produzindo_ogiva || null;
        const uranioEnriquecido = Number(paisAtual.uranio_enriquecido) || 0;
        const arsenal = paisAtual.arsenal_nuclear || {};
        const ogivasTotal =
            (Number(arsenal.ogiva_base) || 0) +
            (Number(arsenal.ogiva_avancada) || 0) +
            (Number(arsenal.ogiva_hidrogenio) || 0) +
            (Number(arsenal.missil_icbm) || 0);
        const funcionarios = paisAtual.funcionarios_nucleares || 0;
        const funcionariosNecessarios = usinasNucleares * 500;
        const protocolos = paisAtual.protocolos_seguranca || 0;
        const treinamento = paisAtual.treinamento_nuclear || 0;

        let riscoTotal = usinasNucleares * 0.001;
        riscoTotal += (uranioEnriquecido / 100000) * 0.01;
        if (enriquecendo) riscoTotal += 0.005;
        if (produzindo) riscoTotal += 0.003;
        riscoTotal += (Number(arsenal.ogiva_hidrogenio) || 0) * 0.005;

        const defictFunc = Math.max(0, funcionariosNecessarios - funcionarios);
        if (defictFunc > 0 && funcionariosNecessarios > 0) {
            riscoTotal += (defictFunc / funcionariosNecessarios) * 0.01;
        }

        const fatorReducao = Math.max(0.1, 1 - protocolos * 0.05 - treinamento * 0.02);
        const riscoFinal = riscoTotal * fatorReducao;

        let recomendacoes = [];
        let populacaoEmRisco = Math.floor((paisAtual.populacao || 0) * 0.05 * usinasNucleares);

        if (usinasNucleares > 10) recomendacoes.push('🔴 CRÍTICO: Muitas usinas!');
        else if (usinasNucleares > 5) recomendacoes.push('🟡 Considere mais protocolos de segurança.');

        if (defictFunc > 0)
            recomendacoes.push(`👷 Déficit de ${defictFunc.toLocaleString('pt-BR')} funcionários! Contrate urgente.`);
        if (protocolos < 3) recomendacoes.push('🛡️ Protocolos de segurança baixos. Invista mais.');
        if (treinamento < 2) recomendacoes.push('📚 Treinamento insuficiente. Realize treinamentos.');
        if (enriquecendo) recomendacoes.push('⚛️ Enriquecimento ativo - monitore.');
        if (produzindo) recomendacoes.push('💣 Produção de ogiva em andamento.');
        if (ogivasTotal > 50) recomendacoes.push('☢️ Arsenal massivo - atenção internacional.');

        if (recomendacoes.length === 0) recomendacoes.push('✅ Todas as operações dentro dos parâmetros de segurança.');

        const embed = new Discord.EmbedBuilder()
            .setTitle('🔍 Relatório de Segurança Nuclear')
            .setColor(riscoFinal > 0.01 ? 0xff0000 : riscoFinal > 0.005 ? 0xffa500 : 0x00ff00)
            .setDescription('Inspeção completa das instalações nucleares.')
            .addFields({
                name: '🏭 Usinas',
                value: `${usinasNucleares} (⚡ ${usinasNucleares * 5000} MW)`,
                inline: true
            })
            .addFields({ name: '💣 Arsenal', value: `${ogivasTotal} ogivas`, inline: true })
            .addFields({
                name: '👷 Funcionários',
                value: `${funcionarios.toLocaleString('pt-BR')} / ${funcionariosNecessarios.toLocaleString('pt-BR')}`,
                inline: true
            })
            .addFields({ name: '⚠️ Risco Bruto', value: `${(riscoTotal * 100).toFixed(3)}%/ciclo`, inline: true })
            .addFields({ name: '🛡️ Risco Final', value: `${(riscoFinal * 100).toFixed(3)}%/ciclo`, inline: true })
            .addFields({ name: '👥 Pop. em Risco', value: `${populacaoEmRisco.toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '📋 Recomendações', value: recomendacoes.join('\n'), inline: false })
            .setFooter({ text: 'Agência Nacional de Segurança Nuclear • OneBot' })
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= PROTOCOLOS DE SEGURANÇA =================
    if (subcmd === 'protocolo' || subcmd === 'seguro' || subcmd === 'proteger') {
        const paisAtual = db.get(`pais_${nomePais}`);
        const protocolosAtual = paisAtual.protocolos_seguranca || 0;
        const usinasNucleares = Number(
            paisAtual.construcoes?.usina_nuclear?.nivel || paisAtual.construcoes?.usina_nuclear || 0
        );
        const arsenal = paisAtual.arsenal_nuclear || {};
        const ogivasTotal =
            (Number(arsenal.ogiva_base) || 0) +
            (Number(arsenal.ogiva_avancada) || 0) +
            (Number(arsenal.ogiva_hidrogenio) || 0) +
            (Number(arsenal.missil_icbm) || 0);

        if (!args[1]) {
            let riscoAtual = usinasNucleares * 0.001;
            riscoAtual += ((Number(paisAtual.uranio_enriquecido) || 0) / 100000) * 0.01;
            if (paisAtual.enriquecendo_uranio) riscoAtual += 0.005;
            if (paisAtual.produzindo_ogiva) riscoAtual += 0.003;
            riscoAtual += (Number(arsenal.ogiva_hidrogenio) || 0) * 0.005;

            const reducaoProtocolo = Math.max(0.1, 1 - protocolosAtual * 0.05);
            const riscoFinal = riscoAtual * reducaoProtocolo;

            const niveisProtocolo = [
                {
                    nivel: 0,
                    nome: 'Inexistente',
                    custo: 0,
                    reducao: 0,
                    descricao: 'Nenhum protocolo de segurança. Funcionários sem treinamento adequado.'
                },
                {
                    nivel: 1,
                    nome: 'Básico',
                    custo: Math.floor(10000000 * fatorInflacao),
                    reducao: 5,
                    descricao: 'Treinamento básico, equipamentos de proteção individual, plano de evacuação simples.'
                },
                {
                    nivel: 2,
                    nome: 'Intermediário',
                    custo: Math.floor(25000000 * fatorInflacao),
                    reducao: 10,
                    descricao: 'Sistemas redundantes de resfriamento, inspeções trimestrais, centro de emergência.'
                },
                {
                    nivel: 3,
                    nome: 'Avançado',
                    custo: Math.floor(50000000 * fatorInflacao),
                    reducao: 15,
                    descricao: 'Contenção reforçada, equipe de resposta 24h, simulações mensais de acidente.'
                },
                {
                    nivel: 4,
                    nome: 'Excelência',
                    custo: Math.floor(100000000 * fatorInflacao),
                    reducao: 20,
                    descricao: 'Tecnologia de ponta, IA de monitoramento, parceria com AIEA, hospitais preparados.'
                },
                {
                    nivel: 5,
                    nome: 'Máxima Segurança',
                    custo: Math.floor(200000000 * fatorInflacao),
                    reducao: 25,
                    descricao: 'Padrão suíço de segurança, múltiplas barreiras de contenção, equipe internacional.'
                }
            ];

            const nivelAtual = niveisProtocolo[Math.min(protocolosAtual, 5)];
            const proximoNivel = protocolosAtual < 5 ? niveisProtocolo[protocolosAtual + 1] : null;

            const embed = new Discord.EmbedBuilder()
                .setTitle('🛡️ Centro de Segurança Nuclear')
                .setColor(protocolosAtual >= 3 ? 0x00ff00 : protocolosAtual >= 1 ? 0xffa500 : 0xff0000)
                .setDescription(
                    `**${nomeFormal}** — Protocolos de Segurança Nuclear\n\n` +
                        `📊 Nível Atual: **${nivelAtual.nome}** (Nv. ${protocolosAtual})\n` +
                        `🛡️ Redução de Risco: **-${protocolosAtual * 5}%**\n` +
                        `📋 ${nivelAtual.descricao}`
                )
                .addFields({
                    name: '⚠️ Risco Atual',
                    value:
                        `☢️ Risco bruto: **${(riscoAtual * 100).toFixed(3)}%/ciclo**\n` +
                        `🛡️ Com protocolos: **${(riscoFinal * 100).toFixed(3)}%/ciclo**\n` +
                        `📉 Redução: **-${((1 - reducaoProtocolo) * 100).toFixed(0)}%**`,
                    inline: true
                })
                .addFields({
                    name: '📊 Estatísticas',
                    value:
                        `🏭 Usinas: **${usinasNucleares}**\n` +
                        `💣 Arsenal: **${ogivasTotal} ogivas**\n` +
                        `👷 Equipe: **${protocolosAtual * 200} técnicos**`,
                    inline: true
                });

            if (proximoNivel) {
                embed.addFields({
                    name: '⬆️ Próximo Nível',
                    value:
                        `🛡️ **${proximoNivel.nome}** (Nv. ${protocolosAtual + 1})\n` +
                        `💰 Custo: **${proximoNivel.custo.toLocaleString('pt-BR')}** moedas\n` +
                        `📉 Redução adicional: **-5%**\n` +
                        `📋 ${proximoNivel.descricao}\n\n` +
                        `Use: \`B!nuclear protocolo ${protocolosAtual + 1}\``,
                    inline: false
                });
            } else {
                embed.addFields({
                    name: '🏆 Nível Máximo',
                    value: '✅ Seus protocolos de segurança são referência mundial!',
                    inline: false
                });
            }

            const checklist = [];
            checklist.push(
                protocolosAtual >= 1 ? '✅ EPIs para todos os funcionários' : '❌ EPIs para todos os funcionários'
            );
            checklist.push(
                protocolosAtual >= 2
                    ? '✅ Sistemas redundantes de resfriamento'
                    : '❌ Sistemas redundantes de resfriamento'
            );
            checklist.push(
                protocolosAtual >= 3 ? '✅ Contenção reforçada (concreto 2m)' : '❌ Contenção reforçada (concreto 2m)'
            );
            checklist.push(protocolosAtual >= 4 ? '✅ Monitoramento por IA 24/7' : '❌ Monitoramento por IA 24/7');
            checklist.push(
                protocolosAtual >= 5 ? '✅ Certificação AIEA Nível Ouro' : '❌ Certificação AIEA Nível Ouro'
            );

            embed.addFields({ name: '📋 Checklist de Infraestrutura', value: checklist.join('\n'), inline: false });
            embed.setFooter({ text: 'Agência Nacional de Segurança Nuclear • OneBot' });
            embed.setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        const nivelDesejado = parseInt(args[1]);
        if (isNaN(nivelDesejado) || nivelDesejado < 1 || nivelDesejado > 5) {
            return message.channel.send('❌ Nível inválido! Escolha entre 1 e 5.');
        }
        if (nivelDesejado <= protocolosAtual) {
            return message.channel.send(`❌ Você já possui protocolos nível ${protocolosAtual} ou superior!`);
        }

        const custosNiveis = [0, 10000000, 25000000, 50000000, 100000000, 200000000];
        let custoTotal = 0;
        for (let i = protocolosAtual + 1; i <= nivelDesejado; i++) {
            custoTotal += Math.floor(custosNiveis[i] * fatorInflacao);
        }

        const tesouro = Number(paisAtual.tesouro) || 0;
        if (tesouro < custoTotal) {
            return message.channel.send(
                `❌ Tesouro insuficiente! Custo total: **${custoTotal.toLocaleString('pt-BR')}** moedas.`
            );
        }

        db.subtract(`pais_${nomePais}.tesouro`, custoTotal);
        db.set(`pais_${nomePais}.protocolos_seguranca`, nivelDesejado);
        db.add(`pais_${nomePais}.aprovacaoPopular`, nivelDesejado * 2);

        const nomesNiveis = ['', 'Básico', 'Intermediário', 'Avançado', 'Excelência', 'Máxima Segurança'];

        const embed = new Discord.EmbedBuilder()
            .setTitle('🛡️ Protocolos de Segurança Atualizados!')
            .setColor('#2ecc71')
            .setDescription(
                `**${nomeFormal}** implementou novos protocolos de segurança nuclear!\n\n` +
                    `📊 Nível: **${nomesNiveis[protocolosAtual]}** → **${nomesNiveis[nivelDesejado]}**`
            )
            .addFields({ name: '💰 Investimento', value: `${custoTotal.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({
                name: '🛡️ Redução de Risco',
                value: `-${(1 - Math.max(0.1, 1 - nivelDesejado * 0.05)) * 100}%`,
                inline: true
            })
            .addFields({ name: '😊 Aprovação', value: `+${nivelDesejado * 2}%`, inline: true })
            .addFields({ name: '📊 Inflação', value: `${(inflacao * 100).toFixed(1)}% (custo ajustado)`, inline: true })
            .setFooter({ text: 'Agência Nacional de Segurança Nuclear • OneBot' })
            .setTimestamp();

        const noticia = {
            titulo: '🛡️ Segurança Nuclear Reforçada!',
            descricao: `**${nomeFormal}** investiu **${custoTotal.toLocaleString('pt-BR')}** moedas em protocolos de segurança nuclear. Nível: **${nomesNiveis[nivelDesejado]}**.`,
            tipo: 'governo',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

        return message.channel.send({ embeds: [embed] });
    }

    // ================= GERENCIAR EQUIPE NUCLEAR =================
    if (subcmd === 'equipe' || subcmd === 'funcionarios' || subcmd === 'staff') {
        const paisAtual = db.get(`pais_${nomePais}`);
        const usinasNucleares = Number(
            paisAtual.construcoes?.usina_nuclear?.nivel || paisAtual.construcoes?.usina_nuclear || 0
        );
        const funcionariosAtuais = paisAtual.funcionarios_nucleares || 0;
        const funcionariosNecessarios = usinasNucleares * 500;
        const defictFuncionarios = Math.max(0, funcionariosNecessarios - funcionariosAtuais);

        if (!args[1]) {
            let eficiencia = 100;
            if (defictFuncionarios > 0) {
                eficiencia = Math.max(30, 100 - (defictFuncionarios / funcionariosNecessarios) * 70);
            }

            const embed = new Discord.EmbedBuilder()
                .setTitle('👷 Centro de RH Nuclear')
                .setColor(defictFuncionarios > 0 ? 0xff0000 : 0x00ff00)
                .setDescription(
                    `**${nomeFormal}** — Gestão de Pessoal\n\n` +
                        `👷 Funcionários: **${funcionariosAtuais.toLocaleString('pt-BR')}**\n` +
                        `🏭 Usinas: **${usinasNucleares}**\n` +
                        `📋 Necessário: **${funcionariosNecessarios.toLocaleString('pt-BR')}** (500/usina)`
                )
                .addFields({
                    name: '📊 Situação',
                    value:
                        defictFuncionarios > 0
                            ? `🔴 DÉFICIT: ${defictFuncionarios.toLocaleString('pt-BR')} vagas!\n⚡ Eficiência: ${eficiencia}%`
                            : `✅ Equipe completa!\n⚡ Eficiência: 100%`,
                    inline: true
                })
                .addFields({
                    name: '💰 Custos',
                    value:
                        `💵 Salário: ${Math.floor(15000 * fatorInflacao).toLocaleString('pt-BR')} moedas/func.\n` +
                        `💵 Total: ${Math.floor(funcionariosAtuais * 15000 * fatorInflacao).toLocaleString('pt-BR')}/ciclo\n` +
                        `👷 Contratação: ${Math.floor(50000 * fatorInflacao).toLocaleString('pt-BR')}/func.`,
                    inline: true
                });

            if (defictFuncionarios > 0) {
                embed.addFields({
                    name: '⚡ Ações',
                    value:
                        `\`B!nuclear equipe contratar ${defictFuncionarios}\` — Preencher vagas\n` +
                        `\`B!nuclear equipe contratar <qtd>\` — Contratar quantidade`,
                    inline: false
                });
            }

            embed.addFields({
                name: '📚 Outros',
                value: '`B!nuclear equipe treinar` — Treinamento avançado\n`B!nuclear equipe demitir <qtd>` — Demitir',
                inline: false
            });
            embed.setFooter({ text: 'DRH Nuclear • OneBot' });
            embed.setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (args[1] === 'treinar') {
            const novoTreinamento = (paisAtual.treinamento_nuclear || 0) + 1;
            const custoTreino = Math.floor(funcionariosAtuais * 5000 * fatorInflacao);
            const tesouro = Number(paisAtual.tesouro) || 0;

            const protocolos = paisAtual.protocolos_seguranca || 0;
            const reducaoAtual = protocolos * 5 + (novoTreinamento - 1) * 2;
            const reducaoNova = protocolos * 5 + novoTreinamento * 2;

            // ⚡ Calcular custo do PRÓXIMO nível também
            const custoProximoNivel = Math.floor(funcionariosAtuais * 5000 * fatorInflacao * 1.1); // +10% por nível

            if (tesouro < custoTreino) return message.channel.send(`❌ Tesouro insuficiente!`);

            db.subtract(`pais_${nomePais}.tesouro`, custoTreino);
            db.add(`pais_${nomePais}.treinamento_nuclear`, 1);

            const embed = new Discord.EmbedBuilder()
                .setTitle('📚 Treinamento Nuclear Avançado')
                .setColor('#3498db')
                .setDescription(
                    `${funcionariosAtuais.toLocaleString('pt-BR')} funcionários passaram por treinamento intensivo de segurança.\n\n` +
                        `*"Conhecimento é a primeira linha de defesa contra acidentes"* — Instrutor Chefe`
                )
                .addFields({
                    name: '📊 Nível de Treinamento',
                    value: `${novoTreinamento - 1} → **${novoTreinamento}**`,
                    inline: true
                })
                .addFields({
                    name: '🛡️ Redução de Risco',
                    value: `-2% neste nível\n` + `📉 Total: **-${reducaoNova}%**`,
                    inline: true
                })
                .addFields({
                    name: '💰 Investimento',
                    value:
                        `💵 Total: **${custoTreino.toLocaleString('pt-BR')}** moedas\n` +
                        `💵 Por func.: **${Math.floor(5000 * fatorInflacao).toLocaleString('pt-BR')}**`,
                    inline: true
                })
                .addFields({
                    name: '📋 Conteúdo Programático',
                    value:
                        '✅ Procedimentos de emergência\n' +
                        '✅ Manuseio de material radioativo\n' +
                        '✅ Simulações de acidente\n' +
                        '✅ Primeiros socorros radiológicos\n' +
                        '✅ Operação de sistemas de contenção',
                    inline: false
                })
                .addFields({
                    name: '👷 Equipe Treinada',
                    value:
                        `${funcionariosAtuais.toLocaleString('pt-BR')} profissionais certificados\n` +
                        `🏭 ${usinasNucleares} usinas com equipe atualizada`,
                    inline: true
                })
                .addFields({
                    name: '📈 Próximo Nível',
                    value:
                        `💵 Custo estimado: **${custoProximoNivel.toLocaleString('pt-BR')}** moedas\n` +
                        `📉 Redução adicional: **-2%**\n` +
                        `🛡️ Redução total: **-${reducaoNova + 2}%**`,
                    inline: true
                })
                .setFooter({ text: 'Centro de Treinamento Nuclear • OneBot' })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (args[1] === 'demitir') {
            const qtd = parseInt(args[2]) || 0;
            if (qtd <= 0 || qtd > funcionariosAtuais) return message.channel.send('❌ Quantidade inválida!');

            const custoRescisao = Math.floor(qtd * 30000 * fatorInflacao);
            const tesouro = Number(paisAtual.tesouro) || 0;
            if (tesouro < custoRescisao) return message.channel.send(`❌ Tesouro insuficiente!`);

            const restantes = funcionariosAtuais - qtd;
            const novoDeficit = Math.max(0, funcionariosNecessarios - restantes);

            db.subtract(`pais_${nomePais}.tesouro`, custoRescisao);
            db.subtract(`pais_${nomePais}.funcionarios_nucleares`, qtd);
            db.subtract(`pais_${nomePais}.aprovacaoPopular`, Math.floor(qtd / 100));

            const embed = new Discord.EmbedBuilder()
                .setTitle('👋 Desligamento de Funcionários')
                .setColor('#e67e22')
                .setDescription(
                    `${qtd.toLocaleString('pt-BR')} funcionários foram desligados do programa nuclear.\n\n` +
                        `*"Decisões difíceis para manter a sustentabilidade"* — Ministro de Energia`
                )
                .addFields({
                    name: '👥 Equipe',
                    value: `${funcionariosAtuais.toLocaleString('pt-BR')} → **${restantes.toLocaleString('pt-BR')}**`,
                    inline: true
                })
                .addFields({
                    name: '⚠️ Novo Déficit',
                    value: novoDeficit > 0 ? `🔴 ${novoDeficit.toLocaleString('pt-BR')} vagas` : '✅ Equipe suficiente',
                    inline: true
                })
                .addFields({
                    name: '💰 Rescisões',
                    value:
                        `💵 Total: **${custoRescisao.toLocaleString('pt-BR')}** moedas\n` +
                        `💵 Por func.: **${Math.floor(30000 * fatorInflacao).toLocaleString('pt-BR')}**`,
                    inline: true
                })
                .addFields({
                    name: '😊 Impacto Social',
                    value: `📉 Aprovação: **-${Math.floor(qtd / 100)}%**\n` + `👷 Desempregados: **+${qtd}**`,
                    inline: true
                })
                .addFields({
                    name: '☢️ Risco',
                    value:
                        novoDeficit > 0
                            ? `⚠️ Risco aumentou em **${((novoDeficit / funcionariosNecessarios) * 0.5).toFixed(2)}%**`
                            : '✅ Risco estável',
                    inline: true
                })
                .setFooter({ text: 'DRH Nuclear • OneBot' })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        //Contratar funcionários
        if (args[1] === 'contratar') {
            //Definir déficit de funcionários
            const deficitFuncionarios = Math.max(0, funcionariosNecessarios - funcionariosAtuais);

            const quantidade = parseInt(args[2]) || deficitFuncionarios;
            if (quantidade <= 0) {
                const erro_quantidade = new Discord.EmbedBuilder()
                    .setDescription(`❌ Quantidade de funcionários inválida!`)
                    .setFooter({
                        text: `Dica: Se você não selecionar um número, será contratado automaticamente a quantidade necessária. • OneBot`
                    })
                    .setTimestamp();

                message.channel.send({ embeds: [erro_quantidade] });
                return;
            }

            const custo_contratacao = Math.floor(quantidade * 50000 * fatorInflacao);
            const paisTesouro = db.get(`pais_${nomePais}.tesouro`);
            const tesouro = Number(paisTesouro) || 0;

            if (tesouro < custo_contratacao) {
                const erro_tesouro = new Discord.EmbedBuilder()
                    .setTitle(`Tesouro Insuficiente`)
                    .setColor('#e74c3c')
                    .setDescription(
                        `❌ Tesouro insuficiente para contratar ${quantidade.toLocaleString('pt-BR')} funcionários!`
                    )
                    .setFooter({ text: `© OneBot` })
                    .setTimestamp();

                message.channel.send({ embeds: [erro_tesouro] });
                return;
            }

            db.subtract(`pais_${nomePais}.tesouro`, custo_contratacao);
            db.add(`pais_${nomePais}.funcionarios_nucleares`, quantidade);

            const embed = new Discord.EmbedBuilder()
                .setTitle(`👷‍♂️ Contratação de Funcionários `)
                .setColor('#2ecc71')
                .setDescription(`Você realizou a contratação de novos funcionários para o Programa Nuclear!`)
                .addFields({
                    name: `👷‍♂️ Funcionários Contratados`,
                    value: quantidade.toLocaleString('pt-BR'),
                    inline: true
                })
                .addFields({ name: `💰 Custo`, value: custo_contratacao.toLocaleString('pt-BR'), inline: ' moedas' })
                .setFooter({ text: `© OneBot` })
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        }

        if (args[1] === 'treinar') {
            const custoTreino = Math.floor(funcionariosAtuais * 5000 * fatorInflacao);
            const tesouro = Number(paisAtual.tesouro) || 0;
            if (tesouro < custoTreino) return message.channel.send(`❌ Tesouro insuficiente!`);

            db.subtract(`pais_${nomePais}.tesouro`, custoTreino);
            db.add(`pais_${nomePais}.treinamento_nuclear`, 1);

            return message.channel.send(
                `📚 Treinamento realizado! -2% risco. Custo: ${custoTreino.toLocaleString('pt-BR')} moedas.`
            );
        }

        if (args[1] !== 'contratar' && args[1] !== 'treinar' && args[1] !== 'demitir') {
            return message.channel.send('❌ Use: `B!nuclear equipe contratar/demitir/treinar`.');
        }
    }

    return message.channel.send('❌ Comando inválido. Use `B!nuclear` para ver o painel.');
};
