const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');
const { reduzirPopulacao, aumentarPopulacao } = require('../systems/pais-mutacoes');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`❌ Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`❌ Apenas o governador pode gerenciar fantoches.`);

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;

    // Encontrar todos os fantoches
    const listaPaises = db.get('lista_paises') || [];
    const fantoches = [];
    const anexados = [];

    for (const p of listaPaises) {
        const dados = db.get(`pais_${p}`);
        if (!dados) continue;

        if (dados.controladoPor === nomePais || (dados.governoFantoche && dados.tributoPara === nomePais)) {
            fantoches.push({ nome: p, dados });
        }
        if (dados.anexadoPor === nomePais) {
            anexados.push({ nome: p, dados });
        }
    }

    const subcmd = (args[0] || '').toLowerCase();

    // ================= PAINEL DE FANTOCHES =================
    if (!subcmd || subcmd === 'painel' || subcmd === 'status') {
        const embed = new Discord.EmbedBuilder()
            .setTitle(`🎭 Império de ${nomeFormal}`)
            .setColor('#9b59b6')
            .setDescription(`Gestão de territórios dominados e governos fantoches.`);

        if (fantoches.length > 0) {
            let textoFantoches = '';
            let tributoTotal = 0;

            for (const f of fantoches) {
                const dadosF = getDadosPais(f.nome);
                const nomeF = dadosF ? `${dadosF.bandeira} ${dadosF.nomeFormal}` : f.nome;
                const tributo = (f.dados.tributo || 0.15) * 100;
                const valorTributo = Math.floor((f.dados.tesouro || 0) * (f.dados.tributo || 0.15));
                tributoTotal += valorTributo;
                const tensao = f.dados.tensaoColonial || 0;

                textoFantoches +=
                    `${dadosF?.bandeira || '🏳️'} **${f.dados.nomeFantoche || nomeF}**\n` +
                    `💰 Tributo: ${tributo}% (≈${valorTributo.toLocaleString('pt-BR')} moedas/ciclo)\n` +
                    `👥 Pop: ${(f.dados.populacao || 0).toLocaleString('pt-BR')}\n` +
                    `⚔️ Exército: ${((f.dados.exercito?.infantaria || 0) + (f.dados.exercito?.tanques || 0)).toLocaleString('pt-BR')} tropas\n` +
                    `⚠️ Tensão: ${tensao.toFixed(1)}%\n\n`;
            }

            embed.addFields({ name: `🎭 Fantoches (${fantoches.length})`, value: textoFantoches, inline: false });
            embed.addFields({
                name: '💸 Tributo Total Estimado',
                value: `${tributoTotal.toLocaleString('pt-BR')} moedas/ciclo`,
                inline: true
            });
        } else {
            embed.addFields({ name: '🎭 Fantoches', value: 'Nenhum governo fantoche instalado.', inline: false });
        }

        if (anexados.length > 0) {
            let textoAnexados = '';
            for (const a of anexados) {
                const dadosA = getDadosPais(a.nome);
                const nomeA = dadosA ? `${dadosA.bandeira} ${dadosA.nomeFormal}` : a.nome;
                textoAnexados += `${dadosA?.bandeira || '🏳️'} **${nomeA}** - Integrado ao império\n`;
            }
            embed.addFields({ name: `🏴 Anexados (${anexados.length})`, value: textoAnexados, inline: false });
        }

        embed.addFields({
            name: '⚡ Comandos de Gestão',
            value:
                '`B!fantoches necessidades <país>` — Ver necessidades\n' +
                '`B!fantoches investir <país> <área> <valor>` — Investir\n' +
                '`B!fantoches construir <país> <tipo> <qtd>` — Construir\n' +
                '`B!fantoches programa <país> <prog>` — Saúde\n' +
                '`B!fantoches imposto <país> <%>` — Definir imposto\n' +
                '`B!fantoches doar <país> <valor>` — Doar dinheiro\n' +
                '`B!fantoches pesquisa <país> <tec>` — Pesquisar\n' +
                '`B!fantoches cobrar <país>` — Cobrar tributo\n' +
                '`B!fantoches recrutar <país> <tipo> <qtd>` — Recrutar\n' +
                '`B!fantoches extrair <país> <recurso> <qtd>` — Extrair\n' +
                '`B!fantoches suprimir <país>` — Reprimir revolta\n' +
                '`B!fantoches libertar <país>` — Independência',
            inline: false
        });

        if (fantoches.length > 0 || anexados.length > 0) {
            const todosDominados = [...fantoches.map((f) => f.nome), ...anexados.map((a) => a.nome)];
            embed.addFields({
                name: '🌍 Territórios Dominados',
                value: todosDominados
                    .map((p) => {
                        const d = getDadosPais(p);
                        return d ? `${d.bandeira} ${d.nomeFormal}` : p;
                    })
                    .join('\n'),
                inline: false
            });
        }

        embed.setFooter({
            text: `Império de ${nomeFormal} • ${fantoches.length} fantoches, ${anexados.length} anexados`
        });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= NECESSIDADES DO FANTOCHE =================
    if (subcmd === 'necessidades' || subcmd === 'status-pais') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches necessidades <país>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const dados = fantoche.dados;
        const dadosPais = getDadosPais(alvo);
        const nomeFantoche = dados.nomeFantoche || (dadosPais ? dadosPais.nomeFormal : alvo);
        const bandeira = dadosPais ? dadosPais.bandeira : '🏳️';

        const necessidades = [];
        const urgencias = [];

        const comidaPorPessoa = (dados.comida || 0) / (dados.populacao || 1);
        if (comidaPorPessoa < 1) {
            necessidades.push({
                tipo: '🍞 Fome',
                descricao: `Apenas ${comidaPorPessoa.toFixed(2)} comida/habitante`,
                urgencia: 'alta'
            });
            urgencias.push('fome');
        }

        if ((dados.infraestrutura || 0) < 2) {
            necessidades.push({
                tipo: '🏗️ Infraestrutura',
                descricao: `Nível ${(dados.infraestrutura || 0).toFixed(1)}/5`,
                urgencia: 'media'
            });
        }

        if ((dados.inflacao || 0) > 0.1) {
            necessidades.push({
                tipo: '📈 Inflação Alta',
                descricao: `${(dados.inflacao * 100).toFixed(1)}%`,
                urgencia: 'alta'
            });
            urgencias.push('inflacao');
        }

        if ((dados.tesouro || 0) < 100000) {
            necessidades.push({
                tipo: '💰 Tesouro Crítico',
                descricao: `Apenas ${(dados.tesouro || 0).toLocaleString('pt-BR')} moedas`,
                urgencia: 'alta'
            });
        }

        if ((dados.exercito?.infantaria || 0) < 10000) {
            necessidades.push({ tipo: '🛡️ Indefeso', descricao: 'Exército pequeno', urgencia: 'media' });
        }

        if ((dados.agricultura || 0) < 500) {
            necessidades.push({ tipo: '🌾 Agricultura Fraca', descricao: 'Produção insuficiente', urgencia: 'media' });
        }

        const tensao = Math.min(100, Math.max(0, dados.tensaoColonial || 0));
        if (tensao > 50) {
            necessidades.push({
                tipo: '⚠️ Tensão Colonial',
                descricao: `${tensao.toFixed(1)}% - Risco de revolta!`,
                urgencia: 'critica'
            });
            urgencias.push('tensao');
        }

        const tributo = (dados.tributo || 0.15) * 100;
        const satisfacao = Math.max(0, 100 - tensao - tributo * 1.5);
        const humorPopulacao =
            satisfacao > 70
                ? '😊 Satisfeita'
                : satisfacao > 40
                  ? '😐 Neutra'
                  : satisfacao > 20
                    ? '😟 Descontente'
                    : '🤬 Revoltada';

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${bandeira} Relatório do Fantoche — ${nomeFantoche}`)
            .setColor(tensao > 50 ? 0xff0000 : tensao > 30 ? 0xffa500 : 0x008000)
            .setDescription(
                `**Status:** ${dados.status || 'Fantoche'}\n` +
                    `**Controlado por:** ${nomeFormal}\n` +
                    `**Tributo:** ${tributo}% por ciclo`
            )
            .addFields({
                name: '👥 População',
                value:
                    `${(dados.populacao || 0).toLocaleString('pt-BR')} hab.\n` +
                    `😊 Satisfação: ${satisfacao.toFixed(1)}%\n` +
                    `Humor: ${humorPopulacao}`,
                inline: true
            })
            .addFields({
                name: '💰 Economia',
                value:
                    `Tesouro: ${(dados.tesouro || 0).toLocaleString('pt-BR')}\n` +
                    `Inflação: ${((dados.inflacao || 0) * 100).toFixed(1)}%\n` +
                    `Comida: ${(dados.comida || 0).toLocaleString('pt-BR')}`,
                inline: true
            })
            .addFields({
                name: '⚠️ Tensão Colonial',
                value:
                    '🟥'.repeat(Math.floor(tensao / 10)) +
                    '⬜'.repeat(10 - Math.floor(tensao / 10)) +
                    '\n' +
                    `${tensao.toFixed(1)}%`,
                inline: true
            });

        if (necessidades.length > 0) {
            const textoNecessidades = necessidades
                .map(
                    (n) =>
                        `${n.urgencia === 'critica' ? '🚨' : n.urgencia === 'alta' ? '🔴' : '🟡'} **${n.tipo}**\n${n.descricao}`
                )
                .join('\n\n');
            embed.addFields({ name: '📋 Necessidades Detectadas', value: textoNecessidades, inline: false });
        } else {
            embed.addFields({
                name: '✅ Status',
                value: 'População estável, sem necessidades urgentes.',
                inline: false
            });
        }

        if (urgencias.length > 0) {
            const sugestoes = [];
            if (urgencias.includes('fome')) sugestoes.push('`B!fantoches investir ' + alvo + ' comida 1000000`');
            if (urgencias.includes('inflacao')) sugestoes.push('`B!fantoches investir ' + alvo + ' infraestrutura 1`');
            if (urgencias.includes('tensao'))
                sugestoes.push(
                    '`B!fantoches reduzir-tributo ' +
                        alvo +
                        ' 5` ou `B!fantoches investir ' +
                        alvo +
                        ' estabilidade 20`'
                );
            embed.addFields({ name: '💡 Sugestões de Ação', value: sugestoes.join('\n'), inline: false });
        }

        embed.setFooter({ text: `Gerencie com B!fantoches | ${new Date().toLocaleString('pt-BR')}` });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= COBRAR TRIBUTO =================
    if (subcmd === 'cobrar') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches cobrar <país>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tributo = fantoche.dados.tributo || 0.15;
        const valor = Math.floor((fantoche.dados.tesouro || 0) * tributo);

        if (valor <= 0) return message.channel.send(`❌ ${alvo} não tem recursos para pagar tributo.`);

        db.subtract(`pais_${alvo}.tesouro`, valor);
        db.add(`pais_${nomePais}.tesouro`, valor);

        if (Math.random() < 0.2) {
            db.add(`pais_${alvo}.tensaoColonial`, Math.random() * 10 + 5);
        }

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        return message.channel.send(
            `💸 **Tributo Cobrado!**\n` +
                `${nomeAlvo} pagou **${valor.toLocaleString('pt-BR')}** moedas para ${nomeFormal}.`
        );
    }

    // ================= AUMENTAR TRIBUTO =================
    if (subcmd === 'aumentar-tributo') {
        const alvo = (args[1] || '').toLowerCase();
        const aumento = parseInt(args[2]) || 5;

        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches aumentar-tributo <país> <%>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tributoAtual = (fantoche.dados.tributo || 0.15) * 100;
        const novoTributo = Math.min(50, tributoAtual + aumento);

        db.set(`pais_${alvo}.tributo`, novoTributo / 100);
        db.add(`pais_${alvo}.tensaoColonial`, aumento * 2);

        return message.channel.send(
            `📈 **Tributo Aumentado!**\n` +
                `${alvo}: ${tributoAtual}% → **${novoTributo}%**\n` +
                `⚠️ Tensão colonial +${aumento * 2}%`
        );
    }

    // ================= REDUZIR TRIBUTO =================
    if (subcmd === 'reduzir-tributo') {
        const alvo = (args[1] || '').toLowerCase();
        const reducao = parseInt(args[2]) || 5;

        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches reduzir-tributo <país> <%>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tributoAtual = (fantoche.dados.tributo || 0.15) * 100;
        const novoTributo = Math.max(1, tributoAtual - reducao);

        db.set(`pais_${alvo}.tributo`, novoTributo / 100);
        db.subtract(`pais_${alvo}.tensaoColonial`, reducao * 2);

        return message.channel.send(
            `📉 **Tributo Reduzido!**\n` +
                `${alvo}: ${tributoAtual}% → **${novoTributo}%**\n` +
                `✅ Tensão colonial -${reducao * 2}%`
        );
    }

    // ================= RECRUTAR NO FANTOCHE =================
    if (subcmd === 'recrutar') {
        const alvo = (args[1] || '').toLowerCase();
        const tipo = args[2];
        const qtd = parseInt(args[3]) || 1000;

        if (!alvo || !tipo)
            return message.channel.send(
                `❌ Use: \`B!fantoches recrutar <país> <infantaria|tanques|avioes|navios> <qtd>\``
            );

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const populacao = fantoche.dados.populacao || 0;
        if (qtd > populacao * 0.01)
            return message.channel.send(
                `❌ População insuficiente! Máximo: ${Math.floor(populacao * 0.01).toLocaleString('pt-BR')}`
            );

        reduzirPopulacao(alvo, qtd);
        db.add(`pais_${nomePais}.exercito.${tipo}`, qtd);
        db.add(`pais_${alvo}.tensaoColonial`, 3);

        return message.channel.send(
            `🪖 **Recrutamento Colonial!**\n` +
                `${qtd.toLocaleString('pt-BR')} ${tipo} recrutados de ${alvo}.\n` +
                `⚠️ Tensão colonial +3%`
        );
    }

    // ================= EXTRAIR RECURSOS =================
    if (subcmd === 'extrair') {
        const alvo = (args[1] || '').toLowerCase();
        const recurso = (args[2] || '').toLowerCase();
        const qtd = parseInt(args[3]) || 0;

        if (!alvo || !['ouro', 'comida', 'madeira', 'pedra', 'dinheiro'].includes(recurso) || !qtd) {
            return message.channel.send(
                `❌ Use: \`B!fantoches extrair <país> <ouro/comida/madeira/pedra/dinheiro> <qtd>\``
            );
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const disponivel = recurso === 'dinheiro' ? fantoche.dados.tesouro || 0 : fantoche.dados[recurso] || 0;
        if (qtd > disponivel)
            return message.channel.send(`❌ ${alvo} só tem ${disponivel.toLocaleString('pt-BR')} de ${recurso}.`);

        if (recurso === 'dinheiro') {
            db.subtract(`pais_${alvo}.tesouro`, qtd);
            db.add(`pais_${nomePais}.tesouro`, qtd);
        } else {
            db.subtract(`pais_${alvo}.${recurso}`, qtd);
            db.add(`pais_${nomePais}.${recurso}`, qtd);
        }

        db.add(`pais_${alvo}.tensaoColonial`, 5);

        return message.channel.send(
            `📦 **Recursos Extraídos!**\n` +
                `${qtd.toLocaleString('pt-BR')} ${recurso} extraídos de ${alvo}.\n` +
                `⚠️ Tensão colonial +5%`
        );
    }

    // ================= INVESTIR NO FANTOCHE =================
    if (subcmd === 'investir') {
        const alvo = (args[1] || '').toLowerCase();
        const area = (args[2] || '').toLowerCase();
        const valor = parseInt(args[3]) || 0;

        const areasValidas = ['comida', 'infraestrutura', 'agricultura', 'exercito', 'estabilidade', 'populacao'];

        if (!alvo || !areasValidas.includes(area) || !valor) {
            return message.channel.send(
                `❌ Use: \`B!fantoches investir <país> <área> <valor>\`\n\n` +
                    `📋 **Áreas:** comida, infraestrutura, agricultura, exercito, estabilidade, populacao`
            );
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tesouroImperial = Number(pais.tesouro) || 0;
        let custo = 0;
        let beneficio = '';

        if (area === 'comida') {
            custo = Math.floor(valor * 0.5);
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${alvo}.comida`, valor);
            beneficio = `+${valor.toLocaleString('pt-BR')} comida`;
        } else if (area === 'infraestrutura') {
            custo = valor * 50000;
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${alvo}.infraestrutura`, valor);
            beneficio = `+${valor} infraestrutura`;
        } else if (area === 'agricultura') {
            custo = Math.floor(valor * 2);
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${alvo}.agricultura`, valor);
            beneficio = `+${valor.toLocaleString('pt-BR')} agricultura`;
        } else if (area === 'exercito') {
            custo = valor * 10;
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.add(`pais_${alvo}.exercito.infantaria`, valor);
            beneficio = `+${valor.toLocaleString('pt-BR')} soldados`;
        } else if (area === 'estabilidade') {
            custo = valor * 1000;
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            db.subtract(`pais_${alvo}.tensaoColonial`, Math.min(valor, fantoche.dados.tensaoColonial || 0));
            beneficio = `-${valor}% tensão`;
        } else if (area === 'populacao') {
            custo = Math.floor(valor * 0.1);
            db.subtract(`pais_${nomePais}.tesouro`, custo);
            aumentarPopulacao(alvo, valor);
            beneficio = `+${valor.toLocaleString('pt-BR')} habitantes`;
        }

        db.add(`pais_${nomePais}.reputacaoDiplomatica`, 2);
        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        return message.channel.send(
            `✅ **Investimento Realizado em ${nomeAlvo}!**\n📦 ${beneficio}\n💰 Custo: ${custo.toLocaleString('pt-BR')} moedas\n🌟 +2 Reputação`
        );
    }

    // ================= CONSTRUIR NO FANTOCHE =================
    if (subcmd === 'construir') {
        const alvo = (args[1] || '').toLowerCase();
        const tipo = (args[2] || '').toLowerCase();
        const qtd = parseInt(args[3]) || 1;

        if (!alvo || !tipo) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('🏗️ Construção em Territórios')
                .setColor('#e67e22')
                .setDescription('Use: `B!fantoches construir <país> <tipo> <quantidade>`')
                .addFields({ name: '🏥 Civil', value: '`hospital` `escola` `fazenda` `banco`', inline: true })
                .addFields({
                    name: '🏭 Industrial',
                    value: '`industria` `usina` `mineradora` `laboratorio`',
                    inline: true
                })
                .addFields({ name: '⚡ Energia', value: '`hidreletrica` `solar` `parque_eolico`', inline: true })
                .addFields({ name: '🪖 Militar', value: '`quartel` `base_aerea` `porto_militar`', inline: true })
                .setFooter({ text: 'Invista na infraestrutura dos seus territórios' });
            return message.channel.send({ embeds: [embed] });
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const custos = {
            hospital: { nome: 'Hospital', emoji: '🏥', dinheiro: 150000, pedra: 3000, madeira: 1500 },
            banco: { nome: 'Banco Central', emoji: '🏦', dinheiro: 200000, pedra: 3000, ouro: 500 },
            usina: { nome: 'Usina de Energia', emoji: '⚡', dinheiro: 80000, pedra: 2500, carvao: 3000 },
            industria: { nome: 'Indústria', emoji: '🏭', dinheiro: 100000, pedra: 3000, ferro: 2000 },
            fazenda: { nome: 'Fazenda', emoji: '🌾', dinheiro: 40000, madeira: 3500 },
            escola: { nome: 'Escola', emoji: '📚', dinheiro: 80000, madeira: 2500, pedra: 1500 },
            laboratorio: { nome: 'Laboratório', emoji: '🔬', dinheiro: 180000, pedra: 2000, silicio: 500 },
            quartel: { nome: 'Quartel', emoji: '🪖', dinheiro: 50000, pedra: 2000, madeira: 1500 },
            base_aerea: { nome: 'Base Aérea', emoji: '✈️', dinheiro: 200000, pedra: 5000, ferro: 3000 },
            porto_militar: { nome: 'Porto Militar', emoji: '🚢', dinheiro: 150000, pedra: 4000, ferro: 3500 },
            hidreletrica: { nome: 'Hidrelétrica', emoji: '🌊', dinheiro: 500000, pedra: 8000, ferro: 5000 },
            solar: { nome: 'Usina Solar', emoji: '🌞', dinheiro: 350000, silicio: 2000, aluminio: 1200 },
            parque_eolico: { nome: 'Parque Eólico', emoji: '💨', dinheiro: 300000, ferro: 3000, aluminio: 1500 },
            mineradora: { nome: 'Mineradora', emoji: '⛏️', dinheiro: 120000, ferro: 3000, pedra: 4000 }
        };

        if (!custos[tipo]) return message.channel.send('❌ Construção inválida!');

        const custo = custos[tipo];
        const custoTotalDinheiro = custo.dinheiro * qtd;
        const tesouroImperial = Number(pais.tesouro) || 0;

        if (tesouroImperial < custoTotalDinheiro) {
            return message.channel.send(
                `❌ Tesouro insuficiente! Custo: ${custoTotalDinheiro.toLocaleString('pt-BR')} moedas.`
            );
        }

        for (const [recurso, valor] of Object.entries(custo)) {
            if (recurso === 'dinheiro' || recurso === 'nome' || recurso === 'emoji') continue;
            if ((pais[recurso] || 0) < valor * qtd) {
                return message.channel.send(
                    `❌ Falta ${recurso}! Precisa de ${(valor * qtd).toLocaleString('pt-BR')}.`
                );
            }
        }

        db.subtract(`pais_${nomePais}.tesouro`, custoTotalDinheiro);
        for (const [recurso, valor] of Object.entries(custo)) {
            if (recurso === 'dinheiro' || recurso === 'nome' || recurso === 'emoji') continue;
            db.subtract(`pais_${nomePais}.${recurso}`, valor * qtd);
        }

        const nivelAtual = Number(fantoche.dados.construcoes?.[tipo]?.nivel || fantoche.dados.construcoes?.[tipo] || 0);
        const novoNivel = nivelAtual + qtd;
        db.set(`pais_${alvo}.construcoes.${tipo}.nivel`, novoNivel);
        db.subtract(`pais_${alvo}.tensaoColonial`, qtd);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const recursosUsados =
            Object.entries(custo)
                .filter(([k]) => k !== 'dinheiro' && k !== 'nome' && k !== 'emoji')
                .map(([k, v]) => `${k}: ${(v * qtd).toLocaleString('pt-BR')}`)
                .join('\n') || 'Nenhum';

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${custo.emoji} Construção Colonial — ${nomeAlvo}`)
            .setColor('#2ecc71')
            .setDescription(`O império investiu na infraestrutura de **${nomeAlvo}**.`)
            .addFields({ name: '🏗️ Construção', value: `${custo.nome} ×${qtd}`, inline: true })
            .addFields({ name: '📊 Nível', value: `${nivelAtual} → **${novoNivel}**`, inline: true })
            .addFields({
                name: '💰 Custo',
                value: `${custoTotalDinheiro.toLocaleString('pt-BR')} moedas`,
                inline: true
            })
            .addFields({ name: '📦 Recursos', value: recursosUsados, inline: true })
            .addFields({ name: '📉 Tensão', value: `-${qtd}%`, inline: true })
            .setFooter({ text: 'Ministério das Colônias • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= PROGRAMA DE SAÚDE NO FANTOCHE =================
    if (subcmd === 'programa' || subcmd === 'saude') {
        const alvo = (args[1] || '').toLowerCase();
        const programa = (args[2] || '').toLowerCase();

        const programasDisponiveis = {
            vacinacao: { nome: 'Vacinação em Massa', emoji: '💉', custo: 30000000, efeito: 'Imuniza 60% da população' },
            saneamento: {
                nome: 'Saneamento Básico',
                emoji: '🚰',
                custo: 50000000,
                efeito: 'Reduz doenças hídricas em 80%'
            },
            controle_pragas: {
                nome: 'Controle de Pragas',
                emoji: '🐀',
                custo: 20000000,
                efeito: 'Reduz vetores de doenças'
            },
            quarentena: {
                nome: 'Quarentena Obrigatória',
                emoji: '🔒',
                custo: 10000000,
                efeito: 'Reduz contágio em 50%'
            }
        };

        if (!alvo || !programa || !programasDisponiveis[programa]) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('🏥 Programas de Saúde Colonial')
                .setColor('#3498db')
                .setDescription('Use: `B!fantoches programa <país> <programa>`')
                .addFields({ name: '💉 Vacinação', value: '`vacinacao` - 30M moedas', inline: true })
                .addFields({ name: '🚰 Saneamento', value: '`saneamento` - 50M moedas', inline: true })
                .addFields({ name: '🐀 Controle', value: '`controle_pragas` - 20M moedas', inline: true })
                .addFields({ name: '🔒 Quarentena', value: '`quarentena` - 10M moedas', inline: true })
                .setFooter({ text: 'Invista na saúde dos seus territórios' });
            return message.channel.send({ embeds: [embed] });
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const prog = programasDisponiveis[programa];
        const tesouroImperial = Number(pais.tesouro) || 0;

        if (tesouroImperial < prog.custo) {
            return message.channel.send(`❌ Tesouro insuficiente!`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, prog.custo);

        const programasAtivos = fantoche.dados.programas_saude || [];
        if (!programasAtivos.includes(programa)) {
            programasAtivos.push(programa);
            db.set(`pais_${alvo}.programas_saude`, programasAtivos);
        }

        db.subtract(`pais_${alvo}.tensaoColonial`, 5);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${prog.emoji} Saúde Colonial — ${nomeAlvo}`)
            .setColor('#2ecc71')
            .setDescription(`Programa de saúde implementado em **${nomeAlvo}**.`)
            .addFields({ name: '📋 Programa', value: prog.nome, inline: true })
            .addFields({ name: '💰 Custo', value: `${prog.custo.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🛡️ Efeito', value: prog.efeito, inline: true })
            .addFields({ name: '📉 Tensão', value: '-5%', inline: true })
            .setFooter({ text: 'Ministério da Saúde Colonial • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= DEFINIR IMPOSTO DO FANTOCHE =================
    if (subcmd === 'imposto' || subcmd === 'taxa') {
        const alvo = (args[1] || '').toLowerCase();
        const novaTaxa = parseInt(args[2]);

        if (!alvo || isNaN(novaTaxa) || novaTaxa < 1 || novaTaxa > 50) {
            return message.channel.send('❌ Use: `B!fantoches imposto <país> <1-50>`');
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const taxaAntiga = ((fantoche.dados.taxaImposto || 0.1) * 100).toFixed(0);
        db.set(`pais_${alvo}.taxaImposto`, novaTaxa / 100);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const embed = new Discord.EmbedBuilder()
            .setTitle('📊 Política Tributária Colonial')
            .setColor('#f1c40f')
            .setDescription(`Nova taxa de imposto definida para **${nomeAlvo}**.`)
            .addFields({ name: '📈 Taxa Anterior', value: `${taxaAntiga}%`, inline: true })
            .addFields({ name: '📈 Nova Taxa', value: `${novaTaxa}%`, inline: true })
            .addFields({
                name: '📊 Impacto',
                value:
                    novaTaxa > 20
                        ? '⚠️ Imposto alto pode gerar insatisfação'
                        : novaTaxa > 10
                          ? '✅ Taxa moderada'
                          : '🟢 Taxa baixa',
                inline: false
            })
            .setFooter({ text: 'Ministério da Fazenda Colonial • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= DOAR DINHEIRO AO FANTOCHE =================
    if (subcmd === 'doar' || subcmd === 'transferir') {
        const alvo = (args[1] || '').toLowerCase();
        const valor = parseInt(args[2]) || 0;

        if (!alvo || valor <= 0) {
            return message.channel.send('❌ Use: `B!fantoches doar <país> <valor>`');
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tesouroImperial = Number(pais.tesouro) || 0;
        if (tesouroImperial < valor) return message.channel.send(`❌ Tesouro insuficiente!`);

        db.subtract(`pais_${nomePais}.tesouro`, valor);
        db.add(`pais_${alvo}.tesouro`, valor);
        db.subtract(`pais_${alvo}.tensaoColonial`, 5);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const embed = new Discord.EmbedBuilder()
            .setTitle('💸 Auxílio Financeiro Colonial')
            .setColor('#f1c40f')
            .setDescription(`**${nomeFormal}** enviou ajuda financeira para **${nomeAlvo}**.`)
            .addFields({ name: '💰 Valor', value: `${valor.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '📉 Tensão', value: '-5%', inline: true })
            .setFooter({ text: 'Ministério das Colônias • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= PESQUISAR NO FANTOCHE =================
    if (subcmd === 'pesquisa' || subcmd === 'tecnologia') {
        const alvo = (args[1] || '').toLowerCase();
        const tecId = (args[2] || '').toLowerCase();

        const TECNOLOGIAS_DISPONIVEIS = {
            industria_avancada: {
                nome: 'Indústria Avançada',
                emoji: '🏭',
                custo: 50000000,
                efeito: '+10% produtividade'
            },
            revolucao_verde: { nome: 'Revolução Verde', emoji: '🌾', custo: 40000000, efeito: '+15% comida' },
            militar_basico: {
                nome: 'Doutrina Militar Básica',
                emoji: '⚔️',
                custo: 60000000,
                efeito: '+5% poder militar'
            },
            fisica_nuclear: { nome: 'Física Nuclear', emoji: '⚛️', custo: 100000000, efeito: 'Energia nuclear' }
        };

        if (!alvo || !tecId || !TECNOLOGIAS_DISPONIVEIS[tecId]) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('🔬 Pesquisa Colonial')
                .setColor('#3498db')
                .setDescription('Use: `B!fantoches pesquisa <país> <tecnologia>`')
                .addFields({ name: '🏭 Indústria', value: '`industria_avancada` - 50M', inline: true })
                .addFields({ name: '🌾 Agricultura', value: '`revolucao_verde` - 40M', inline: true })
                .addFields({ name: '⚔️ Militar', value: '`militar_basico` - 60M', inline: true })
                .addFields({ name: '⚛️ Nuclear', value: '`fisica_nuclear` - 100M', inline: true })
                .setFooter({ text: 'Invista em tecnologia nos seus territórios' });
            return message.channel.send({ embeds: [embed] });
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tec = TECNOLOGIAS_DISPONIVEIS[tecId];
        const tesouroImperial = Number(pais.tesouro) || 0;

        if (tesouroImperial < tec.custo) {
            return message.channel.send(`❌ Tesouro insuficiente!`);
        }

        const tecnologiasFantoche = fantoche.dados.tecnologias || [];
        if (tecnologiasFantoche.includes(tecId)) {
            return message.channel.send(`✅ **${alvo}** já possui essa tecnologia!`);
        }

        db.subtract(`pais_${nomePais}.tesouro`, tec.custo);
        tecnologiasFantoche.push(tecId);
        db.set(`pais_${alvo}.tecnologias`, tecnologiasFantoche);
        db.subtract(`pais_${alvo}.tensaoColonial`, 3);

        if (tecId === 'industria_avancada') db.add(`pais_${alvo}.produtividade`, 0.1);
        if (tecId === 'revolucao_verde') db.add(`pais_${alvo}.agricultura`, 5000);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${tec.emoji} Tecnologia Colonial — ${nomeAlvo}`)
            .setColor('#9b59b6')
            .setDescription(`Nova tecnologia em **${nomeAlvo}**.`)
            .addFields({ name: '🔬 Tecnologia', value: tec.nome, inline: true })
            .addFields({ name: '💰 Custo', value: `${tec.custo.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '📊 Efeito', value: tec.efeito, inline: true })
            .setFooter({ text: 'Ministério da Ciência Colonial • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= SUPRIMIR REVOLTA =================
    if (subcmd === 'suprimir') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches suprimir <país>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        const tensao = fantoche.dados.tensaoColonial || 0;
        if (tensao < 20) return message.channel.send(`✅ Tensão em ${alvo} está baixa (${tensao}%).`);

        const exercito = pais.exercito || {};
        const tropasUsadas = Math.floor((exercito.infantaria || 0) * 0.05);

        db.subtract(`pais_${nomePais}.exercito.infantaria`, tropasUsadas);
        db.set(`pais_${alvo}.tensaoColonial`, Math.max(0, tensao - 30));
        reduzirPopulacao(alvo, Math.floor((fantoche.dados.populacao || 0) * 0.02));

        return message.channel.send(
            `⚔️ **Revolta Suprimida!**\n` +
                `${alvo}: Tensão ${tensao}% → ${Math.max(0, tensao - 30)}%\n` +
                `💀 ${tropasUsadas.toLocaleString('pt-BR')} tropas usadas`
        );
    }

    // ================= LIBERTAR FANTOCHE =================
    if (subcmd === 'libertar') {
        const alvo = (args[1] || '').toLowerCase();
        if (!alvo) return message.channel.send(`❌ Use: \`B!fantoches libertar <país>\``);

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        db.delete(`pais_${alvo}.governoFantoche`);
        db.delete(`pais_${alvo}.controladoPor`);
        db.delete(`pais_${alvo}.nomeFantoche`);
        db.delete(`pais_${alvo}.tributo`);
        db.delete(`pais_${alvo}.tributoPara`);
        db.delete(`pais_${alvo}.tensaoColonial`);
        db.delete(`pais_${alvo}.ultimatoAceito`);
        db.set(`pais_${alvo}.status`, 'independente');
        db.add(`pais_${nomePais}.reputacaoDiplomatica`, 15);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const noticia = {
            titulo: `🕊️ Independência Concedida!`,
            descricao: `**${nomeFormal}** concedeu independência a **${nomeAlvo}**.\n🌟 +15 Reputação`,
            tipo: 'comercio',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaGlobal(noticia);

        return message.channel.send(
            `🕊️ **Independência Concedida!**\n${nomeAlvo} agora é independente.\n🌟 +15 Reputação`
        );
    }
    // ================= ENVIAR REFORÇOS MILITARES PARA FANTOCHE =================
    if (subcmd === 'enviar-tropas' || subcmd === 'reforcar' || subcmd === 'reforcos') {
        const alvo = (args[1] || '').toLowerCase();

        // Se não especificou nada, mostrar painel de envio
        if (!alvo) {
            return message.channel.send(
                '❌ Use: `B!fantoches reforcar <país> <tipo1> <qtd1> [tipo2] [qtd2] ...`\n\n📋 **Tipos:** `infantaria` `tanques` `avioes` `navios` `drones`'
            );
        }

        const fantoche = fantoches.find((f) => f.nome === alvo);
        if (!fantoche) return message.channel.send(`❌ **${alvo}** não é seu fantoche!`);

        // Se só especificou o país, mostrar o que pode enviar
        if (!args[2]) {
            const exMeu = pais.exercito || {};
            const dronesMeu = Object.values(pais.arsenal_drones || {}).reduce((a, b) => a + b, 0);
            const exAlvo = fantoche.dados.exercito || {};
            const dronesAlvo = Object.values(fantoche.dados.arsenal_drones || {}).reduce((a, b) => a + b, 0);

            const embed = new Discord.EmbedBuilder()
                .setTitle(`🪖 Reforçar Fantoche — ${alvo}`)
                .setColor('#3498db')
                .setDescription(
                    `Envie tropas e equipamentos para **${alvo}**.\nUse: \`B!fantoches reforcar ${alvo} <tipo> <qtd> [tipo2] [qtd2]...\``
                )
                .addFields({
                    name: '🟢 Suas Tropas Disponíveis',
                    value:
                        `🪖 Infantaria: **${(exMeu.infantaria || 0).toLocaleString('pt-BR')}**\n` +
                        `🚗 Tanques: **${(exMeu.tanques || 0).toLocaleString('pt-BR')}**\n` +
                        `✈️ Aviões: **${(exMeu.avioes || 0).toLocaleString('pt-BR')}**\n` +
                        `🚢 Navios: **${(exMeu.navios || 0).toLocaleString('pt-BR')}**\n` +
                        `🛸 Drones: **${dronesMeu}**`,
                    inline: true
                })
                .addFields({
                    name: '🔴 Tropas do Fantoche',
                    value:
                        `🪖 Infantaria: **${(exAlvo.infantaria || 0).toLocaleString('pt-BR')}**\n` +
                        `🚗 Tanques: **${(exAlvo.tanques || 0).toLocaleString('pt-BR')}**\n` +
                        `✈️ Aviões: **${(exAlvo.avioes || 0).toLocaleString('pt-BR')}**\n` +
                        `🚢 Navios: **${(exAlvo.navios || 0).toLocaleString('pt-BR')}**\n` +
                        `🛸 Drones: **${dronesAlvo}**`,
                    inline: true
                })
                .setFooter({ text: 'Comando Imperial • OneBot' });
            return message.channel.send({ embeds: [embed] });
        }

        // Processar envio de múltiplos tipos
        const envios = [];
        let totalEnviado = 0;
        let msgErro = '';

        // Ler args em pares (tipo, quantidade)
        for (let i = 2; i < args.length; i += 2) {
            const tipo = (args[i] || '').toLowerCase();
            const qtd = parseInt(args[i + 1]) || 0;

            if (!tipo || qtd <= 0) continue;

            const tiposValidos = ['infantaria', 'tanques', 'avioes', 'navios', 'drones'];
            if (!tiposValidos.includes(tipo)) {
                msgErro += `❌ Tipo inválido: ${tipo}\n`;
                continue;
            }

            // Verificar disponibilidade
            let disponivel = 0;
            if (tipo === 'drones') {
                disponivel = Object.values(pais.arsenal_drones || {}).reduce((a, b) => a + b, 0);
            } else {
                disponivel = (pais.exercito || {})[tipo] || 0;
            }

            if (disponivel < qtd) {
                msgErro += `❌ ${tipo}: você só tem ${disponivel.toLocaleString('pt-BR')} (pediu ${qtd.toLocaleString('pt-BR')})\n`;
                continue;
            }

            envios.push({ tipo, qtd });
            totalEnviado += qtd;
        }

        if (envios.length === 0) {
            return message.channel.send(msgErro || '❌ Nenhum envio válido especificado.');
        }

        // EXECUTAR ENVIOS
        for (const envio of envios) {
            if (envio.tipo === 'drones') {
                let restantes = envio.qtd;
                for (const t of ['drone_fpv', 'drone_shahed', 'drone_bayraktar', 'drone_swarm']) {
                    if (restantes <= 0) break;
                    const disp = (pais.arsenal_drones || {})[t] || 0;
                    const tirar = Math.min(disp, restantes);
                    if (tirar > 0) {
                        db.subtract(`pais_${nomePais}.arsenal_drones.${t}`, tirar);
                        restantes -= tirar;
                    }
                }
                const arsenalAlvo = fantoche.dados.arsenal_drones || {};
                arsenalAlvo.drone_fpv = (arsenalAlvo.drone_fpv || 0) + envio.qtd;
                db.set(`pais_${alvo}.arsenal_drones`, arsenalAlvo);
            } else {
                db.subtract(`pais_${nomePais}.exercito.${envio.tipo}`, envio.qtd);
                db.add(`pais_${alvo}.exercito.${envio.tipo}`, envio.qtd);
            }
        }

        db.subtract(`pais_${alvo}.tensaoColonial`, Math.min(10, envios.length * 3));

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        // Notícia
        const textoReforcos = envios.map((e) => `${e.qtd.toLocaleString('pt-BR')} ${e.tipo}`).join(', ');
        const noticia = {
            titulo: `🪖 Reforços Enviados ao Front!`,
            descricao: `**${nomeFormal}** enviou reforços militares para **${nomeAlvo}**: ${textoReforcos}!`,
            tipo: 'militar',
            impacto: 'positivo',
            timestamp: Date.now(),
            pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaNacional(nomePais, noticia);
            engine.publicarNoticiaNacional(alvo, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('🪖 Reforços Enviados ao Fantoche!')
            .setColor('#2ecc71')
            .setDescription(`Tropas enviadas para **${nomeAlvo}**.`)
            .addFields({
                name: '📦 Reforços',
                value: envios.map((e) => `• ${e.tipo}: **${e.qtd.toLocaleString('pt-BR')}**`).join('\n'),
                inline: false
            })
            .addFields({ name: '📉 Tensão', value: `-${Math.min(10, envios.length * 3)}%`, inline: true })
            .addFields({ name: '📊 Total', value: totalEnviado.toLocaleString('pt-BR'), inline: true })
            .setFooter({ text: 'Comando Imperial • OneBot' });

        if (msgErro) embed.addFields({ name: '⚠️ Erros', value: msgErro, inline: false });

        return message.channel.send({ embeds: [embed] });
    }
    return message.channel.send('❌ Comando inválido. Use `B!fantoches` para ver o painel.');
};
