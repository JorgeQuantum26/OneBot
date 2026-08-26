const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);

    const cidadaos = pais.cidadaos || [];
    if (pais.governador !== userId && !cidadaos.includes(userId)) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas cidadãos do país podem enviar leis ao parlamento!`);
    }

    if (args.length < 2) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Use: \`B!enviar-lei "<título>" <descrição>\`\n*Exemplo:* \`B!enviar-lei "Redução de Impostos" Reduz a taxa de imposto em 2%\``);
    }

    const tituloMatch = args.join(' ').match(/"([^"]+)"/);
    if (!tituloMatch) return message.channel.send(`<:recusado:1031262539272687777>**|** Coloque o título entre aspas: \`"Título da Lei"\``);

    const titulo = tituloMatch[1];
    const descricao = args.join(' ').replace(`"${titulo}"`, '').trim();
    if (!descricao) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe uma descrição para a lei.`);

    const parlamento = db.get(`parlamento_${nomePais}`) || { leisPendentes: [], leisAprovadas: [], leisVetadas: [] };

    const novaLei = {
        id: Date.now().toString(),
        titulo,
        descricao,
        autor: message.author.tag,
        autorId: userId,
        enviadaEm: Date.now()
    };

    parlamento.leisPendentes.push(novaLei);
    db.set(`parlamento_${nomePais}`, parlamento);

    const noticia = {
        titulo: `📜 Nova Lei Proposta em ${nomePais}`,
        descricao: `**${message.author.tag}** enviou ao parlamento de **${nomePais}** a proposta: **"${titulo}"**\n*${descricao}*`,
        tipo: 'lei', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
    };
    const engine = client.paisEngine;
    if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

    const embed = new Discord.EmbedBuilder()
        .setTitle('📜 Lei Enviada ao Parlamento')
        .addFields({ name: 'Título', value: titulo, inline: false })
        .addFields({ name: 'Descrição', value: descricao, inline: false })
        .addFields({ name: 'Autor', value: message.author.tag, inline: false })
        .addFields({ name: 'ID da Lei', value: novaLei.id, inline: false })
        .setDescription(`A lei foi enviada ao parlamento de **${nomePais}**! O governador pode aprovar ou vetar com \`B!aprovar-lei ${novaLei.id}\` ou \`B!vetar-lei ${novaLei.id}\`.`)
        .setColor('#e67e22').setTimestamp();
    message.channel.send({ embeds: [embed] });
};
