const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode demitir funcionários.`);

    const cargo = args.join(' ');
    if (!cargo) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe o cargo. Ex: \`B!demitir-funcionario Ministro das Finanças\``);

    let funcionarios = pais.funcionarios || [];
    let funcionariosIA = pais.funcionariosIA || [];

    const idxReal = funcionarios.findIndex(f => f.cargo.toLowerCase() === cargo.toLowerCase());
    const idxIA = funcionariosIA.findIndex(f => f.cargo.toLowerCase() === cargo.toLowerCase());

    if (idxReal !== -1) {
        const demitido = funcionarios[idxReal];
        funcionarios.splice(idxReal, 1);
        db.set(`pais_${nomePais}.funcionarios`, funcionarios);

        const noticia = {
            titulo: `🚪 Demissão em ${nomePais}`,
            descricao: `**${demitido.tag}** foi demitido(a) do cargo de **${demitido.cargo}** em **${nomePais}**.`,
            tipo: 'governo', impacto: 'neutro', timestamp: Date.now(), pais: nomePais
        };
        const engine = client.paisEngine;
        if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

        return message.channel.send(`✅ **${demitido.tag}** foi demitido(a) do cargo de **${demitido.cargo}**!`);
    }

    if (idxIA !== -1) {
        const demitido = funcionariosIA[idxIA];
        funcionariosIA.splice(idxIA, 1);
        db.set(`pais_${nomePais}.funcionariosIA`, funcionariosIA);
        return message.channel.send(`✅ O funcionário IA **${demitido.nome}** (${demitido.cargo}) foi removido do governo!`);
    }

    return message.channel.send(`<:recusado:1031262539272687777>**|** Cargo **${cargo}** não encontrado no governo.`);
};
