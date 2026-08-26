const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { gerarNoticiaLei } = require('../systems/news-templates');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode vetar leis.`);

    const id = args[0];
    if (!id) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o ID da lei: \`B!vetar-lei <id>\`\nVeja as leis pendentes com \`B!ver-leis\`.`);

    const parlamento = db.get(`parlamento_${nomePais}`) || { leisPendentes: [], leisAprovadas: [], leisVetadas: [] };
    const idx = parlamento.leisPendentes.findIndex(l => l.id === id);
    if (idx === -1) return message.channel.send(`<:recusado:1031262539272687777>**|** Lei com ID **${id}** não encontrada nas pendentes.`);

    const lei = parlamento.leisPendentes[idx];
    lei.vetadaEm = Date.now();
    parlamento.leisPendentes.splice(idx, 1);
    parlamento.leisVetadas.push(lei);
    db.set(`parlamento_${nomePais}`, parlamento);

    const noticia = gerarNoticiaLei(nomePais, lei, false);
    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaNacional(nomePais, noticia);
        engine.publicarNoticiaGlobal(noticia);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle('❌ Lei Vetada')
        .setDescription(`A lei **"${lei.titulo}"** foi vetada pelo governador de **${nomePais}**.`)
        .addFields({ name: '📜 Descrição', value: lei.descricao, inline: false })
        .addFields({ name: '👤 Proposta por', value: lei.autor, inline: false })
        .setColor('#e74c3c').setTimestamp();
    message.channel.send({ embeds: [embed] });
};
