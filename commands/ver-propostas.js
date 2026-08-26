const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const DiscordButtons = require('discord.js');
const { TIPOS_PROPOSTA, enviarPropostaComBotao } = require('../systems/propostas-engine');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = (db.get(`${userId}.pais`) || '').toLowerCase();
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais || pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode ver propostas.`);

    const agora = Date.now();
    let propostas = db.get(`propostas_${nomePais}`) || [];
    propostas = propostas.filter(p => p.status === 'pendente' && p.expiraEm > agora);
    db.set(`propostas_${nomePais}`, propostas);

    if (propostas.length === 0) {
        return message.channel.send(`📭 **Sem propostas diplomáticas pendentes.** As propostas chegam automaticamente de países aliados e NPCs.`);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle(`📬 Propostas Diplomáticas Pendentes — ${nomePais}`)
        .setDescription(`**${propostas.length}** proposta(s) aguardando resposta. Use os botões ou \`B! <id>\`.`)
        .setColor('#f1c40f')
        .setTimestamp();

    for (const p of propostas.slice(0, 5)) {
        const tipoInfo = TIPOS_PROPOSTA[p.tipo] || { emoji: '📋', label: p.tipo };
        const expiraEm = new Date(p.expiraEm).toLocaleTimeString('pt-BR');
        embed.addFields({ name: `${tipoInfo.emoji} ${tipoInfo.label} — de ${p.nomeRemetente}`, value: `${p.termos.descricao || 'Sem descrição'}\n🆔 \`${p.id}\` | ⏰ Expira: ${expiraEm}`, inline: false });
    }

    await message.channel.send({ embeds: [embed] });

    for (const p of propostas.slice(0, 3)) {
        await enviarPropostaComBotao(client, p).catch(() => {});
    }
};
