const db = require('../systems/rpg-db');
const Discord = require("discord.js");

exports.run = async (client, message) => {
    const lista = db.get('lista_paises') || [];

    let atualizados = 0;

    for (const nomePais of lista) {
        const path = `pais_${nomePais}`;

        if (!db.get(`${path}.construcoes`)) {
            db.set(`${path}.construcoes`, {
                quartel: 0,
                base_aerea: 0,
                porto_militar: 0,
                industria: 0,
                fazenda: 0,
                usina: 0
            });
            atualizados++;
        }
    }

    message.channel.send(`✅ ${atualizados} países atualizados com sistema de construções.`);
};