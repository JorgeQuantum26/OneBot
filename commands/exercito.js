const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

const CUSTOS_BASE = {
    infantaria: 10,
    tanques: 500,
    avioes: 2000,
    navios: 1500
};

const MANUTENCAO = {
    infantaria: 0.05,
    tanques: 10,
    avioes: 40,
    navios: 30
};

const FORCA = {
    infantaria: 1,
    tanques: 10,
    avioes: 15,
    navios: 12
};

const MAX_RECRUTAMENTO = 100000000;

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = (db.get(`${userId}.pais`) || '').toLowerCase();

    if (!nomePais) return message.channel.send(`❌ Você não possui país.`);

    let paisAlvo = null;
    let nomePaisAlvo = nomePais;
    
    if (args[0] === 'ver' && args[1]) {
        nomePaisAlvo = args[1].toLowerCase();
        paisAlvo = db.get(`pais_${nomePaisAlvo}`);
        if (!paisAlvo) return message.channel.send(`❌ País **${args[1]}** não encontrado.`);
    } else {
        paisAlvo = db.get(`pais_${nomePais}`);
        if (!paisAlvo) return message.channel.send(`❌ País não encontrado.`);
    }

    const pais = paisAlvo;
    const isProprioPais = nomePaisAlvo === nomePais;

    const exercito = pais.exercito || {
        infantaria: 0,
        tanques: 0,
        avioes: 0,
        navios: 0,
        manutencao: 0
    };

    const construcoes = pais.construcoes || {};
    const industria = Number(construcoes.industria?.nivel || construcoes.industria || 0);
    const pesquisa = Number(construcoes.pesquisa?.nivel || construcoes.pesquisa || 0);
    const quartel = Number(construcoes.quartel?.nivel || construcoes.quartel || 0);
    const baseAerea = Number(construcoes.base_aerea?.nivel || construcoes.base_aerea || 0);
    const porto = Number(construcoes.porto_militar?.nivel || construcoes.porto_militar || 0);

    const bonusIndustria = 1 + Math.min(industria * 0.02, 10);
    const bonusPesquisa = 1 + Math.min(pesquisa * 0.015, 5);

    const reducaoManutencao = Math.max(0.1, 1 - Math.min(pesquisa * 0.01, 0.9));

    const infantariaForca = (Number(exercito.infantaria) || 0) * FORCA.infantaria;
    const tanquesForca = (Number(exercito.tanques) || 0) * FORCA.tanques * bonusIndustria;
    const avioesForca = (Number(exercito.avioes) || 0) * FORCA.avioes * bonusIndustria;
    const naviosForca = (Number(exercito.navios) || 0) * FORCA.navios * bonusIndustria;

    const forcaTotal = Math.floor(
        (infantariaForca + tanquesForca + avioesForca + naviosForca) * bonusPesquisa
    );

    const manutencaoBase = Number(exercito.manutencao) || 0;
    const manutencaoReal = Math.floor(manutencaoBase * reducaoManutencao);

    const nivel =
        forcaTotal > 500000 ? '☢️ Superpotência' :
        forcaTotal > 100000 ? '⚔️ Grande Potência' :
        forcaTotal > 10000 ? '🪖 Força Regional' :
        forcaTotal > 1000 ? '🛡️ Defesa Básica' :
        '⚠️ Vulnerável';

    // 🛸 DRONES (adicionar no painel do exército)
const arsenalDrones = pais.arsenal_drones || {};
const totalDrones = Object.values(arsenalDrones).reduce((a, b) => a + b, 0);
const poderDrones = (arsenalDrones.drone_fpv || 0) * 50 + (arsenalDrones.drone_shahed || 0) * 500 + (arsenalDrones.drone_bayraktar || 0) * 2000 + (arsenalDrones.drone_swarm || 0) * 5000;
    const arsenalNuclear = pais.arsenal_nuclear || {};
const ogivas = (Number(arsenalNuclear.ogiva_base) || 0) + 
               (Number(arsenalNuclear.ogiva_avancada) || 0) + 
               (Number(arsenalNuclear.ogiva_hidrogenio) || 0) + 
               (Number(arsenalNuclear.missil_icbm) || 0);
    
    const dados = getDadosPais(nomePaisAlvo);
    const nomeFormal = dados ? `${dados.bandeira} ${dados.nomeFormal}` : nomePaisAlvo;

    const subcmd = args[0];

    // ================= INFO / VER =================
    if (!subcmd || subcmd === 'info' || subcmd === "status" || subcmd === 'ver') {

        const embed = new Discord.EmbedBuilder()
            .setTitle(`⚔️ Forças Armadas — ${nomeFormal}`)
            .setColor('#992d22')

            .addFields({ name: '🪖 Infantaria', value: `${(Number(exercito.infantaria) || 0).toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '🚗 Tanques', value: `${(Number(exercito.tanques) || 0).toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '✈️ Aviões', value: `${(Number(exercito.avioes) || 0).toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '🚢 Navios', value: `${(Number(exercito.navios) || 0).toLocaleString('pt-BR')}`, inline: true })
            .addFields({ name: '🛸 Drones de Combate', value: `🎮 FPV: **${arsenalDrones.drone_fpv || 0}**\n` +
    `💣 Shahed: **${arsenalDrones.drone_shahed || 0}**\n` +
    `🛩️ Bayraktar: **${arsenalDrones.drone_bayraktar || 0}**\n` +
    `🦟 Enxame: **${arsenalDrones.drone_swarm || 0}**\n` +
    `📦 Total: **${totalDrones}**\n` +
    `⚡ Poder: **${poderDrones.toLocaleString('pt-BR')}** pts`, inline: true })
            .addFields({ name: '💣 Arsenal Nuclear', value: `${ogivas} ogivas`, inline: true })

            .addFields({ name: '🔋 Poder Militar', value: `${forcaTotal.toLocaleString('pt-BR')} pts\n🏆 ${nivel}`, inline: true })

            .addFields({ name: '💸 Manutenção', value: `${manutencaoReal.toLocaleString('pt-BR')} moedas/ciclo\n📉 Redução: ${((1 - reducaoManutencao) * 100).toFixed(1)}%`, inline: true })

            .addFields({ name: '🏗️ Bônus Ativos', value: `🏭 Indústria: +${(industria * 2).toFixed(0)}% força\n` +
                `🔬 Pesquisa: +${(pesquisa * 1.5).toFixed(1)}% força\n` +
                `🪖 Quartéis: -${quartel}% custo\n` +
                `✈️ Base Aérea: -${(baseAerea * 2)}% custo aviões\n` +
                `🚢 Porto: -${(porto * 2)}% custo navios`, inline: true })

            .addFields({ name: '📊 Análise Militar', value: forcaTotal > 500000
                    ? "☢️ Domínio militar global. Capacidade de projeção de força em escala mundial."
                    : forcaTotal > 100000
                    ? "⚔️ Forte presença internacional. Potência militar respeitada."
                    : forcaTotal > 10000
                    ? "🪖 Capacidade regional sólida. Defesa territorial garantida."
                    : forcaTotal > 1000
                    ? "🛡️ Defesa básica. Exército funcional para proteção."
                    : "⚠️ Defesa limitada. País vulnerável a ameaças externas.", inline: false });

        if (isProprioPais && pais.aliancas && pais.aliancas.length > 0) {
            const aliadosFormatados = pais.aliancas.map(a => {
                const dadosAliado = getDadosPais(a);
                return dadosAliado ? `${dadosAliado.bandeira} ${dadosAliado.nomeFormal}` : a;
            }).join('\n');
            embed.addFields({ name: '🤝 Aliados Militares', value: aliadosFormatados, inline: false });
        }

        if (isProprioPais) {
            embed.setFooter({ text: `Use B!exercito recrutar <tipo> <quantidade> | B!exercito ver <país>` });
        } else {
            embed.setFooter({ text: `Use B!exercito ver <país> para ver outros exércitos` });
        }
        
        embed.setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= RECRUTAR =================
    if (subcmd === 'recrutar') {
        if (!isProprioPais) {
            return message.channel.send(`❌ Você só pode recrutar para seu próprio país.`);
        }

        if (pais.governador !== userId) {
            return message.channel.send(`❌ Apenas o governador pode recrutar.`);
        }

        const tipo = args[1];
        let qtd = parseInt(args[2]) || 1;

        if (!CUSTOS_BASE[tipo]) {
            return message.channel.send(`❌ Tipos disponíveis: infantaria, tanques, avioes, navios\nExemplo: \`B!exercito recrutar infantaria 1000\``);
        }

        if (qtd <= 0) {
            return message.channel.send(`❌ Quantidade inválida. Mínimo: 1`);
        }

        qtd = Math.min(qtd, MAX_RECRUTAMENTO);

        const atual = Number(exercito[tipo]) || 0;
        const base = CUSTOS_BASE[tipo];
        const tesouro = Number(pais.tesouro) || 0;
        const inflacao = Number(pais.inflacao) || 0.05;

        const fatorQtd = 1 + (atual / 10000);
        const fatorInflacao = 1 + (inflacao * 10);
        const fatorRiqueza = 1 + (tesouro / 10000000);

        let bonusTipo = 1;
        if (tipo === "avioes") bonusTipo = Math.max(0.1, 1 - Math.min(baseAerea * 0.02, 0.9));
        if (tipo === "navios") bonusTipo = Math.max(0.1, 1 - Math.min(porto * 0.02, 0.9));

        const bonusQuartel = Math.max(0.1, 1 - Math.min(quartel * 0.01, 0.9));

        const custoUnitario = Math.floor(
            base *
            fatorQtd *
            fatorInflacao *
            fatorRiqueza *
            bonusQuartel *
            bonusTipo
        );

        const custo = custoUnitario * qtd;

        if (tesouro < custo) {
            return message.channel.send(
                `❌ Tesouro insuficiente.\n\n` +
                `💰 **Custo Total:** ${custo.toLocaleString('pt-BR')} moedas\n` +
                `💵 **Disponível:** ${tesouro.toLocaleString('pt-BR')} moedas\n` +
                `📉 **Falta:** ${(custo - tesouro).toLocaleString('pt-BR')} moedas`
            );
        }

        db.add(`pais_${nomePais}.exercito.${tipo}`, qtd);
        db.subtract(`pais_${nomePais}.tesouro`, custo);
        db.add(`pais_${nomePais}.gastos`, custo);
        db.add(`pais_${nomePais}.exercito.manutencao`, qtd * MANUTENCAO[tipo]);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🪖 Recrutamento Militar')
            .setColor(0x006400)

            .setDescription(
                `O exército de **${nomeFormal}** foi reforçado com **${qtd.toLocaleString('pt-BR')}** novas unidades de **${tipo}**.`
            )

            .addFields({ name: '📦 Quantidade', value: qtd.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💸 Custo Total', value: `${custo.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '💰 Custo Unitário', value: `${custoUnitario.toLocaleString('pt-BR')} moedas`, inline: true })

            .addFields({ name: '⚙️ Fatores Econômicos', value: `📈 Escala: ${fatorQtd.toFixed(2)}x\n` +
                `🔥 Inflação: ${fatorInflacao.toFixed(2)}x\n` +
                `🏦 Riqueza: ${fatorRiqueza.toFixed(2)}x`, inline: true })

            .addFields({ name: '🏗️ Bônus de Construções', value: `🪖 Quartel: -${((1 - bonusQuartel) * 100).toFixed(0)}% custo\n` +
                `✈️ Base Aérea: -${((1 - bonusTipo) * 100).toFixed(0)}% custo aviões\n` +
                `🚢 Porto: -${((1 - bonusTipo) * 100).toFixed(0)}% custo navios`, inline: true })

            .addFields({ name: '📊 Novo Poder Militar', value: `🔋 Força Total: ${forcaTotal.toLocaleString('pt-BR')} pts\n` +
                `🏆 Status: ${nivel}\n` +
                `💸 Nova Manutenção: ${manutencaoReal.toLocaleString('pt-BR')} moedas/ciclo`, inline: false })

            .setFooter({ text: 'Ministério da Defesa • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send(
        `❌ Comando inválido.\n\n` +
        `📋 **Comandos disponíveis:**\n` +
        `\`B!exercito\` - Ver suas forças armadas\n` +
        `\`B!exercito ver <país>\` - Ver exército de outro país\n` +
        `\`B!exercito recrutar <tipo> <quantidade>\` - Recrutar tropas`
    );
};