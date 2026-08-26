const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = args[0] ? args[0].toLowerCase() : db.get(`${userId}.pais`);

    if (!nomePais) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país: \`B!registrar-cidadao <país>\``);
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País **${nomePais}** não encontrado!`);

    const cidadaos = pais.cidadaos || [];
    if (cidadaos.includes(userId)) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Você já é cidadão de **${nomePais}**!`);
    }

    const paisAtual = db.get(`${userId}.pais`);
    if (paisAtual && paisAtual !== nomePais) {
        const paisAnterior = db.get(`pais_${paisAtual}`);
        if (paisAnterior) {
            const cidadaosAnteriores = (paisAnterior.cidadaos || []).filter(c => c !== userId);
            db.set(`pais_${paisAtual}.cidadaos`, cidadaosAnteriores);
        }
    }

    cidadaos.push(userId);
    db.set(`pais_${nomePais}.cidadaos`, cidadaos);
    db.set(`${userId}.pais`, nomePais);

    const embed = new Discord.EmbedBuilder()
        .setTitle('🏳️ Cidadania Concedida!')
        .setDescription(`**${message.author.tag}** agora é cidadão(ã) de **${nomePais}**!\n\n⚠️ *Seus impostos serão coletados automaticamente a cada ciclo (1 min).*`)
        .addFields({ name: '💰 Taxa de Imposto', value: `${((pais.taxaImposto || 0.1) * 100).toFixed(0)}% do saldo`, inline: true })
        .addFields({ name: '👥 Total de Cidadãos', value: `${cidadaos.length}`, inline: true })
        .setColor('#3498db').setTimestamp();
    message.channel.send({ embeds: [embed] });
};
