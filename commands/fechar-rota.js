const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { gerarNoticiaRota } = require('../systems/news-templates');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode fechar rotas.`);

    const nomeParceiro = args.join(' ').toLowerCase();
    if (!nomeParceiro) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o país: \`B!fechar-rota <país>\``);

    const rotas = pais.rotasComerciais || [];
    const idx = rotas.findIndex(r => r.parceiro === nomeParceiro);
    if (idx === -1) return message.channel.send(`<:recusado:1031262539272687777>**|** Nenhuma rota comercial com **${nomeParceiro}**!`);

    rotas.splice(idx, 1);
    db.set(`pais_${nomePais}.rotasComerciais`, rotas);

    const parceiro = db.get(`pais_${nomeParceiro}`);
    if (parceiro) {
        const rotasParceiro = (parceiro.rotasComerciais || []).filter(r => r.parceiro !== nomePais);
        db.set(`pais_${nomeParceiro}.rotasComerciais`, rotasParceiro);
    }

    const noticia = gerarNoticiaRota(nomePais, nomeParceiro, 'fechar');
    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaGlobal(noticia);
        engine.publicarNoticiaNacional(nomePais, noticia);
    }

    message.channel.send(`✅ Rota comercial com **${nomeParceiro}** encerrada.`);
};
