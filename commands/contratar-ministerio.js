const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode contratar para ministérios.`);

    const usuario = message.mentions.users.first();
    if (!usuario) return message.channel.send(`<:recusado:1031262539272687777>**|** Mencione o usuário: \`B!contratar-ministerio @usuario <ministério>\``);

    const nomeMin = args.slice(1).join(' ');
    if (!nomeMin) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o ministério: \`B!contratar-ministerio @usuario <ministério>\``);

    const ministerios = pais.ministerios || {};
    const min = ministerios[nomeMin];
    if (!min) {
        const lista = Object.keys(ministerios).join('\n') || '*Nenhum ministério.*';
        return message.channel.send(`<:recusado:1031262539272687777>**|** Ministério não encontrado!\n**Existentes:**\n${lista}`);
    }

    if (min.funcionarios.includes(usuario.id)) return message.channel.send(`<:recusado:1031262539272687777>**|** Este usuário já trabalha neste ministério!`);

    min.funcionarios.push(usuario.id);
    ministerios[nomeMin] = min;
    db.set(`pais_${nomePais}.ministerios`, ministerios);

    message.channel.send(`✅ **${usuario.tag}** foi contratado(a) para o **${nomeMin}**! Custo adicional: **200** moedas/ciclo.`);
};
