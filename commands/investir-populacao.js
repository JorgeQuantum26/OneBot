const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país registrado!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode realizar este investimento.`);

    const valor = parseInt(args[0]);
    if (!valor || valor <= 0) return message.channel.send(`<:recusado:1031262539272687777>**|** Informe um valor válido. Ex: \`B!investir-populacao 5000\``);

    const tesouro = pais.tesouro || 0;
    if (tesouro < valor) return message.channel.send(`<:recusado:1031262539272687777>**|** Tesouro insuficiente! Disponível: **${tesouro.toLocaleString('pt-BR')}** moedas.`);

    const crescimento = Math.floor(valor / 10);
    db.subtract(`pais_${nomePais}.tesouro`, valor);
    db.add(`pais_${nomePais}.populacao`, crescimento);
    db.add(`pais_${nomePais}.gastos`, valor);

    const novaPopulacao = (pais.populacao || 0) + crescimento;

    const noticia = {
        titulo: '👥 Investimento em Crescimento Populacional',
        descricao: `O governo de **${nomePais}** investiu **${valor.toLocaleString('pt-BR')}** moedas em programas de expansão populacional. A população cresceu para **${novaPopulacao.toLocaleString('pt-BR')}** habitantes.`,
        tipo: 'governo',
        impacto: 'positivo',
        timestamp: Date.now(),
        pais: nomePais
    };

    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaNacional(nomePais, noticia);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle('👥 Investimento Populacional')
        .setDescription(`**${nomePais}** investiu **${valor.toLocaleString('pt-BR')}** moedas no crescimento da população!`)
        .addFields({ name: '📈 Crescimento', value: `+${crescimento.toLocaleString('pt-BR')} habitantes`, inline: true })
        .addFields({ name: '👥 Nova População', value: novaPopulacao.toLocaleString('pt-BR'), inline: true })
        .addFields({ name: '💰 Tesouro Restante', value: (tesouro - valor).toLocaleString('pt-BR'), inline: true })
        .setColor('#2ecc71')
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
};
