const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePaisRaw = db.get(`${userId}.pais`);
    const nomePais = nomePaisRaw ? nomePaisRaw.toLowerCase() : null;

    if (!nomePais) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Você não governa nenhum país!`);
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) {
        db.delete(`${userId}.pais`);
        return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado. Registro inconsistente removido — você está livre para criar um novo país.`);
    }

    if (pais.governador !== userId) {
        db.delete(`${userId}.pais`);
        return message.channel.send(`<:recusado:1031262539272687777>**|** Você não é o governador registrado de **${nomePais}**. Registro inconsistente removido — você está livre para criar um novo país.`);
    }

    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? dados.nomeFormal : nomePais;
    const bandeira = dados ? dados.bandeira : '🏳️';

    if (!args[0] || args[0].toLowerCase() !== 'confirmar') {
        const embed = new Discord.EmbedBuilder()
            .setTitle(`⚠️ Abandonar ${bandeira} ${nomeFormal}?`)
            .setDescription(
                `Tem certeza que deseja abandonar o governo de **${nomeFormal}**?\n\n` +
                `• O país voltará ao controle da IA\n` +
                `• Você perderá acesso a todos os comandos de governador\n` +
                `• Toda a estrutura econômica e militar permanece intacta\n` +
                `• Outro jogador poderá assumir o país depois\n\n` +
                `Para confirmar, use: \`B!abandonar-pais confirmar\``
            )
            .setColor('#e67e22')
            .setTimestamp();
        return message.channel.send({ embeds: [embed] });
    }

    db.set(`pais_${nomePais}.governador`, null);
    db.set(`pais_${nomePais}.isNPC`, true);
    db.delete(`${userId}.pais`);

    const noticia = {
        titulo: `🚪 Governador Abandonou o Cargo`,
        descricao: `**${message.author.tag}** abandonou o governo de **${nomeFormal}**. O país voltou ao controle da IA até um novo governador assumir.`,
        tipo: 'governo',
        impacto: 'neutro',
        timestamp: Date.now(),
        pais: nomePais
    };

    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaGlobal(noticia);
        engine.publicarNoticiaNacional(nomePais, noticia);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle(`🚪 País Abandonado`)
        .setDescription(`Você deixou o governo de **${bandeira} ${nomeFormal}**.\nO país voltou ao controle da IA. Use \`B!criarpais\` para assumir um novo país.`)
        .setColor(0x808080)
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
};
