const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode declarar embargos.`);

    const acao = args[0];
    const nomeParceiro = args.slice(1).join(' ').toLowerCase();

    if (!acao || !['declarar', 'remover'].includes(acao) || !nomeParceiro) {
        return message.channel.send(`**Uso:**\n\`B!embargo declarar <país>\` — declara embargo econômico\n\`B!embargo remover <país>\` — remove embargo econômico`);
    }

    const parceiro = db.get(`pais_${nomeParceiro}`);
    if (!parceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomeParceiro}** não encontrado!`);

    let embargos = pais.embargos || [];

    if (acao === 'declarar') {
        if (embargos.includes(nomeParceiro)) return message.channel.send(`<:recusado:1031262539272687777>**|** Já existe um embargo contra **${nomeParceiro}**!`);
        embargos.push(nomeParceiro);
        db.set(`pais_${nomePais}.embargos`, embargos);

        const rotasAtualizadas = (pais.rotasComerciais || []).filter(r => r.parceiro !== nomeParceiro);
        db.set(`pais_${nomePais}.rotasComerciais`, rotasAtualizadas);

        const noticia = {
            titulo: `🚫 Embargo Declarado!`,
            descricao: `**${nomePais}** declarou um **embargo econômico** contra **${nomeParceiro}**! Todas as rotas comerciais foram suspensas.`,
            tipo: 'economia', impacto: 'tenso', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) {
            engine.publicarNoticiaGlobal(noticia);
            engine.publicarNoticiaNacional(nomePais, noticia);
        }

        const embed = new Discord.EmbedBuilder()
            .setTitle('🚫 Embargo Declarado')
            .setDescription(`**${nomePais}** declarou embargo econômico contra **${nomeParceiro}**!\nTodas as rotas comerciais foram canceladas automaticamente.`)
            .setColor('#e74c3c').setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    if (acao === 'remover') {
        if (!embargos.includes(nomeParceiro)) return message.channel.send(`<:recusado:1031262539272687777>**|** Não existe embargo ativo contra **${nomeParceiro}**!`);
        embargos = embargos.filter(e => e !== nomeParceiro);
        db.set(`pais_${nomePais}.embargos`, embargos);

        const noticia = {
            titulo: `🤝 Embargo Levantado`,
            descricao: `**${nomePais}** levantou o embargo econômico contra **${nomeParceiro}**. Relações comerciais podem ser retomadas.`,
            tipo: 'economia', impacto: 'positivo', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaGlobal(noticia);

        message.channel.send(`✅ Embargo contra **${nomeParceiro}** removido! Agora é possível abrir rotas comerciais novamente.`);
    }
};
