const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode declarar sanções.`);

    const acao = args[0];
    const nomeParceiro = args.slice(1).join(' ').toLowerCase();

    if (!acao || !['aplicar', 'remover'].includes(acao) || !nomeParceiro) {
        return message.channel.send(
            `**💼 Sanções Econômicas — Uso:**\n` +
            `\`B!sancao-economica aplicar <país>\` — Congela bens e restringe comércio\n` +
            `\`B!sancao-economica remover <país>\` — Levanta as sanções`
        );
    }

    const parceiro = db.get(`pais_${nomeParceiro}`);
    if (!parceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomeParceiro}** não encontrado!`);

    let sancoes = pais.sancoes || [];

    if (acao === 'aplicar') {
        if (sancoes.find(s => s.pais === nomeParceiro && s.tipo === 'economica')) {
            return message.channel.send(`<:recusado:1031262539272687777>**|** Já existe uma sanção econômica contra **${nomeParceiro}**!`);
        }

        const custoTesouro = 2000;
        if ((pais.tesouro || 0) < custoTesouro) return message.channel.send(`<:recusado:1031262539272687777>**|** Custo de aplicação: **${custoTesouro}** moedas.`);

        sancoes.push({ pais: nomeParceiro, tipo: 'economica', aplicadaEm: Date.now() });
        db.set(`pais_${nomePais}.sancoes`, sancoes);
        db.subtract(`pais_${nomePais}.tesouro`, custoTesouro);

        const penalidade = Math.floor((parceiro.tesouro || 0) * 0.05);
        if (penalidade > 0) {
            db.subtract(`pais_${nomeParceiro}.tesouro`, penalidade);
            db.add(`pais_${nomeParceiro}.inflacao`, 0.02);
        }

        const noticia = {
            titulo: `💼 Sanção Econômica Internacional!`,
            descricao: `**${nomePais}** aplicou **sanções econômicas** contra **${nomeParceiro}**!\nImpacto estimado: **${penalidade.toLocaleString('pt-BR')}** moedas congeladas e +2% de inflação.`,
            tipo: 'economia', impacto: 'negativo', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomeParceiro, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('💼 Sanção Econômica Aplicada')
            .setDescription(`**${nomePais}** aplicou sanções econômicas contra **${nomeParceiro}**!`)
            .addFields({ name: '💰 Custo de Aplicação', value: `${custoTesouro.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '💸 Impacto no Alvo', value: `-${penalidade.toLocaleString('pt-BR')} moedas + inflação`, inline: true })
            .setColor('#e74c3c').setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    if (acao === 'remover') {
        const idx = sancoes.findIndex(s => s.pais === nomeParceiro && s.tipo === 'economica');
        if (idx === -1) return message.channel.send(`<:recusado:1031262539272687777>**|** Nenhuma sanção econômica ativa contra **${nomeParceiro}**!`);
        sancoes.splice(idx, 1);
        db.set(`pais_${nomePais}.sancoes`, sancoes);
        message.channel.send(`✅ Sanção econômica contra **${nomeParceiro}** levantada.`);
    }
};
