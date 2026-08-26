const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    let jogadorNomeado = message.mentions.users.first();
    let pais = db.get(`${message.author.id}.pais`);

    if (!pais) {
        return message.reply('Você não possui um país registrado!');
    }

    let governador = db.get(`pais_${pais}.governador`);

    if (!governador || governador !== message.author.id) {
        return message.reply('Você não é o governador do país!');
    }

    if (!jogadorNomeado) {
        return message.reply('Você precisa mencionar um jogador para nomear como o novo governador!');
    }

    let dataAtual = new Date();
    let dataExpiracao = new Date(dataAtual.getTime() + (30 * 24 * 60 * 60 * 1000));

    db.set(`pais_${pais}.governador`, jogadorNomeado.id);
    db.set(`pais_${pais}.mandatoExpiraEm`, dataExpiracao.getTime());
    db.set(`${jogadorNomeado.id}.pais`, pais);

    const embed = new Discord.EmbedBuilder()
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setTitle('Novo Governador Nomeado!')
        .setDescription(`<:aceitado:1031262771326759002>**|** ${jogadorNomeado} agora é o novo governador de **${pais}**!\nSeu mandato expira em: **${dataExpiracao.toLocaleDateString('pt-BR')}**`)
        .setFooter({ text: '© RPG Mundi - OneBot' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};

setInterval(() => {
    let todos = db.all().filter(data => data.ID.startsWith('pais_'));
    for (const entry of todos) {
        let paisId = entry.ID;
        let mandatoExpiraEm = db.get(`${paisId}.mandatoExpiraEm`);

        if (mandatoExpiraEm && new Date(mandatoExpiraEm) <= new Date()) {
            console.log(`Mandato do Governador do ${paisId} expirou.`);
            db.delete(`${paisId}.mandatoExpiraEm`);
            db.delete(`${paisId}.governador`);
        }
    }
}, 24 * 60 * 60 * 1000);
