const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

    let user = message.author;
    let novoEditor = message.mentions.users.first();

    let isEditor = db.get(`editor_${message.author.id}_${user.id}.true`);
    let ServerEditorNoPremium = db.get(`editores_${message.guild.id}`) || [];
    let premium = db.get(`premiumserver_${message.guild.id}`);
    let serverLimit = db.get(`serverLimit_${message.guild.id}`) || 0;

    if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.channel.send(`:x: | ${user}, Você não é um Administrador`);
        return;
    }

    if (!novoEditor) {
        const erro1 = new Discord.EmbedBuilder()
        .setTitle("Adicione uma pessoa para editor no servidor")
        .setAuthor("B!addeditor")
        .setDescription(`Adicione um usuário para ser um editor, formas de uso:`)
        .addFields({ name: `Exemplos:`, value: `\`\`\`B!addeditor @Vlad\nB!addeditor @OneBot#0000\`\`\``, inline: false });
        message.channel.send({ embeds: [erro1] });
        return;
    }

    if (ServerEditorNoPremium.length >= 1 && !premium && serverLimit >= 1) {
        message.channel.send(`:x: **|** ${user} Esse servidor já atingiu o limite de editores! Compre premium para adicionar mais editores`);
        return;
    }

    // Verifica se o novo editor já está na lista
    if (ServerEditorNoPremium.includes(novoEditor.id)) {
        message.channel.send(`:x: | ${user}, ${novoEditor} já é um editor neste servidor!`);
        return;
    }

    const embed = new Discord.EmbedBuilder()
    .setTitle(`🖥️ **|** Editor`)
    .setColor('#2ecc71')
    .setDescription(`<:aceito:1031262771326759002>**|** ${user}, Você adicionou ${novoEditor} como novoo Editor nesse servidor!`)
    .setFooter({ text: `© OneBot 2024 - Todos os Direitos Reservados` })
    .setTimestamp();

    ServerEditorNoPremium.push(novoEditor.id);
    db.set(`editores_${message.guild.id}`, ServerEditorNoPremium);
    db.add(`serverLimit_${message.guild.id}`, 1);
    message.channel.send({ embeds: [embed] });
}