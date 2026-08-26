const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const nomePais = args[0] || db.get(`${message.author.id}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país ou registre-se.`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);

    const parlamento = db.get(`parlamento_${nomePais}`) || { leisPendentes: [], leisAprovadas: [], leisVetadas: [] };

    let desc = '';

    if (parlamento.leisPendentes.length > 0) {
        desc += `**⏳ Pendentes (aguardando votação):**\n`;
        desc += parlamento.leisPendentes.map(l => `\`${l.id}\` — **${l.titulo}**: ${l.descricao.slice(0, 50)}...`).join('\n');
        desc += '\n\n';
    }
    if (parlamento.leisAprovadas.length > 0) {
        desc += `**✅ Aprovadas:**\n`;
        desc += parlamento.leisAprovadas.slice(0, 5).map(l => `• **${l.titulo}**: ${l.descricao.slice(0, 40)}...`).join('\n');
        desc += '\n\n';
    }
    if (parlamento.leisVetadas.length > 0) {
        desc += `**❌ Vetadas:**\n`;
        desc += parlamento.leisVetadas.slice(0, 5).map(l => `• **${l.titulo}**: ${l.descricao.slice(0, 40)}...`).join('\n');
    }

    if (!desc) desc = '*Nenhuma lei registrada. Envie propostas com* `B!enviar-lei`';

    const embed = new Discord.EmbedBuilder()
        .setTitle(`📜 Parlamento de ${nomePais}`)
        .setDescription(desc)
        .setColor('#e67e22')
        .setFooter({ text: 'B!aprovar-lei <id> | B!vetar-lei <id> | B!enviar-lei "título" descrição' })
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
};
