const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js');
const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');
const { renderizarFront } = require('../systems/front-map');
const { criarGuerra, normalizarGuerra, registrarBatalha } = require('../systems/guerra-state');

const PATENTES = {
    coronel: { bonus: 1.05, custo: 0, label: 'Coronel', emoji: '🎖️' },
    general: { bonus: 1.15, custo: 50000, label: 'General', emoji: '⭐' },
    marechal: { bonus: 1.3, custo: 200000, label: 'Marechal', emoji: '🌟' },
    almirante: { bonus: 1.25, custo: 150000, label: 'Almirante', emoji: '⚓', tipo: 'naval' },
    brigadeiro: { bonus: 1.2, custo: 100000, label: 'Brigadeiro', emoji: '✈️', tipo: 'aereo' }
};

const DOUTRINAS = {
    blitzkrieg: {
        nome: 'Blitzkrieg',
        bonusAtaque: 1.4,
        bonusDefesa: 0.8,
        velocidade: 2,
        descricao: 'Guerra relâmpago',
        emoji: '⚡'
    },
    defesa_em_profundidade: {
        nome: 'Defesa em Profundidade',
        bonusAtaque: 0.8,
        bonusDefesa: 1.5,
        velocidade: 0.5,
        descricao: 'Defesa em camadas',
        emoji: '🛡️'
    },
    poder_de_fogo: {
        nome: 'Poder de Fogo Superior',
        bonusAtaque: 1.3,
        bonusDefesa: 1.1,
        velocidade: 1,
        descricao: 'Artilharia pesada',
        emoji: '💥'
    },
    guerrilla: {
        nome: 'Guerra de Guerrilha',
        bonusAtaque: 0.7,
        bonusDefesa: 1.6,
        velocidade: 1.5,
        descricao: 'Emboscadas',
        emoji: '🌲'
    }
};

const TIPOS_OPERACAO = {
    invasao_terrestre: {
        emoji: '⚔️',
        descricao: 'Invasão com infantaria e tanques',
        custo: 100000,
        tropas: { infantaria: 1000, tanques: 50 }
    },
    ataque_relampago: {
        emoji: '⚡',
        descricao: 'Blitzkrieg - tanques rompendo linhas',
        custo: 150000,
        tropas: { tanques: 200 }
    },
    bombardeio_aereo: {
        emoji: '✈️',
        descricao: 'Bombardeio em infraestrutura inimiga',
        custo: 80000,
        tropas: { avioes: 50 }
    },
    bloqueio_naval: { emoji: '🚢', descricao: 'Bloqueio naval', custo: 120000, tropas: { navios: 20 } },
    defesa_estrategica: { emoji: '🏰', descricao: 'Fortificar posições', custo: 50000, tropas: { infantaria: 5000 } },
    bombardeio_nuclear: { emoji: '☢️', descricao: 'Ataque nuclear devastador', custo: 500000, tropas: { bombas: 1 } },
    invasao_anfibia: {
        emoji: '🌊',
        descricao: 'Desembarque naval',
        custo: 200000,
        tropas: { navios: 30, infantaria: 5000 }
    },
    cerco_estrategico: {
        emoji: '🔒',
        descricao: 'Cercar forças inimigas',
        custo: 100000,
        tropas: { infantaria: 10000, tanques: 100 }
    },
    estabelecer_base: {
        emoji: '🏕️',
        descricao: 'Estabelecer base militar',
        custo: 200000,
        tropas: { infantaria: 5000 }
    },
    cortar_suprimentos: {
        emoji: '🔪',
        descricao: 'Cortar suprimentos',
        custo: 80000,
        tropas: { infantaria: 3000, tanques: 50 }
    },
    ataque_drones: {
        emoji: '🛸',
        descricao: 'Ataque com enxame de drones kamikaze - DANO MASSIVO',
        custo: 50000,
        tropas: { drones: 5 }
    }
};

const TIPOS_BASES = {
    posto_avancado: { nome: 'Posto Avançado', emoji: '🏕️', capacidade: 10000, bonus: 1.05, custo: 50000 },
    base_operacional: { nome: 'Base Operacional', emoji: '🏗️', capacidade: 50000, bonus: 1.1, custo: 200000 },
    quartel_general: { nome: 'Quartel General', emoji: '🏰', capacidade: 200000, bonus: 1.2, custo: 1000000 },
    centro_suprimentos: { nome: 'Centro de Suprimentos', emoji: '📦', capacidade: 100000, bonus: 1.08, custo: 300000 }
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`❌ Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`❌ Apenas o governador pode comandar.`);

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;
    const exercito = pais.exercito || {};
    const poderTotal = calcularPoderMilitar(pais);
    const subcmd = (args[0] || '').toLowerCase();

    // ================= QUARTEL GENERAL =================
    if (!subcmd) {
        const paises = (db.get('lista_paises') || []).filter((pais) => pais !== nomePais && db.get(`pais_${pais}`));
        return message.channel.send(criarPainelOperacao(nomePais, pais, paises));
    }

    if (subcmd === 'ajuda' || subcmd === 'qg') {
        const embed = new Discord.EmbedBuilder()
            .setTitle('🎖️ Alto Comando das Forças Armadas')
            .setColor('#992d22')
            .setDescription(
                `**${nomeFormal}**\n🔋 Poder Militar: **${poderTotal.toLocaleString('pt-BR')}** pts\n📊 Doutrina: **${DOUTRINAS[pais.doutrinaMilitar]?.emoji || '📋'} ${DOUTRINAS[pais.doutrinaMilitar]?.nome || 'Nenhuma'}**`
            )
            .addFields({
                name: '⚔️ Operações de Combate',
                value:
                    '`B!operacao-militar atacar <país> [tipo]` — Iniciar ofensiva\n' +
                    '`B!operacao-militar bombardear <país> <ogiva>` — Ataque nuclear ☢️\n' +
                    '`B!operacao-militar atacar <país> ataque_drones` — Enxame de drones 🛸\n' +
                    '`B!operacao-militar front [país]` — Ver fronts 🗺️',
                inline: false
            })
            .addFields({
                name: '🏕️ Logística & Bases',
                value:
                    '`B!operacao-militar estabelecer-base <país>` — Criar base\n' +
                    '`B!operacao-militar suprir <país>` — Enviar suprimentos\n' +
                    '`B!operacao-militar bases` — Ver bases',
                inline: false
            })
            .addFields({
                name: '🎖️ Comando',
                value:
                    '`B!operacao-militar general <nome> <patente>` — Nomear oficial\n' +
                    '`B!operacao-militar doutrina <tipo>` — Doutrina\n' +
                    '`B!operacao-militar info <país>` — Inteligência',
                inline: false
            })
            .addFields({
                name: '🏴 Dominação',
                value:
                    '`B!operacao-militar anexar <país>` — Anexar (80%+)\n' +
                    '`B!operacao-militar fantoche <país>` — Fantoche (70%+)\n' +
                    '`B!operacao-militar libertar-pais <país>` — Libertar (50%+) 🕊️',
                inline: false
            });

        const generais = pais.generais || [];
        if (generais.length > 0) {
            const lista = generais
                .map(
                    (g) =>
                        `${PATENTES[g.patente]?.emoji || '🎖️'} **${g.nome}** — ${PATENTES[g.patente]?.label}\n⚔️ Vitórias: ${g.vitorias} | 💀 Derrotas: ${g.derrotas}`
                )
                .join('\n');
            embed.addFields({ name: '👥 Oficiais em Comando', value: lista, inline: false });
        }

        const bases = pais.bases_militares || [];
        if (bases.length > 0) {
            let t = '';
            bases.forEach((b) => {
                t += `${TIPOS_BASES[b.tipo]?.emoji || '🏕️'} **${b.nome}** em ${b.pais}\n👥 ${(b.tropas || 0).toLocaleString('pt-BR')} tropas | ⛽ ${b.suprimento || 0}%\n`;
            });
            embed.addFields({ name: '🏕️ Bases Ativas', value: t, inline: false });
        }

        embed.setFooter({ text: 'Alto Comando • Use os subcomandos para operar' });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= INFO =================
    if (subcmd === 'info' || subcmd === 'intel') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar info <país>\``);
        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);
        const poderAlvo = calcularPoderMilitar(paisAlvo);
        const razao = poderTotal / (poderAlvo || 1);
        const chance = Math.min(95, Math.max(5, Math.floor(razao * 40)));
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🕵️ Inteligência — ${getDadosPais(alvo)?.nomeFormal || alvo}`)
            .setColor(0x00008b)
            .addFields({ name: '⚔️ Poder', value: poderAlvo.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '👥 Pop', value: (paisAlvo.populacao || 0).toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💰 Tesouro', value: (paisAlvo.tesouro || 0).toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '🎯 Chance', value: `${chance}%`, inline: true })
            .setFooter({ text: 'Serviço de Inteligência • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= ATACAR =================
    if (subcmd === 'atacar' || subcmd === 'invadir') {
        const alvo = (args[1] || '').toLowerCase();
        const tipoOperacao = (args[2] || 'invasao_terrestre').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar atacar <país> [tipo]\``);
        if (alvo === nomePais) return message.channel.send(`❌ Não pode atacar seu próprio país!`);
        if (!TIPOS_OPERACAO[tipoOperacao]) return message.channel.send(`❌ Tipo inválido!`);

        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);
        if ((pais.aliancas || []).includes(alvo)) return message.channel.send(`❌ É seu aliado!`);

        const op = TIPOS_OPERACAO[tipoOperacao];
        const guerrasAtuais = db.get('guerras_ativas') || [];
        const guerraExistente = guerrasAtuais.find(
            (guerra) =>
                (guerra.atacante === nomePais && guerra.defensor === alvo) ||
                (guerra.atacante === alvo && guerra.defensor === nomePais)
        );
        if (guerraExistente && guerraExistente.status !== 'ativa') {
            return message.channel.send('❌ Este conflito já foi encerrado e não aceita novas operações.');
        }
        if (guerraExistente && (guerraExistente.atacante !== nomePais || guerraExistente.defensor !== alvo)) {
            return message.channel.send(
                '❌ Já existe uma guerra ativa entre estes países; a operação deve ocorrer dentro do conflito existente.'
            );
        }
        if (pais.controladoPor || (pais.governoFantoche && pais.isNPC)) {
            return message.channel.send(
                '❌ Este país está sob controle de outra potência e não pode iniciar uma operação independente.'
            );
        }
        if (paisAlvo.capitulou || paisAlvo.status === 'capitulada') {
            return message.channel.send(
                '❌ O país defensor está capitulado; resolva a Conferência de Paz em vez de iniciar outra batalha.'
            );
        }
        const tesouro = Number(pais.tesouro) || 0;
        if (tesouro < op.custo) return message.channel.send(`❌ Tesouro insuficiente!`);

        for (const [tropa, qtd] of Object.entries(op.tropas)) {
            if (tropa === 'bombas') {
                if (totalOgivas(pais) < qtd) return message.channel.send(`❌ Precisa de ${qtd} ogiva(s)!`);
            } else if (tropa === 'drones') {
                if (Object.values(pais.arsenal_drones || {}).reduce((a, b) => a + b, 0) < qtd)
                    return message.channel.send(`❌ Precisa de ${qtd} drone(s)!`);
            } else {
                if ((exercito[tropa] || 0) < qtd) return message.channel.send(`❌ Tropas insuficientes!`);
            }
        }

        const generais = pais.generais || [];
        const general = generais.length > 0 ? generais[Math.floor(Math.random() * generais.length)] : null;
        const bonusGeneral = general ? general.bonus : 1.0;
        const doutrina = DOUTRINAS[pais.doutrinaMilitar] || { bonusAtaque: 1, bonusDefesa: 1 };
        const basesNoAlvo = (pais.bases_militares || []).filter((b) => b.pais === alvo);
        let bonusBases = 1.0;
        if (basesNoAlvo.length > 0)
            bonusBases = basesNoAlvo.reduce((max, b) => Math.max(max, TIPOS_BASES[b.tipo]?.bonus || 1), 1);
        const suprimentoOk = basesNoAlvo.length > 0 ? basesNoAlvo.some((b) => b.suprimento > 30) : true;

        const poderAtacante =
            calcularPoderOperacao(pais, tipoOperacao) *
            bonusGeneral *
            doutrina.bonusAtaque *
            bonusBases *
            (suprimentoOk ? 1.0 : 0.6);
        const poderDefensor = calcularPoderDefesa(paisAlvo) * 1.3;
        const poderFinalDefensor = Math.random() < 0.3 ? poderDefensor * 1.3 : poderDefensor;
        const vitoria = poderAtacante > poderFinalDefensor;

        let perdaAtacante = Math.floor((Number(exercito.infantaria) || 0) * (vitoria ? 0.04 : 0.1));
        let perdaDefensor = Math.floor((Number(paisAlvo.exercito?.infantaria) || 0) * (vitoria ? 0.12 : 0.05));
        let baixasCivis = Math.floor((Number(paisAlvo.populacao) || 0) * (vitoria ? 0.008 : 0.003));
        let danoInfra = tipoOperacao === 'bombardeio_aereo' || tipoOperacao === 'bombardeio_nuclear' ? 2 : 0.5;

        if (tipoOperacao === 'ataque_drones') {
            const arsenalDrones = pais.arsenal_drones || {};
            const dronesUsados = Math.floor(Math.random() * 15) + 10;
            let restantes = dronesUsados;
            for (const tipo of ['drone_fpv', 'drone_shahed', 'drone_bayraktar']) {
                if (restantes <= 0) break;
                const disp = arsenalDrones[tipo] || 0;
                const usar = Math.min(disp, restantes);
                if (usar > 0) {
                    db.subtract(`pais_${nomePais}.arsenal_drones.${tipo}`, usar);
                    restantes -= usar;
                }
            }
            const danoDrone = dronesUsados * 500;
            db.subtract(`pais_${alvo}.exercito.infantaria`, danoDrone);
            db.subtract(`pais_${alvo}.infraestrutura`, Math.floor(dronesUsados / 10));
            db.subtract(`pais_${alvo}.populacao`, danoDrone);
            db.add(`pais_${alvo}.inflacao`, 0.05);
            perdaAtacante = 0;
            perdaDefensor = danoDrone;
            baixasCivis = danoDrone;
            danoInfra = Math.floor(dronesUsados / 10);
        }

        db.subtract(`pais_${nomePais}.tesouro`, op.custo);
        if (tipoOperacao !== 'ataque_drones') db.subtract(`pais_${nomePais}.exercito.infantaria`, perdaAtacante);
        db.subtract(`pais_${alvo}.exercito.infantaria`, perdaDefensor);
        db.subtract(`pais_${alvo}.populacao`, baixasCivis);
        db.subtract(`pais_${alvo}.infraestrutura`, danoInfra);
        if (tipoOperacao === 'bombardeio_nuclear') {
            db.subtract(`pais_${nomePais}.arsenal_nuclear.ogiva_base`, 1);
            db.subtract(`pais_${alvo}.infraestrutura`, 3);
            db.subtract(`pais_${alvo}.populacao`, Math.floor((paisAlvo.populacao || 0) * 0.05));
        }

        romperAcordos(nomePais, alvo);
        if (!vitoria) {
            db.add(`pais_${nomePais}.inflacao`, 0.03);
            db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 10);
            db.subtract(`pais_${nomePais}.aprovacaoPopular`, 8);
        } else {
            db.add(`pais_${nomePais}.reputacaoDiplomatica`, 5);
        }

        if (general) {
            const idx = generais.indexOf(general);
            if (vitoria) generais[idx].vitorias++;
            else generais[idx].derrotas++;
            db.set(`pais_${nomePais}.generais`, generais);
        }
        if (basesNoAlvo.length > 0) {
            basesNoAlvo.forEach((b) => {
                b.suprimento = Math.max(0, (b.suprimento || 100) - 15);
            });
            db.set(`pais_${nomePais}.bases_militares`, pais.bases_militares);
        }

        const progresso = vitoria ? Math.floor(Math.random() * 25) + 60 : Math.floor(Math.random() * 20) + 15;
        let guerras = db.get('guerras_ativas') || [];
        const idxExistente = guerras.findIndex(
            (g) => (g.atacante === nomePais && g.defensor === alvo) || (g.atacante === alvo && g.defensor === nomePais)
        );

        const guerraAnterior = idxExistente >= 0 ? guerras[idxExistente] : null;
        let guerraData = criarGuerra({
            ...(guerraAnterior || {}),
            atacante: nomePais,
            defensor: alvo,
            tipo: tipoOperacao,
            progresso: idxExistente >= 0 ? Math.min(100, progresso + (guerraAnterior.progresso || 0)) : progresso,
            inicio: guerraAnterior?.inicio || Date.now(),
            general: general?.nome || guerraAnterior?.general || 'Comando Central',
            baixasAtacante: (guerraAnterior?.baixasAtacante || 0) + perdaAtacante,
            baixasDefensor: (guerraAnterior?.baixasDefensor || 0) + perdaDefensor,
            baixasCivis: (guerraAnterior?.baixasCivis || 0) + baixasCivis,
            casusBelli: guerraAnterior?.casusBelli || args.slice(3).join(' ') || undefined,
            objetivos: guerraAnterior?.objetivos || [args[4] || 'conquista_territorial'],
            ocupacao: guerraAnterior?.ocupacao || { percentual: 0, territorios: [] },
            bases: {
                atacante: (pais.bases_militares || []).filter((base) => base.pais === alvo),
                defensor: (paisAlvo.bases_militares || []).filter((base) => base.pais === nomePais)
            }
        });

        guerraData = registrarBatalha(guerraData, {
            atacante: nomePais,
            defensor: alvo,
            vencedor: vitoria ? nomePais : alvo,
            tipo: tipoOperacao,
            poderAtacante: Math.floor(poderAtacante),
            poderDefensor: Math.floor(poderFinalDefensor),
            perdaAtacante,
            perdaDefensor,
            baixasCivis,
            danoInfra,
            progressoGanho: vitoria ? Math.floor(progresso / 10) : 0,
            progressoGanho: vitoria ? Math.max(1, Math.floor(progresso / 10)) : 0,
            resultado: vitoria ? 'vitoria' : 'resistencia'
        });

        if (idxExistente >= 0) guerras[idxExistente] = guerraData;
        else guerras.push(guerraData);
        db.set('guerras_ativas', guerras);

        const reacao = await reagirGuerra(client, nomePais, alvo, vitoria, tipoOperacao);
        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;
        const noticia = {
            titulo: vitoria ? `${op.emoji} Vitória!` : `💥 Combate Intenso!`,
            descricao: vitoria ? `**${nomeFormal}** venceu **${nomeAlvo}**!` : `**${nomeAlvo}** resistiu!`,
            tipo: 'militar',
            impacto: 'negativo',
            timestamp: Date.now(),
            pais: nomePais
        };

        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomePais, noticia);
            engine.publicarNoticiaNacional(alvo, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${op.emoji} Relatório de Batalha`)
            .setColor(vitoria ? 0x00ff00 : 0xff0000)
            .setDescription(vitoria ? `✅ Vitória!` : `❌ Resistência!`)
            .addFields({
                name: '💀 Baixas',
                value: `Suas: ${perdaAtacante.toLocaleString('pt-BR')}\nInimigo: ${perdaDefensor.toLocaleString('pt-BR')}`,
                inline: true
            })
            .addFields({ name: '👥 Civis', value: baixasCivis.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '🏗️ Infra', value: `-${danoInfra}`, inline: true })
            .addFields({ name: '🎖️ Comandante', value: general?.nome || 'Nenhum', inline: true })
            .addFields({ name: '📊 Progresso', value: `${guerraData.progresso}%`, inline: true })
            .addFields({ name: '🌍 Reação', value: reacao, inline: false })
            .setFooter({ text: 'Alto Comando • OneBot' })
            .setTimestamp();
        const resposta = { embeds: [embed] };
        try {
            const mapa = await renderizarFront(guerraData, pais, paisAlvo);
            resposta.files = [new Discord.AttachmentBuilder(mapa, 'batalha.png')];
            embed.setImage('attachment://batalha.png');
        } catch (error) {
            console.error('[OperacaoMilitar] Falha ao gerar Canvas da batalha:', error);
        }
        return message.channel.send(resposta);
    }

    // ================= BOMBARDEIO NUCLEAR =================
    if (subcmd === 'bombardear' || subcmd === 'nuclear') {
        const alvo = (args[1] || '').toLowerCase();
        const tipoOgiva = (args[2] || 'ogiva_base').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar bombardear <país> [tipo_ogiva]\``);
        if (alvo === nomePais) return message.channel.send(`❌ Não pode bombardear seu próprio país!`);

        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);

        const arsenal = pais.arsenal_nuclear || {};
        const ogivasTipos = {
            ogiva_base: { nome: 'Fissão (Tipo A)', poder: 1, chave: 'ogiva_base' },
            ogiva_avancada: { nome: 'Termonuclear (Tipo B)', poder: 10, chave: 'ogiva_avancada' },
            ogiva_hidrogenio: { nome: 'Hidrogênio (Tipo C)', poder: 100, chave: 'ogiva_hidrogenio' },
            missil_icbm: { nome: 'Míssil ICBM', poder: 50, chave: 'missil_icbm' }
        };

        if (!ogivasTipos[tipoOgiva]) {
            let opcoes = '';
            for (const [k, v] of Object.entries(ogivasTipos)) {
                opcoes += `${(arsenal[v.chave] || 0) > 0 ? '✅' : '❌'} **${v.nome}** (\`${k}\`) - ${arsenal[v.chave] || 0} disponíveis\n`;
            }
            return message.channel.send(`❌ Tipo inválido!\n${opcoes}`);
        }

        const ogiva = ogivasTipos[tipoOgiva];
        if ((arsenal[ogiva.chave] || 0) <= 0) return message.channel.send(`❌ Sem ogivas ${ogiva.nome}!`);

        const confirmMsg = await message.channel.send(
            `☢️ **CONFIRMAR ATAQUE NUCLEAR**\n${ogiva.nome} contra **${alvo}**!\nDigite \`CONFIRMAR\` em 30s.`
        );
        try {
            await message.channel.awaitMessages(
                (m) => m.author.id === userId && m.content.toUpperCase() === 'CONFIRMAR',
                { max: 1, time: 30000, errors: ['time'] }
            );
        } catch {
            return confirmMsg.edit('⏰ Cancelado.');
        }

        const mortos = Math.floor((paisAlvo.populacao || 0) * 0.05 * ogiva.poder);
        db.subtract(`pais_${nomePais}.arsenal_nuclear.${ogiva.chave}`, 1);
        db.subtract(`pais_${alvo}.populacao`, mortos);
        db.subtract(`pais_${alvo}.infraestrutura`, Math.min(5, ogiva.poder * 0.5));
        db.subtract(`pais_${nomePais}.reputacaoDiplomatica`, 50);
        db.add(`pais_${alvo}.inflacao`, 0.2);
        romperAcordos(nomePais, alvo);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;
        const noticia = {
            titulo: '☢️ ATAQUE NUCLEAR!',
            descricao: `**${nomeFormal}** lançou **${ogiva.nome}** contra **${nomeAlvo}**!\n💀 ${mortos.toLocaleString('pt-BR')} mortos.\n🌍 Mundo em choque!`,
            tipo: 'militar',
            impacto: 'negativo',
            timestamp: Date.now(),
            pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomePais, noticia);
            engine.publicarNoticiaNacional(alvo, noticia);
        }

        return confirmMsg.edit({
            content: null,
            embed: new Discord.EmbedBuilder()
                .setTitle('☢️ Ataque Nuclear!')
                .setColor('#992d22')
                .setDescription(`${ogiva.nome} lançada!`)
                .addFields({ name: '💀 Mortos', value: mortos.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '🌍 Reputação', value: '-50', inline: true })
        });
    }

    // ================= ESTABELECER BASE =================
    if (subcmd === 'estabelecer-base' || subcmd === 'base') {
        const alvo = (args[1] || '').toLowerCase();
        const tipoBase = (args[2] || 'posto_avancado').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar estabelecer-base <país> [tipo]\``);
        if (!TIPOS_BASES[tipoBase]) return message.channel.send(`❌ Tipos: ${Object.keys(TIPOS_BASES).join(', ')}`);

        const baseInfo = TIPOS_BASES[tipoBase];
        const tesouro = Number(pais.tesouro) || 0;
        if (tesouro < baseInfo.custo) return message.channel.send(`❌ Tesouro insuficiente!`);
        if ((exercito.infantaria || 0) < 5000) return message.channel.send(`❌ Precisa de 5.000 infantaria!`);

        const bases = pais.bases_militares || [];
        if (bases.find((b) => b.pais === alvo)) return message.channel.send(`❌ Já tem base em ${alvo}!`);

        db.subtract(`pais_${nomePais}.tesouro`, baseInfo.custo);
        db.subtract(`pais_${nomePais}.exercito.infantaria`, 5000);
        bases.push({
            nome: `${baseInfo.nome} ${nomePais}`,
            tipo: tipoBase,
            pais: alvo,
            tropas: 5000,
            suprimento: 100,
            criadaEm: Date.now()
        });
        db.set(`pais_${nomePais}.bases_militares`, bases);

        return message.channel.send(
            `${baseInfo.emoji} **Base estabelecida em ${alvo}!**\n👥 5.000 tropas\n⚔️ Bônus: +${((baseInfo.bonus - 1) * 100).toFixed(0)}%`
        );
    }

    // ================= VER BASES =================
    if (subcmd === 'bases') {
        const bases = pais.bases_militares || [];
        if (bases.length === 0) return message.channel.send(`🏕️ Nenhuma base.`);
        const embed = new Discord.EmbedBuilder().setTitle(`🏕️ Bases — ${nomeFormal}`).setColor(0x006400);
        bases.forEach((b, i) => {
            embed.addFields({
                name: `${TIPOS_BASES[b.tipo]?.emoji || '🏕️'} Base #${i + 1}`,
                value: `📍 ${b.pais}\n👥 ${(b.tropas || 0).toLocaleString('pt-BR')}\n⛽ ${b.suprimento || 0}%`,
                inline: true
            });
        });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= SUPRIR BASE =================
    if (subcmd === 'suprir') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar suprir <país>\``);
        const bases = pais.bases_militares || [];
        const base = bases.find((b) => b.pais === alvo);
        if (!base) return message.channel.send(`❌ Nenhuma base em ${alvo}!`);
        if ((pais.tesouro || 0) < 50000) return message.channel.send(`❌ Tesouro insuficiente!`);

        db.subtract(`pais_${nomePais}.tesouro`, 50000);
        base.suprimento = Math.min(100, base.suprimento + 40);
        db.set(`pais_${nomePais}.bases_militares`, bases);
        return message.channel.send(`📦 Base em ${alvo} reabastecida! ⛽ ${base.suprimento}%`);
    }

    // ================= CORTAR SUPRIMENTOS =================
    if (subcmd === 'cortar-suprimentos') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar cortar-suprimentos <país>\``);
        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);
        const basesInimigas = paisAlvo.bases_militares || [];
        if (basesInimigas.length === 0) return message.channel.send(`❌ ${alvo} não tem bases.`);

        basesInimigas.forEach((b) => {
            b.suprimento = Math.max(0, (b.suprimento || 0) - 30);
        });
        db.set(`pais_${alvo}.bases_militares`, basesInimigas);
        db.subtract(`pais_${nomePais}.exercito.infantaria`, Math.floor((exercito.infantaria || 0) * 0.05));
        return message.channel.send(`🔪 Suprimentos de ${alvo} cortados! -30% em ${basesInimigas.length} bases.`);
    }

    // ================= FRONT DE BATALHA =================
    if (subcmd === 'front' || subcmd === 'status') {
        const alvo = args[1]?.toLowerCase();
        const guerras = db.get('guerras_ativas') || [];
        const minhasGuerras = alvo
            ? guerras.filter(
                  (g) =>
                      (g.atacante === nomePais && g.defensor === alvo) ||
                      (g.defensor === nomePais && g.atacante === alvo)
              )
            : guerras.filter((g) => g.atacante === nomePais || g.defensor === nomePais);

        if (minhasGuerras.length === 0) return message.channel.send(`🕊️ Nenhum conflito ativo.`);

        for (const g of minhasGuerras) {
            const lado = g.atacante === nomePais ? '⚔️ OFENSIVA' : '🛡️ DEFENSIVA';
            const inimigo = g.atacante === nomePais ? g.defensor : g.atacante;
            const paisInimigo = db.get(`pais_${inimigo}`);
            const dadosInimigo = getDadosPais(inimigo);
            const nomeInimigo = dadosInimigo ? `${dadosInimigo.bandeira} ${dadosInimigo.nomeFormal}` : inimigo;

            const guerraAtual = normalizarGuerra(g);
            const progresso = guerraAtual.progresso || 0;
            const barra = '🟩'.repeat(Math.floor(progresso / 10)) + '⬜'.repeat(10 - Math.floor(progresso / 10));

            let statusGuerra, corStatus;
            if (progresso >= 80) {
                statusGuerra = '🏴 Vitória Iminente';
                corStatus = 0x00ff00;
            } else if (progresso >= 50) {
                statusGuerra = '⚔️ Avançando';
                corStatus = 0x000080;
            } else if (progresso >= 25) {
                statusGuerra = '🔥 Combates Intensos';
                corStatus = 0xffa500;
            } else {
                statusGuerra = '🛡️ Resistência';
                corStatus = 0xff0000;
            }

            const poderMeu = calcularPoderMilitar(pais);
            const poderInimigo = paisInimigo ? calcularPoderMilitar(paisInimigo) : 0;
            const razao = poderInimigo > 0 ? poderMeu / poderInimigo : 99;
            const estimativa = razao > 2 ? '✅ Favorável' : razao > 1 ? '⚠️ Equilibrada' : '🔴 Desfavorável';

            const exMeu = pais.exercito || {};
            const exInimigo = paisInimigo?.exercito || {};
            const minhasBases = (pais.bases_militares || []).filter((b) => b.pais === inimigo);
            const basesInimigas = (paisInimigo?.bases_militares || []).filter((b) => b.pais === nomePais);
            const duracaoDias = Math.max(0, Math.floor((Date.now() - (g.inicio || Date.now())) / 86400000));
            const situacao = progresso > 55 ? '🟢 Avançando' : progresso < 45 ? '🔴 Recuando' : '🟡 Equilibrado';
            const frentesAtivos = Math.max(
                1,
                Number(g.frentesAtivos) || minhasBases.length + basesInimigas.length || 1
            );

            const embed = new Discord.EmbedBuilder()
                .setTitle(`🗺️ Sala de Guerra — ${inimigo.toUpperCase()}`)
                .setColor(corStatus)
                .setDescription(
                    `**${nomeFormal}** vs **${nomeInimigo}**\n📋 ${statusGuerra} | 📊 ${estimativa} (${razao.toFixed(2)}x)`
                )
                .addFields({
                    name: '📊 Pontuação de guerra',
                    value: `🔵 ${guerraAtual.atacante}: ${guerraAtual.pontuacao.atacante}%\n🔴 ${guerraAtual.defensor}: ${guerraAtual.pontuacao.defensor}%\n${barra}`,
                    inline: false
                })
                .addFields({
                    name: '📜 Casus Belli / objetivo',
                    value: `${guerraAtual.casusBelli}\n🎯 ${(guerraAtual.objetivos || []).join(', ')}`,
                    inline: true
                })
                .addFields({
                    name: '⚔️ Situação',
                    value: `${situacao}\n📍 ${frentesAtivos} front(s) ativo(s)\n⏱️ ${duracaoDias} dia(s)`,
                    inline: true
                })
                .addFields({
                    name: '💀 Baixas',
                    value: `🔵 ${(g.baixasAtacante || 0).toLocaleString('pt-BR')}\n🔴 ${(g.baixasDefensor || 0).toLocaleString('pt-BR')}\n👥 Civis: ${(g.baixasCivis || 0).toLocaleString('pt-BR')}`,
                    inline: true
                })
                .addFields({ name: '🏙️ Cidades controladas', value: 'Não registrado no sistema', inline: true })
                .addFields({
                    name: '🪖 Nossas Tropas',
                    value: `🪖 ${(exMeu.infantaria || 0).toLocaleString('pt-BR')}\n🚗 ${(exMeu.tanques || 0).toLocaleString('pt-BR')}\n✈️ ${(exMeu.avioes || 0).toLocaleString('pt-BR')}\n🚢 ${(exMeu.navios || 0).toLocaleString('pt-BR')}`,
                    inline: true
                })
                .addFields({
                    name: '🪖 Tropas Inimigas',
                    value: `🪖 ${(exInimigo.infantaria || 0).toLocaleString('pt-BR')}\n🚗 ${(exInimigo.tanques || 0).toLocaleString('pt-BR')}\n✈️ ${(exInimigo.avioes || 0).toLocaleString('pt-BR')}\n🚢 ${(exInimigo.navios || 0).toLocaleString('pt-BR')}`,
                    inline: true
                })
                .addFields({
                    name: '🏕️ Bases',
                    value: `🟢 Nossas: ${minhasBases.length} em ${inimigo}\n🔴 Inimigas: ${basesInimigas.length} aqui`,
                    inline: true
                })
                .addFields({
                    name: '⚡ Ações',
                    value: `\`B!operacao-militar atacar ${inimigo}\`\n\`B!operacao-militar estabelecer-base ${inimigo}\`\n\`B!drones atacar ${inimigo} drone_shahed 50\``,
                    inline: false
                })
                .setFooter({ text: 'Alto Comando • Sala de Guerra' })
                .setTimestamp();

            const mapa = await renderizarFront(g, pais, paisInimigo || {});
            embed.attachFiles([new Discord.AttachmentBuilder(mapa, 'front.png')]);
            embed.setImage('attachment://front.png');
            return message.channel.send({ embeds: [embed] });
        }
    }

    // ================= PAZ BRANCA =================
    if (subcmd === 'paz-branca') {
        const alvo = (args[1] || '').toLowerCase();
        const guerras = db.get('guerras_ativas') || [];
        const indiceGuerra = guerras.findIndex(
            (g) => (g.atacante === nomePais && g.defensor === alvo) || (g.defensor === nomePais && g.atacante === alvo)
        );
        if (indiceGuerra < 0) return message.channel.send('❌ Nenhuma guerra ativa encontrada contra esse país.');
        const guerra = normalizarGuerra(guerras[indiceGuerra]);
        const proposta = guerra.propostasPaz.find((item) => item.tipo === 'paz_branca' && item.status === 'pendente');
        if (args[2] === 'aceitar' || args[2] === 'recusar') {
            if (!proposta || proposta.para !== nomePais)
                return message.channel.send('❌ Não há proposta pendente para este país.');
            proposta.status = args[2] === 'aceitar' ? 'aceita' : 'recusada';
            if (proposta.status === 'aceita') {
                guerra.status = 'paz_branca';
                guerras.splice(indiceGuerra, 1);
            } else guerras[indiceGuerra] = guerra;
            db.set('guerras_ativas', guerras);
            return message.channel.send(
                proposta.status === 'aceita'
                    ? '🕊️ Paz Branca aceita. O conflito foi encerrado.'
                    : '⚔️ Paz Branca recusada. A guerra continua.'
            );
        }
        if (proposta) return message.channel.send('⚠️ Já existe uma proposta de Paz Branca pendente.');
        if (guerra.pontuacao.atacante < 35 || guerra.pontuacao.atacante > 65)
            return message.channel.send('❌ A situação não está equilibrada o suficiente para Paz Branca.');
        guerra.propostasPaz.push({
            tipo: 'paz_branca',
            de: nomePais,
            para: alvo,
            status: 'pendente',
            criadaEm: Date.now()
        });
        guerras[indiceGuerra] = guerra;
        db.set('guerras_ativas', guerras);
        return message.channel.send(
            `🕊️ Proposta de Paz Branca enviada para **${alvo}**. Use \`B!operacao-militar paz-branca ${nomePais} aceitar\` para aceitar.`
        );
    }

    // ================= CAPITULAÇÃO =================
    if (subcmd === 'capitular') {
        const alvo = (args[1] || '').toLowerCase();
        const guerras = db.get('guerras_ativas') || [];
        const indiceGuerra = guerras.findIndex((g) => g.defensor === nomePais && g.atacante === alvo);
        if (indiceGuerra < 0) return message.channel.send('❌ Nenhuma guerra ofensiva encontrada contra este país.');
        const guerra = normalizarGuerra(guerras[indiceGuerra]);
        if (guerra.pontuacao.defensor > 20)
            return message.channel.send('❌ A capacidade de resistência ainda não está crítica para capitulação.');
        guerra.status = 'capitulada';
        guerra.capitulacao = { por: nomePais, perante: alvo, em: Date.now() };
        guerra.conferenciaPaz = { status: 'pendente', vencedor: alvo, derrotado: nomePais, exigencias: [] };
        guerras[indiceGuerra] = guerra;
        db.set('guerras_ativas', guerras);
        return message.channel.send(
            `🏳️ **${nomePais}** capitulou perante **${alvo}**. A Conferência de Paz foi aberta.`
        );
    }

    // ================= CONFERÊNCIA DE PAZ =================
    if (subcmd === 'conferencia-paz') {
        const alvo = (args[1] || '').toLowerCase();
        const acao = (args[2] || '').toLowerCase();
        const exigenciaSolicitada = (args[3] || '').toLowerCase();
        const exigenciasValidas = new Set(['reparacoes', 'desmilitarizacao', 'cessao_territorial', 'vassalagem']);
        const guerras = db.get('guerras_ativas') || [];
        const indiceGuerra = guerras.findIndex(
            (g) =>
                g.conferenciaPaz &&
                ((g.conferenciaPaz.vencedor === nomePais && g.conferenciaPaz.derrotado === alvo) ||
                    (g.conferenciaPaz.derrotado === nomePais && g.conferenciaPaz.vencedor === alvo))
        );
        if (indiceGuerra < 0) return message.channel.send('❌ Nenhuma Conferência de Paz encontrada.');
        const guerra = normalizarGuerra(guerras[indiceGuerra]);
        if (nomePais !== guerra.conferenciaPaz.vencedor) {
            if (acao !== 'aceitar' && acao !== 'recusar') return message.channel.send('❌ Use `aceitar` ou `recusar`.');
            if (acao === 'recusar')
                return message.channel.send('⚔️ As exigências foram recusadas; a conferência continua aberta.');
            if (!guerra.conferenciaPaz.exigencias.length)
                return message.channel.send('❌ O vencedor ainda não apresentou exigências para esta conferência.');
            const vencedor = guerra.conferenciaPaz.vencedor;
            const derrotado = guerra.conferenciaPaz.derrotado;
            for (const exigencia of guerra.conferenciaPaz.exigencias) {
                if (exigencia.tipo === 'reparacoes') {
                    const tesouroDerrotado = Math.max(0, Number(db.get(`pais_${derrotado}.tesouro`)) || 0);
                    const valor = Math.floor(tesouroDerrotado * 0.1);
                    if (valor > 0) {
                        db.subtract(`pais_${derrotado}.tesouro`, valor);
                        db.add(`pais_${vencedor}.tesouro`, valor);
                    }
                }
                if (exigencia.tipo === 'desmilitarizacao') {
                    const infantaria = Math.max(0, Number(db.get(`pais_${derrotado}.exercito.infantaria`)) || 0);
                    db.subtract(`pais_${derrotado}.exercito.infantaria`, Math.floor(infantaria * 0.2));
                }
                if (exigencia.tipo === 'vassalagem') {
                    db.set(`pais_${derrotado}.controladoPor`, vencedor);
                    db.set(`pais_${derrotado}.governoFantoche`, true);
                    db.set(`pais_${derrotado}.tributoPara`, vencedor);
                }
            }
            guerra.status = 'paz_assinada';
            guerra.conferenciaPaz.status = 'aceita';
            guerra.resultado = { tipo: 'acordo_de_paz', em: Date.now(), exigencias: guerra.conferenciaPaz.exigencias };
            guerras.splice(indiceGuerra, 1);
            db.set('guerras_ativas', guerras);
            const engine = client.paisEngine;
            if (engine) {
                engine.publicarNoticiaGlobal({
                    titulo: '🕊️ Conferência de Paz concluída',
                    descricao: `**${derrotado}** aceitou as condições de paz de **${vencedor}**.`,
                    tipo: 'militar',
                    impacto: 'neutro',
                    timestamp: Date.now(),
                    pais: vencedor
                });
            }
            return message.channel.send('🕊️ Conferência concluída. O conflito foi encerrado.');
        }
        const exigencia = acao === 'exigir' ? exigenciaSolicitada : acao;
        if (!exigenciasValidas.has(exigencia))
            return message.channel.send(
                `❌ Exigência inválida. Opções: ${[...exigenciasValidas].map((item) => `\`${item}\``).join(', ')}`
            );
        if (guerra.conferenciaPaz.exigencias.some((item) => item.tipo === exigencia))
            return message.channel.send('⚠️ Esta exigência já foi apresentada.');
        if (exigencia === 'cessao_territorial' && Number(guerra.ocupacao?.percentual) < 80)
            return message.channel.send('❌ Cessão territorial exige pelo menos 80% de ocupação do teatro registrado.');
        guerra.conferenciaPaz.exigencias.push({ tipo: exigencia, por: nomePais, em: Date.now() });
        guerras[indiceGuerra] = guerra;
        db.set('guerras_ativas', guerras);
        return message.channel.send(
            `📜 Exigência registrada: **${exigencia}**. O país derrotado pode aceitar com \`B!operacao-militar conferencia-paz ${alvo} aceitar\`.`
        );
    }

    // ================= CENTRO DE ESPIONAGEM =================
    if (subcmd === 'espionagem') {
        const quantidadeEspioes = pais.espioes || 0; // ⚡ Agora é NÚMERO!
        const nivelEspiao = pais.nivel_espionagem || 1;
        const inteligencia = pais.inteligencia || 0;
        const inflacao = Number(pais.inflacao) || 0.05;
        const fatorInflacao = 1 + inflacao * 5;
        const tesouro = Number(pais.tesouro) || 0;
        const salario_base = 30000;
        const equipamentos = pais.equipamentos_espionagem || 0;

        const custo_contratacao = Math.floor(salario_base * fatorInflacao);
        const custo_treinamento = Math.floor(quantidadeEspioes * 50000 * fatorInflacao);
        const custo_equipamento = Math.floor(quantidadeEspioes * 75000 * (1 + nivelEspiao * 0.1) * fatorInflacao);
        const salario_total = Math.floor(quantidadeEspioes * salario_base * fatorInflacao);

        // ================= PAINEL =================
        if (!args[1]) {
            const painel = new Discord.EmbedBuilder()
                .setTitle('🕵️ Centro de Inteligência Nacional')
                .setColor(0x00008b)
                .setDescription(`**${nomeFormal}**\n🔋 Inteligência: **${inteligencia.toLocaleString('pt-BR')}** pts`)
                .addFields({
                    name: '🕵️ Espiões',
                    value: `**${quantidadeEspioes.toLocaleString('pt-BR')}** agentes`,
                    inline: true
                })
                .addFields({ name: '🎖️ Experiência', value: `Nv. **${nivelEspiao}**`, inline: true })
                .addFields({ name: '🔭 Equipamentos', value: `Nv. **${equipamentos}**`, inline: true })
                .addFields({
                    name: '💰 Salários',
                    value: `${salario_total.toLocaleString('pt-BR')} moedas/ciclo`,
                    inline: true
                })
                .addFields({
                    name: '💸 Custos de Ação',
                    value:
                        `🕵️ Contratar: **${custo_contratacao.toLocaleString('pt-BR')}**/agente\n` +
                        `📚 Treinar: **${custo_treinamento.toLocaleString('pt-BR')}**\n` +
                        `🛠️ Equipar: **${custo_equipamento.toLocaleString('pt-BR')}**`,
                    inline: false
                })
                .addFields({
                    name: '⚡ Ações',
                    value:
                        '`B!operacao-militar espionagem contratar <qtd>` — Contratar\n' +
                        '`B!operacao-militar espionagem treinar` — Treinar\n' +
                        '`B!operacao-militar espionagem equipar` — Equipar\n' +
                        '`B!operacao-militar espionagem sabotar <país>` — Sabotar',
                    inline: false
                })
                .setFooter({ text: 'Centro de Inteligência Nacional • OneBot' })
                .setTimestamp();
            return message.channel.send({ embeds: [painel] });
        }

        // ================= CONTRATAR =================
        if (args[1] === 'contratar') {
            const qtd = parseInt(args[2]) || 1;
            if (qtd <= 0 || qtd > 100) return message.channel.send('❌ Quantidade: 1-100');

            const custoTotal = Math.floor(qtd * salario_base * fatorInflacao);
            if (tesouro < custoTotal) {
                return message.channel.send(
                    `❌ Tesouro insuficiente!\n💰 Custo: ${custoTotal.toLocaleString('pt-BR')}\n💵 Disponível: ${tesouro.toLocaleString('pt-BR')}`
                );
            }

            db.add(`pais_${nomePais}.espioes`, qtd);
            db.subtract(`pais_${nomePais}.tesouro`, custoTotal);

            const embed = new Discord.EmbedBuilder()
                .setTitle('🕵️ Espiões Contratados')
                .setColor('#2ecc71')
                .setDescription(`${qtd} novos agentes foram recrutados para a inteligência nacional.`)
                .addFields({ name: '🕵️ Contratados', value: qtd.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '💰 Custo', value: custoTotal.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '👥 Total', value: `${quantidadeEspioes + qtd} agentes`, inline: true })
                .setFooter({ text: 'Centro de Inteligência • OneBot' });
            return message.channel.send({ embeds: [embed] });
        }

        // ================= TREINAR =================
        if (args[1] === 'treinar') {
            if (quantidadeEspioes === 0) return message.channel.send('❌ Sem espiões para treinar!');

            const custoTreino = Math.floor(quantidadeEspioes * salario_base * fatorInflacao);
            if (tesouro < custoTreino) {
                return message.channel.send(
                    `❌ Tesouro insuficiente!\n💰 Custo: ${custoTreino.toLocaleString('pt-BR')}\n💵 Disponível: ${tesouro.toLocaleString('pt-BR')}`
                );
            }

            const inteligenciaGanha = Math.floor(quantidadeEspioes * 10 * (1 + nivelEspiao * 0.1));
            const nivelNovo = nivelEspiao + 1;
            const custoProximoNivel = Math.floor(custoTreino * 1.1);

            db.add(`pais_${nomePais}.inteligencia`, inteligenciaGanha);
            db.add(`pais_${nomePais}.nivel_espionagem`, 1);
            db.subtract(`pais_${nomePais}.tesouro`, custoTreino);

            const embed = new Discord.EmbedBuilder()
                .setTitle('📚 Treinamento de Inteligência')
                .setColor(0x00008b)
                .setDescription(
                    `${quantidadeEspioes.toLocaleString('pt-BR')} agentes passaram por treinamento avançado.\n\n*"O conhecimento é a arma mais poderosa." — Sun Tzu*`
                )
                .addFields({
                    name: '🔋 Inteligência',
                    value: `+${inteligenciaGanha.toLocaleString('pt-BR')} pts`,
                    inline: true
                })
                .addFields({ name: '🎖️ Experiência', value: `Nv. ${nivelEspiao} → **${nivelNovo}**`, inline: true })
                .addFields({ name: '💰 Custo', value: custoTreino.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '📈 Próximo Nível', value: custoProximoNivel.toLocaleString('pt-BR'), inline: true })
                .setFooter({ text: 'Academia de Inteligência • OneBot' })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // ================= EQUIPAR =================
        if (args[1] === 'equipar') {
            if (quantidadeEspioes === 0) return message.channel.send('❌ Sem espiões para equipar!');

            const custoEquip = Math.floor(quantidadeEspioes * 75000 * (1 + nivelEspiao * 0.1) * fatorInflacao);
            if (tesouro < custoEquip) {
                return message.channel.send(
                    `❌ Tesouro insuficiente!\n💰 Custo: ${custoEquip.toLocaleString('pt-BR')}\n💵 Disponível: ${tesouro.toLocaleString('pt-BR')}`
                );
            }

            db.add(`pais_${nomePais}.equipamentos_espionagem`, 1);
            db.subtract(`pais_${nomePais}.tesouro`, custoEquip);

            const embed = new Discord.EmbedBuilder()
                .setTitle('🛠️ Equipamentos de Espionagem')
                .setColor(0x006400)
                .setDescription('Novos equipamentos de vigilância e infiltração adquiridos.')
                .addFields({
                    name: '🔭 Equipamentos',
                    value: `Nv. ${equipamentos} → **${equipamentos + 1}**`,
                    inline: true
                })
                .addFields({ name: '💰 Custo', value: custoEquip.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '⚡ Efeito', value: '+5% chance de sucesso em missões', inline: true })
                .setFooter({ text: 'Divisão de Tecnologia • OneBot' })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        if (args[1] === 'infiltrar') {
        }
    }

    // ================= ANEXAR =================
    if (subcmd === 'anexar') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar anexar <país>\``);
        const guerras = db.get('guerras_ativas') || [];
        const guerra = guerras.find((g) => g.atacante === nomePais && g.defensor === alvo && g.progresso >= 80);
        if (!guerra) return message.channel.send(`❌ Precisa de 80%+ de progresso.`);

        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);
        const dadosAlvo = getDadosPais(alvo);
        if (dadosAlvo && client.paisEngine) client.paisEngine.garantirEstruturaPais(alvo, paisAlvo, dadosAlvo);
        const tesouro = Math.floor((paisAlvo.tesouro || 0) * 0.6);
        const populacao = Math.floor((paisAlvo.populacao || 0) * 0.4);
        db.add(`pais_${nomePais}.tesouro`, tesouro);
        db.add(`pais_${nomePais}.populacao`, populacao);
        db.set(`pais_${alvo}.anexadoPor`, nomePais);
        db.set(`pais_${alvo}.controladoPor`, nomePais);
        db.set(`pais_${alvo}.status`, 'anexado');
        db.set(
            'guerras_ativas',
            guerras.filter((g) => !(g.atacante === nomePais && g.defensor === alvo))
        );

        return message.channel.send(
            `🏴 **${dadosAlvo?.nomeFormal || alvo}** anexado!\n💰 +${tesouro.toLocaleString('pt-BR')}\n👥 +${populacao.toLocaleString('pt-BR')}`
        );
    }

    // ================= FANTOCHE =================
    if (subcmd === 'fantoche') {
        const alvo = (args[1] || '').toLowerCase();
        const nomeFantoche = args.slice(2).join(' ');
        if (!nomeFantoche) {
            return message.channel.send(
                `❌ Escolha um nome para o Fantoche. Use: \`B!operacao-militar fantoche <pais> [nome]\` `
            );
        }
        if (!alvo) return message.channel.send(`❌ Use: \`B!operacao-militar fantoche <país> [nome]\``);
        const guerras = db.get('guerras_ativas') || [];
        const guerra = guerras.find((g) => g.atacante === nomePais && g.defensor === alvo && g.progresso >= 70);
        if (!guerra) return message.channel.send(`❌ Precisa de 70%+ de progresso.`);

        db.set(`pais_${alvo}.governoFantoche`, true);
        db.set(`pais_${alvo}.controladoPor`, nomePais);
        db.set(`pais_${alvo}.nomeFantoche`, nomeFantoche);
        db.set(`pais_${alvo}.tributo`, 0.15);
        db.set(`pais_${alvo}.status`, 'fantoche');

        db.set(
            'guerras_ativas',
            guerras.filter((g) => !(g.atacante === nomePais && g.defensor === alvo))
        );

        const dadosAlvo = getDadosPais(alvo);
        return message.channel.send(
            `🎭 **${nomeFantoche}** instalado em **${dadosAlvo?.nomeFormal || alvo}**!\n💸 Tributo: 15%`
        );
    }

    // ================= GENERAIS / DOUTRINA =================
    if (subcmd === 'general') {
        const nomeGeneral = args[1];
        const patente = (args[2] || '').toLowerCase();
        if (!nomeGeneral || !PATENTES[patente])
            return message.channel.send(`❌ Use: \`B!operacao-militar general <nome> <patente>\``);
        const info = PATENTES[patente];
        if ((pais.tesouro || 0) < info.custo) return message.channel.send(`❌ Tesouro insuficiente!`);
        db.subtract(`pais_${nomePais}.tesouro`, info.custo);
        const generais = pais.generais || [];
        generais.push({
            nome: nomeGeneral,
            patente,
            bonus: info.bonus,
            tipo: info.tipo || 'terrestre',
            emoji: info.emoji,
            vitorias: 0,
            derrotas: 0
        });
        db.set(`pais_${nomePais}.generais`, generais);
        return message.channel.send(`${info.emoji} **${nomeGeneral}** nomeado **${info.label}**!`);
    }

    if (subcmd === 'doutrina') {
        const doutrina = (args[1] || '').toLowerCase();
        if (!DOUTRINAS[doutrina]) return message.channel.send(`❌ Doutrinas: ${Object.keys(DOUTRINAS).join(', ')}`);
        if ((pais.tesouro || 0) < 100000) return message.channel.send(`❌ Tesouro insuficiente!`);
        db.subtract(`pais_${nomePais}.tesouro`, 100000);
        db.set(`pais_${nomePais}.doutrinaMilitar`, doutrina);
        return message.channel.send(`${DOUTRINAS[doutrina].emoji} Doutrina **${DOUTRINAS[doutrina].nome}** adotada!`);
    }

    if (subcmd === 'generais') {
        const generais = pais.generais || [];
        if (generais.length === 0) return message.channel.send(`❌ Nenhum general.`);
        let txt = '';
        generais.forEach((g) => {
            txt += `${PATENTES[g.patente]?.emoji} **${g.nome}** - ${PATENTES[g.patente]?.label} (🏆${g.vitorias} 💀${g.derrotas})\n`;
        });
        return message.channel.send(`🎖️ **Oficiais de ${nomeFormal}:**\n${txt}`);
    }
    // ================= LIBERTAR PAÍS =================
    if (subcmd === 'libertar-pais' || subcmd === 'libertar') {
        const alvo = (args[1] || '').toLowerCase();

        if (!alvo) {
            return message.channel.send(`❌ Use: \`B!operacao-militar libertar-pais <país>\``);
        }

        if (alvo === nomePais) {
            return message.channel.send(`❌ Você não pode libertar seu próprio país!`);
        }

        const paisAlvo = db.get(`pais_${alvo}`);

        if (!paisAlvo) {
            return message.channel.send(`❌ País não encontrado.`);
        }

        // Verifica se existe guerra com o país
        const guerras = db.get('guerras_ativas') || [];

        const guerra = guerras.find((g) => g.atacante === nomePais && g.defensor === alvo && g.progresso >= 50);

        // Verifica se o país já está sob seu controle
        const eMeuAnexado = paisAlvo.anexadoPor === nomePais;
        const eMeuFantoche = paisAlvo.controladoPor === nomePais;

        // Pode libertar se:
        // 1. Já é seu país anexado/fantoche
        // OU
        // 2. Existe uma guerra com 50%+ de progresso
        if (!eMeuAnexado && !eMeuFantoche && !guerra) {
            return message.channel.send(
                `❌ Você precisa ter **50%+ de progresso** na guerra contra **${alvo}** para libertá-lo.`
            );
        }

        // Verifica se o país realmente está sob controle
        const estaControlado =
            paisAlvo.status === 'anexado' ||
            paisAlvo.status === 'fantoche' ||
            paisAlvo.anexadoPor === nomePais ||
            paisAlvo.controladoPor === nomePais;

        if (!estaControlado) {
            return message.channel.send(`❌ **${alvo}** não está sob seu controle.`);
        }

        // Remove o controle político
        db.delete(`pais_${alvo}.anexadoPor`);
        db.delete(`pais_${alvo}.controladoPor`);
        db.delete(`pais_${alvo}.governoFantoche`);
        db.delete(`pais_${alvo}.nomeFantoche`);
        db.delete(`pais_${alvo}.tributo`);

        // Restaura o país como soberano
        db.set(`pais_${alvo}.status`, 'soberano');

        // Remove a guerra
        db.set(
            'guerras_ativas',
            guerras.filter((g) => !(g.atacante === nomePais && g.defensor === alvo))
        );

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        // Reputação por libertação
        db.add(`pais_${nomePais}.reputacaoDiplomatica`, 10);
        db.add(`pais_${alvo}.reputacaoDiplomatica`, 15);

        // Notícias
        const noticia = {
            titulo: '🕊️ País Libertado!',
            descricao:
                `**${nomeFormal}** reconheceu a soberania de **${nomeAlvo}** ` +
                `e encerrou seu controle sobre o território.\n\n` +
                `🌍 **${nomeAlvo}** voltou a ser uma nação soberana!`,
            tipo: 'militar',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };

        const engine = client.paisEngine;

        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomePais, noticia);
            engine.publicarNoticiaNacional(alvo, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('🕊️ País Libertado')
            .setColor('#2ecc71')
            .setDescription(`**${nomeAlvo}** foi libertado e voltou a ser uma nação soberana.`)
            .addFields({ name: '🏛️ Novo Status', value: '🌐 Estado Soberano', inline: true })
            .addFields({ name: '📊 Progresso da Guerra', value: `${guerra?.progresso || 50}%`, inline: true })
            .addFields({ name: '🌍 Reputação', value: '+10', inline: true })
            .addFields({
                name: '📜 Consequência',
                value: 'O controle político e o governo fantoche foram removidos.',
                inline: false
            })
            .setFooter({ text: 'Alto Comando • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // Comando inválido
    const subcomandosValidos = new Set([
        'espionagem',
        'atacar',
        'bombardear',
        'estabelecer-base',
        'bases',
        'suprir',
        'cortar-suprimentos',
        'front',
        'status',
        'paz-branca',
        'capitular',
        'conferencia-paz',
        'anexar',
        'fantoche',
        'general',
        'doutrina',
        'generais',
        'info',
        'libertar-pais'
    ]);
    if (!subcomandosValidos.has(subcmd)) {
        return message.channel.send(`❌ Comando inválido. Use \`B!operacao-militar\` para ver o QG.`);
    }
};

// ⚡ FUNÇÕES AUXILIARES
function calcularPoderMilitar(pais) {
    const ex = pais.exercito || {};
    const infantaria = Number(ex.infantaria) || 0;
    const tanques = Number(ex.tanques) || 0;
    const avioes = Number(ex.avioes) || 0;
    const navios = Number(ex.navios) || 0;
    const arsenal = pais.arsenal_nuclear || {};
    const bombas =
        (arsenal.ogiva_base || 0) * 1 +
        (arsenal.ogiva_avancada || 0) * 10 +
        (arsenal.ogiva_hidrogenio || 0) * 100 +
        (arsenal.missil_icbm || 0) * 50;
    const drones = pais.arsenal_drones || {};
    const poderDrones =
        (drones.drone_fpv || 0) * 50 + (drones.drone_shahed || 0) * 500 + (drones.drone_bayraktar || 0) * 2000;
    return Math.floor(infantaria * 1 + tanques * 10 + avioes * 15 + navios * 12 + bombas * 1000 + poderDrones * 1.5);
}

function totalOgivas(pais) {
    const arsenal = pais.arsenal_nuclear || {};
    return ['ogiva_base', 'ogiva_avancada', 'ogiva_hidrogenio', 'missil_icbm'].reduce(
        (total, tipo) => total + (Number(arsenal[tipo]) || 0),
        0
    );
}

function calcularPoderOperacao(pais, tipo) {
    const ex = pais.exercito || {};
    const infantaria = Number(ex.infantaria) || 0;
    const tanques = Number(ex.tanques) || 0;
    const avioes = Number(ex.avioes) || 0;
    const navios = Number(ex.navios) || 0;
    const infra = Number(pais.infraestrutura) || 1;
    switch (tipo) {
        case 'invasao_terrestre':
            return Math.floor((infantaria * 1.5 + tanques * 12) * (1 + infra * 0.05));
        case 'ataque_relampago':
            return Math.floor(tanques * 20 * 1.4);
        case 'bombardeio_aereo':
            return Math.floor(avioes * 25);
        case 'bloqueio_naval':
            return Math.floor(navios * 20);
        case 'defesa_estrategica':
            return Math.floor(infantaria * 2.5);
        case 'bombardeio_nuclear':
            return 999999;
        case 'invasao_anfibia':
            return Math.floor((navios * 15 + infantaria * 0.8) * 1.2);
        case 'cerco_estrategico':
            return Math.floor((infantaria * 1.8 + tanques * 15) * 0.9);
        case 'ataque_drones':
            const drones = pais.arsenal_drones || {};
            const poderDrones =
                (drones.drone_fpv || 0) * 50 + (drones.drone_shahed || 0) * 500 + (drones.drone_bayraktar || 0) * 2000;
            return Math.floor(poderDrones * 1.5);
        default:
            return calcularPoderMilitar(pais);
    }
}

function calcularPoderDefesa(pais) {
    const poderBase = calcularPoderMilitar(pais);
    const infra = Number(pais.infraestrutura) || 1;
    return Math.floor(poderBase * (1 + infra * 0.1) * 1.3);
}

function romperAcordos(pais1, pais2) {
    const rotas1 = db.get(`pais_${pais1}.rotasComerciais`) || [];
    const rotas2 = db.get(`pais_${pais2}.rotasComerciais`) || [];
    db.set(
        `pais_${pais1}.rotasComerciais`,
        rotas1.filter((r) => r.parceiro !== pais2)
    );
    db.set(
        `pais_${pais2}.rotasComerciais`,
        rotas2.filter((r) => r.parceiro !== pais1)
    );
    const aliancas1 = db.get(`pais_${pais1}.aliancas`) || [];
    const aliancas2 = db.get(`pais_${pais2}.aliancas`) || [];
    db.set(
        `pais_${pais1}.aliancas`,
        aliancas1.filter((a) => a !== pais2)
    );
    db.set(
        `pais_${pais2}.aliancas`,
        aliancas2.filter((a) => a !== pais1)
    );
}

async function reagirGuerra(client, atacante, defensor, vitoria, tipo) {
    const reacoes = [];
    const lista = db.get('lista_paises') || [];
    for (const pais of lista) {
        if (pais === atacante || pais === defensor) continue;
        if (Math.random() < 0.35) {
            const paisData = db.get(`pais_${pais}`);
            if (!paisData) continue;
            if (tipo === 'bombardeio_nuclear') {
                reacoes.push('☢️ Condenação global!');
                break;
            }
        }
    }
    return reacoes.length > 0 ? reacoes.join('\n') : '🌐 Observação silenciosa';
}

function criarPainelOperacao(nomePais, pais, paises) {
    const opcoesPaises = paises.slice(0, 25).map((nome) => {
        const dados = getDadosPais(nome);
        return { label: (dados?.nomeFormal || nome).slice(0, 100), value: nome };
    });
    const menu = new StringSelectMenuBuilder()
        .setCustomId(`rpg_operacao:alvo:${nomePais}`)
        .setPlaceholder('Selecione o país-alvo')
        .addOptions(opcoesPaises.length ? opcoesPaises : [{ label: 'Nenhum país disponível', value: 'indisponivel' }]);
    const embed = new EmbedBuilder()
        .setTitle('🎖️ Centro de Operações')
        .setColor(0x34495e)
        .setDescription(
            `**${getDadosPais(nomePais)?.nomeFormal || nomePais}**\n` +
                `Poder militar disponível: **${calcularPoderMilitar(pais).toLocaleString('pt-BR')} pts**\n\n` +
                'Escolha o teatro de operações. O próximo passo exibirá custos, forças exigidas e riscos.'
        );
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function criarSelecaoOperacao(nomePais, alvo, pais) {
    const opcoes = Object.entries(TIPOS_OPERACAO)
        .slice(0, 25)
        .map(([tipo, dados]) => ({
            label: tipo.replace(/_/g, ' ').slice(0, 100),
            value: tipo,
            description: `${dados.custo.toLocaleString('pt-BR')} moedas • ${dados.descricao}`.slice(0, 100)
        }));
    const menu = new StringSelectMenuBuilder()
        .setCustomId(`rpg_operacao:tipo:${nomePais}:${alvo}`)
        .setPlaceholder('Selecione o tipo de operação')
        .addOptions(opcoes);
    const embed = new EmbedBuilder()
        .setTitle(`🎯 Teatro de Operações — ${getDadosPais(alvo)?.nomeFormal || alvo}`)
        .setColor(0xe67e22)
        .setDescription(
            `Poder disponível: **${calcularPoderMilitar(pais).toLocaleString('pt-BR')} pts**\n` +
                'Escolha uma operação para consultar os requisitos antes de confirmar.'
        );
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function criarConfirmacaoOperacao(nomePais, alvo, tipo, pais, paisAlvo) {
    const operacao = TIPOS_OPERACAO[tipo];
    const poderAtacante = calcularPoderOperacao(pais, tipo);
    const poderDefensor = calcularPoderDefesa(paisAlvo);
    const embed = new EmbedBuilder()
        .setTitle(`⚠️ Confirmar ${tipo.replace(/_/g, ' ')}`)
        .setColor(0xc0392b)
        .setDescription(
            `**${getDadosPais(nomePais)?.nomeFormal || nomePais}** atacará **${getDadosPais(alvo)?.nomeFormal || alvo}**.`
        )
        .addFields(
            { name: '💰 Custo', value: `${operacao.custo.toLocaleString('pt-BR')} moedas`, inline: true },
            {
                name: '⚔️ Poder estimado',
                value: `${poderAtacante.toLocaleString('pt-BR')} vs ${poderDefensor.toLocaleString('pt-BR')}`,
                inline: true
            },
            {
                name: '📌 Consequências',
                value: 'A operação pode gerar perdas, dano de infraestrutura, impacto econômico e repercussão diplomática.',
                inline: false
            }
        );
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`rpg_operacao:confirmar:${nomePais}:${alvo}:${tipo}`)
            .setLabel('Confirmar operação')
            .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
            .setCustomId(`rpg_operacao:cancelar:${nomePais}`)
            .setLabel('Cancelar')
            .setStyle(ButtonStyle.Secondary)
    );
    return { embeds: [embed], components: [row] };
}

module.exports.criarPainelOperacao = criarPainelOperacao;
module.exports.criarSelecaoOperacao = criarSelecaoOperacao;
module.exports.criarConfirmacaoOperacao = criarConfirmacaoOperacao;
