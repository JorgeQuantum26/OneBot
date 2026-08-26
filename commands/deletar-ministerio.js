const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode deletar ministérios.`);

    const nome = args.join(' ');
    if (!nome) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o nome do ministério: \`B!deletar-ministerio <nome>\``);

    const ministerios = pais.ministerios || {};
    if (!ministerios[nome]) {
        const lista = Object.keys(ministerios).join('\n') || '*Nenhum ministério criado.*';
        return message.channel.send(`<:recusado:1031262539272687777>**|** Ministério não encontrado!\n**Existentes:**\n${lista}`);
    }

    delete ministerios[nome];
    db.set(`pais_${nomePais}.ministerios`, ministerios);

    const noticia = {
        titulo: `🏛️ Ministério Dissolvido em ${nomePais}`,
        descricao: `O **${nome}** foi dissolvido pelo governador de **${nomePais}**.`,
        tipo: 'governo', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
    };
    const engine = client.paisEngine;
    if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

    message.channel.send(`✅ O **${nome}** foi dissolvido!`);
};
