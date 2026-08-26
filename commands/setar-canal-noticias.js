const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    

    const tipo = args[0];
    const canal = message.mentions.channels.first() || message.channel;

    if (!tipo || !['global', 'nacional'].includes(tipo)) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Use: \`setar-canal-noticias <global/nacional> [#canal]\``);
    }

    if (tipo === 'global') {
        db.set('canal_noticias_globais', canal.id);
        return message.channel.send(`✅ Canal de notícias internacionais definido como ${canal}!`);
    }

    if (tipo === 'nacional') {
        const pais = db.get(`${message.author.id}.pais`);
        if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país registrado!`);
        db.set(`canal_noticias_${pais}`, canal.id);
        return message.channel.send(`✅ Canal de notícias de **${pais}** definido como ${canal}!`);
    }
};
