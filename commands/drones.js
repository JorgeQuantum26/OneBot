const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { reduzirPopulacao } = require('../systems/pais-mutacoes');
const { getDadosPais } = require('../systems/real-countries-data');

const DRONES = {
    drone_fpv: {
        nome: 'Drone FPV Kamikaze',
        emoji: '🎮',
        poder: 50,
        alcance: 10,
        custo_dinheiro: 50000,
        custo_silicio: 50,
        custo_aluminio: 30,
        custo_cobre: 20,
        tempo_producao: 2,
        tecnologia_necessaria: 'industria_avancada',
        descricao: 'Drone de curto alcance. Barato e eficaz contra infantaria.'
    },
    drone_shahed: {
        nome: 'Drone Shahed-136',
        emoji: '💣',
        poder: 500,
        alcance: 1000,
        custo_dinheiro: 200000,
        custo_silicio: 200,
        custo_aluminio: 100,
        custo_cobre: 80,
        custo_ferro: 150,
        tempo_producao: 5,
        tecnologia_necessaria: 'militar_avancado',
        descricao: 'Drone de médio alcance. Eficaz contra infantaria e tanques.'
    },
    drone_bayraktar: {
        nome: 'Drone Bayraktar TB2',
        emoji: '🛩️',
        poder: 2000,
        alcance: 5000,
        custo_dinheiro: 1000000,
        custo_silicio: 500,
        custo_aluminio: 300,
        custo_cobre: 150,
        custo_ferro: 300,
        custo_titanio: 50,
        tempo_producao: 10,
        tecnologia_necessaria: 'militar_avancado',
        descricao: 'Drone de longo alcance. Pode atingir alvos estratégicos.'
    }
};

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send('❌ Você não possui um país!');

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send('❌ País não encontrado.');
    if (pais.governador !== userId) return message.channel.send('❌ Apenas o governador pode gerenciar drones.');

    const dadosPais = getDadosPais(nomePais);
    const nomeFormal = dadosPais ? `${dadosPais.bandeira} ${dadosPais.nomeFormal}` : nomePais;

    const tecnologias = pais.tecnologias || [];
    if (!tecnologias.includes('industria_avancada')) {
        return message.channel.send(
            '❌ Pesquise **Indústria Avançada** primeiro!\nUse: `B!pesquisa iniciar industria_avancada`'
        );
    }

    const subcmd = (args[0] || '').toLowerCase();
    const inflacao = Number(pais.inflacao) || 0.05;
    const fatorInflacao = 1 + inflacao * 5;
    const fabricaDrones = Number(pais.construcoes?.fabrica_drones?.nivel || pais.construcoes?.fabrica_drones || 0);
    const bonusFabrica = 1 + fabricaDrones * 0.1;

    const nomesRecursos = {
        silicio: '🔮 Silício',
        aluminio: '⬜ Alumínio',
        cobre: '🟤 Cobre',
        ferro: '⚙️ Ferro',
        titanio: '🔩 Titânio',
        grafeno: '⬛ Grafeno'
    };

    // ================= PAINEL =================
    if (!subcmd || subcmd === 'painel' || subcmd === 'status') {
        const arsenal = pais.arsenal_drones || {};
        const produzindo = pais.produzindo_drone || null;
        const totalDrones = Object.values(arsenal).reduce((a, b) => a + b, 0);
        const poderTotal =
            (arsenal.drone_fpv || 0) * 50 + (arsenal.drone_shahed || 0) * 500 + (arsenal.drone_bayraktar || 0) * 2000;

        const embed = new Discord.EmbedBuilder()
            .setTitle(`🛸 Força de Drones — ${nomeFormal}`)
            .setColor('DARK_BLUE')
            .setDescription(`🏭 Fábrica: Nv. **${fabricaDrones}** (+${fabricaDrones * 10}% produção)`)
            .addFields({
                name: '🛸 Arsenal',
                value:
                    `🎮 FPV: **${arsenal.drone_fpv || 0}** (⚡50)\n` +
                    `💣 Shahed: **${arsenal.drone_shahed || 0}** (⚡500)\n` +
                    `🛩️ Bayraktar: **${arsenal.drone_bayraktar || 0}** (⚡2000)\n` +
                    `📦 Total: **${totalDrones}** | ⚡ Poder: **${poderTotal.toLocaleString('pt-BR')}**`,
                inline: false
            });

        if (produzindo) {
            const prog = produzindo.progresso || 0;
            const tot = produzindo.total || 5;
            const barra = '🟦'.repeat(prog) + '⬜'.repeat(Math.max(0, tot - prog));
            embed.addFields({
                name: '🏭 Produzindo',
                value: `${barra} **${Math.floor((prog / tot) * 100)}%**\n${DRONES[produzindo.tipo]?.nome}`,
                inline: false
            });
        }

        embed.addFields({
            name: '⚡ Comandos',
            value:
                '`B!drones produzir <tipo> [qtd]` — Produzir\n' +
                '`B!drones fabrica <nível>` — Fábrica\n' +
                '`B!drones atacar <país> <tipo> <qtd>` — Atacar',
            inline: false
        });
        embed.setFooter({ text: 'Força Aérea Não-Tripulada • OneBot' });
        embed.setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    // ================= VER TIPOS =================
    if (subcmd === 'tipos') {
        const embed = new Discord.EmbedBuilder().setTitle('🛸 Catálogo de Drones').setColor('DARK_BLUE');
        for (const [key, d] of Object.entries(DRONES)) {
            const disponivel = tecnologias.includes(d.tecnologia_necessaria);
            const custoAjustado = Math.floor((d.custo_dinheiro * fatorInflacao) / Math.max(1, bonusFabrica));
            embed.addFields({
                name: `${disponivel ? '✅' : '🔒'} ${d.emoji} ${d.nome} (\`${key}\`)`,
                value: `⚡ Poder: ${d.poder} | 📏 ${d.alcance}km\n💰 Custo: ${custoAjustado.toLocaleString('pt-BR')} moedas\n⏱️ ${Math.floor(d.tempo_producao / bonusFabrica)} ciclos\n📦 Silício:${d.custo_silicio || 0} Alumínio:${d.custo_aluminio || 0} Cobre:${d.custo_cobre || 0}`,
                inline: false
            });
        }
        return message.channel.send({ embeds: [embed] });
    }

    // ================= PRODUZIR =================
    if (subcmd === 'produzir' || subcmd === 'fabricar') {
        const tipo = args[1]?.toLowerCase();
        const qtdProduzir = parseInt(args[2]) || 1;

        if (!tipo || !DRONES[tipo]) {
            let opcoes = '';
            for (const [k, d] of Object.entries(DRONES)) {
                const disp = tecnologias.includes(d.tecnologia_necessaria);
                opcoes += `${disp ? '✅' : '🔒'} ${d.emoji} **${d.nome}** (\`${k}\`)\n`;
            }
            return message.channel.send(`❌ Use: \`B!drones produzir <tipo> [quantidade]\`\n\n${opcoes}`);
        }

        const drone = DRONES[tipo];
        if (!tecnologias.includes(drone.tecnologia_necessaria)) {
            return message.channel.send(`❌ Pesquise **${drone.tecnologia_necessaria.replace(/_/g, ' ')}** primeiro!`);
        }

        if (qtdProduzir <= 0 || qtdProduzir > 1000) {
            return message.channel.send('❌ Quantidade: 1-1000 drones por vez.');
        }

        // ⚡ Calcular custo total
        const custoUnitario = Math.floor((drone.custo_dinheiro * fatorInflacao) / Math.max(1, bonusFabrica));
        const custoTotalDinheiro = custoUnitario * qtdProduzir;
        const tesouro = Number(db.get(`pais_${nomePais}.tesouro`)) || 0;

        // Verificar dinheiro
        if (tesouro < custoTotalDinheiro) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('❌ Tesouro Insuficiente')
                .setColor('#e74c3c')
                .setDescription(`Produzir **${qtdProduzir}× ${drone.nome}**`)
                .addFields({ name: '💰 Custo Total', value: custoTotalDinheiro.toLocaleString('pt-BR'), inline: true })
                .addFields({ name: '💵 Disponível', value: tesouro.toLocaleString('pt-BR'), inline: true })
                .addFields({
                    name: '📉 Faltam',
                    value: (custoTotalDinheiro - tesouro).toLocaleString('pt-BR'),
                    inline: true
                })
                .setFooter({ text: 'Ministério da Defesa • OneBot' });
            return message.channel.send({ embeds: [embed] });
        }

        // Verificar outros recursos
        let faltamRecursos = [];
        for (const [rec, qtd] of Object.entries(drone)) {
            if (!rec.startsWith('custo_')) continue;
            const recurso = rec.replace('custo_', '');
            if (recurso === 'dinheiro') continue; // Já verificado

            const qtdNecessaria = qtd * qtdProduzir;
            const disponivel = Number(db.get(`pais_${nomePais}.${recurso}`)) || 0;
            if (disponivel < qtdNecessaria) {
                faltamRecursos.push({
                    nome: nomesRecursos[recurso] || recurso,
                    necessario: qtdNecessaria,
                    disponivel: disponivel
                });
            }
        }

        if (faltamRecursos.length > 0) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('❌ Recursos Insuficientes')
                .setColor('#e74c3c')
                .setDescription(
                    `Produzir **${qtdProduzir}× ${drone.nome}**\n💰 Tesouro: ✅ ${custoTotalDinheiro.toLocaleString('pt-BR')} moedas`
                )
                .addFields({
                    name: '📦 Faltam',
                    value: faltamRecursos
                        .map(
                            (r) =>
                                `${r.nome}: precisa **${r.necessario.toLocaleString('pt-BR')}**, tem **${r.disponivel.toLocaleString('pt-BR')}**`
                        )
                        .join('\n'),
                    inline: false
                })
                .addFields({
                    name: '💡 Solução',
                    value: 'Use `B!coletar-recursos <recurso>` para extrair.',
                    inline: false
                })
                .setFooter({ text: 'Ministério da Defesa • OneBot' });
            return message.channel.send({ embeds: [embed] });
        }

        if (pais.produzindo_drone) {
            return message.channel.send('❌ Já tem drone em produção! Aguarde concluir.');
        }

        // Produzir
        db.subtract(`pais_${nomePais}.tesouro`, custoTotalDinheiro);
        for (const [rec, qtd] of Object.entries(drone)) {
            if (!rec.startsWith('custo_')) continue;
            const recurso = rec.replace('custo_', '');
            if (recurso === 'dinheiro') continue;
            db.subtract(`pais_${nomePais}.${recurso}`, qtd * qtdProduzir);
        }

        const tempoTotal = Math.max(1, Math.floor(drone.tempo_producao / (bonusFabrica * 5)));
        db.set(`pais_${nomePais}.produzindo_drone`, {
            tipo,
            quantidade: qtdProduzir,
            progresso: 0,
            total: tempoTotal,
            inicio: Date.now()
        });

        const embed = new Discord.EmbedBuilder()
            .setTitle(`${drone.emoji} Produção em Massa Iniciada`)
            .setColor('#3498db')
            .setDescription(`**${qtdProduzir}× ${drone.nome}** em produção.`)
            .addFields({ name: '🛸 Quantidade', value: qtdProduzir.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💰 Custo Total', value: custoTotalDinheiro.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💵 Unitário', value: custoUnitario.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '⏱️ Tempo', value: `${tempoTotal} ciclos`, inline: true })
            .addFields({ name: '🏭 Fábrica', value: `Bônus ${fabricaDrones * 10}%`, inline: true })
            .setFooter({ text: 'Força Aérea • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= FÁBRICA =================
    if (subcmd === 'fabrica') {
        const nivelAtual = fabricaDrones;
        const nivelDesejado = parseInt(args[1]) || nivelAtual + 1;
        if (nivelDesejado <= nivelAtual) return message.channel.send('❌ Nível inválido.');

        const diff = nivelDesejado - nivelAtual;
        const custo = diff * 5000000;
        const tesouro = Number(db.get(`pais_${nomePais}.tesouro`)) || 0;

        if (tesouro < custo)
            return message.channel.send(`❌ Tesouro insuficiente! Custo: ${custo.toLocaleString('pt-BR')} moedas.`);

        db.subtract(`pais_${nomePais}.tesouro`, custo);
        db.set(`pais_${nomePais}.construcoes.fabrica_drones.nivel`, nivelDesejado);

        const embed = new Discord.EmbedBuilder()
            .setTitle('🏭 Fábrica de Drones Expandida')
            .setColor('#2ecc71')
            .setDescription(`Capacidade de produção aumentada.`)
            .addFields({ name: '📊 Nível', value: `${nivelAtual} → **${nivelDesejado}**`, inline: true })
            .addFields({ name: '💰 Custo', value: custo.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '⚡ Bônus', value: `+${nivelDesejado * 10}%`, inline: true })
            .setFooter({ text: 'Complexo Industrial Militar • OneBot' });
        return message.channel.send({ embeds: [embed] });
    }

    // ================= ATACAR =================
    if (subcmd === 'atacar') {
        const alvo = (args[1] || '').toLowerCase();
        const tipoDrone = (args[2] || '').toLowerCase();
        const quantidade = parseInt(args[3]) || 1;

        if (!alvo || !DRONES[tipoDrone]) {
            return message.channel.send(
                '❌ Use: `B!drones atacar <país> <tipo> [qtd]`\nTipos: `drone_fpv` `drone_shahed` `drone_bayraktar`'
            );
        }

        const drone = DRONES[tipoDrone];
        const arsenal = db.get(`pais_${nomePais}.arsenal_drones`) || {};
        const disponivel = arsenal[tipoDrone] || 0;

        if (disponivel < quantidade) {
            return message.channel.send(`❌ Você só tem **${disponivel}** ${drone.nome}.`);
        }

        if (quantidade <= 0 || quantidade > 50000) {
            return message.channel.send('❌ Quantidade: 1-50.000');
        }

        const paisAlvo = db.get(`pais_${alvo}`);
        if (!paisAlvo) return message.channel.send('❌ País não encontrado.');

        // ⚡ ENXAME: bônus progressivo
        const isEnxame = quantidade >= 50;
        const bonusEnxame = isEnxame ? 1 + Math.floor(quantidade / 100) * 0.25 : 1.0;
        const danoBase = drone.poder * quantidade;
        const danoTotal = Math.floor(danoBase * bonusEnxame);

        // Confirmação para ataques grandes
        if (quantidade >= 100) {
            const confirmMsg = await message.channel.send(
                `⚠️ **CONFIRMAR ATAQUE**\n${quantidade} ${drone.nome} contra **${alvo}**!\n` +
                    `⚡ Dano: **${danoTotal.toLocaleString('pt-BR')}**\n` +
                    `${isEnxame ? `🦟 ENXAME: +${Math.floor((bonusEnxame - 1) * 100)}% dano!\n` : ''}` +
                    `Digite \`CONFIRMAR\` em 15s.`
            );
            try {
                await message.channel.awaitMessages(
                    (m) => m.author.id === userId && m.content.toUpperCase() === 'CONFIRMAR',
                    { max: 1, time: 15000, errors: ['time'] }
                );
            } catch {
                return confirmMsg.edit('⏰ Cancelado.');
            }
        }

        // EXECUTAR
        db.subtract(`pais_${nomePais}.arsenal_drones.${tipoDrone}`, quantidade);

        const exInimigo = paisAlvo.exercito || {};
        const danoInfantaria = Math.floor(danoTotal * 0.7);
        const danoTanques = Math.floor(danoTotal * 0.15);
        const danoAvioes = Math.floor(danoTotal * 0.1);
        const danoNavios = Math.floor(danoTotal * 0.05);

        db.subtract(`pais_${alvo}.exercito.infantaria`, Math.min(exInimigo.infantaria || 0, danoInfantaria));
        if ((exInimigo.tanques || 0) > 0)
            db.subtract(`pais_${alvo}.exercito.tanques`, Math.min(exInimigo.tanques || 0, danoTanques));
        if ((exInimigo.avioes || 0) > 0)
            db.subtract(`pais_${alvo}.exercito.avioes`, Math.min(exInimigo.avioes || 0, danoAvioes));
        if ((exInimigo.navios || 0) > 0)
            db.subtract(`pais_${alvo}.exercito.navios`, Math.min(exInimigo.navios || 0, danoNavios));

        if (drone.poder >= 500) {
            const danoInfra = Math.floor(quantidade / 10) * (isEnxame ? 1 : 0.5);
            db.subtract(`pais_${alvo}.infraestrutura`, Math.min(paisAlvo.infraestrutura || 0, danoInfra));
        }

        const baixasCivis = Math.floor(danoTotal * (isEnxame ? 0.15 : 0.1));
        reduzirPopulacao(alvo, baixasCivis);

        const dadosAlvo = getDadosPais(alvo);
        const nomeAlvo = dadosAlvo ? `${dadosAlvo.bandeira} ${dadosAlvo.nomeFormal}` : alvo;

        const noticia = {
            titulo: isEnxame ? `🦟 ENXAME DE ${quantidade} DRONES!` : `${drone.emoji} Ataque com Drones`,
            descricao:
                `**${nomeFormal}** lançou **${quantidade} ${drone.nome}** contra **${nomeAlvo}**!\n\n` +
                `⚡ Dano total: **${danoTotal.toLocaleString('pt-BR')}**\n` +
                `💀 Baixas: **${danoTotal.toLocaleString('pt-BR')}**\n` +
                `👥 Civis: **${baixasCivis.toLocaleString('pt-BR')}**\n` +
                `${isEnxame ? `🦟 Bônus enxame: +${Math.floor((bonusEnxame - 1) * 100)}%\n` : ''}`,
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

        const guerras = db.get('guerras_ativas') || [];
        const guerra = guerras.find(
            (g) => (g.atacante === nomePais && g.defensor === alvo) || (g.defensor === nomePais && g.atacante === alvo)
        );
        if (guerra) {
            guerra.progresso = Math.min(100, (guerra.progresso || 0) + Math.floor(quantidade / 3));
            guerra.baixasDefensor = (guerra.baixasDefensor || 0) + danoTotal;
            db.set('guerras_ativas', guerras);
        }

        const novoArsenal = db.get(`pais_${nomePais}.arsenal_drones`) || {};
        const embed = new Discord.EmbedBuilder()
            .setTitle(`${isEnxame ? '🦟 ENXAME' : drone.emoji} — Ataque com Drones`)
            .setColor(isEnxame ? 0x8b0000 : 0xff0000)
            .setDescription(`**${quantidade}** ${drone.nome} lançados contra **${nomeAlvo}**!`)
            .addFields({ name: '🛸 Quantidade', value: quantidade.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '⚡ Dano Total', value: danoTotal.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '💀 Baixas', value: danoTotal.toLocaleString('pt-BR'), inline: true })
            .addFields({ name: '👥 Civis', value: baixasCivis.toLocaleString('pt-BR'), inline: true })
            .addFields({
                name: '🦟 Modo',
                value: isEnxame ? `ENXAME (+${Math.floor((bonusEnxame - 1) * 100)}%)` : 'Normal',
                inline: true
            })
            .addFields({ name: '🛸 Restantes', value: `${novoArsenal[tipoDrone] || 0}`, inline: true })
            .setFooter({ text: 'Força Aérea Não-Tripulada • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    return message.channel.send('❌ Comando inválido. Use `B!drones` para ver o painel.');
};
