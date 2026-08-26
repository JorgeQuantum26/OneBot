const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const DiscordButtons = require('discord.js');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = (db.get(`${userId}.pais`) || '').toLowerCase();
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode definir impostos.`);

    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? dados.nomeFormal : nomePais;

    if (!args[0]) {
        const taxaAtual = ((pais.taxaImposto || 0.10) * 100).toFixed(1);
        const receitaEst = Math.floor((pais.populacao || 0) * (pais.taxaImposto || 0.1) * (pais.produtividade || 1.0) * 0.001);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`💼 Sistema Tributário — ${nomeFormal}`)
            .setDescription(`Defina a taxa de imposto do seu país. Ela afeta a receita pública e a aprovação popular.`)
            .addFields({ name: '📊 Taxa Atual', value: `**${taxaAtual}%**`, inline: true })
            .addFields({ name: '💰 Receita Estimada/Ciclo', value: `${receitaEst.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '👥 Cidadãos Registrados', value: `${(pais.cidadaos || []).length}`, inline: true })
            .addFields({ name: '📉 Impacto na Aprovação', value: taxaAtual > 20 ? '⬇️ Alta tributação reduz aprovação popular' : '✅ Taxa equilibrada', inline: false })
            .addFields({ name: '📌 Como usar', value: '`B!definir-imposto <porcentagem>` — ex: `B!definir-imposto 15`', inline: false })
            .setColor('#f1c40f')
            .setTimestamp();

        const btn5 = new DiscordButtons.ButtonBuilder().setStyle(require('discord.js').ButtonStyle.Secondary).setLabel('5%').setCustomId(`imposto_5_${nomePais}`);
        const btn10 = new DiscordButtons.ButtonBuilder().setStyle(require('discord.js').ButtonStyle.Primary).setLabel('10%').setCustomId(`imposto_10_${nomePais}`);
        const btn15 = new DiscordButtons.ButtonBuilder().setStyle(require('discord.js').ButtonStyle.Primary).setLabel('15%').setCustomId(`imposto_15_${nomePais}`);
        const btn20 = new DiscordButtons.ButtonBuilder().setStyle(require('discord.js').ButtonStyle.Success).setLabel('20%').setCustomId(`imposto_20_${nomePais}`);
        const btn30 = new DiscordButtons.ButtonBuilder().setStyle(require('discord.js').ButtonStyle.Danger).setLabel('30%').setCustomId(`imposto_30_${nomePais}`);
        const row = new DiscordButtons.ActionRowBuilder().addComponents(btn5, btn10, btn15, btn20, btn30);

        return message.channel.send({ embeds: [embed], components: [row] });
    }

    const novaTaxa = parseFloat(args[0]);
    if (isNaN(novaTaxa) || novaTaxa < 1 || novaTaxa > 90) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Taxa inválida! Use entre **1%** e **90%**.`);
    }

    const taxaAnterior = ((pais.taxaImposto || 0.10) * 100).toFixed(1);
    const novaFracao = novaTaxa / 100;
    db.set(`pais_${nomePais}.taxaImposto`, novaFracao);

    const impactoAprovacao = novaTaxa > parseFloat(taxaAnterior) ? -3 : +2;
    db.add(`pais_${nomePais}.aprovacaoPopular`, impactoAprovacao);

    const noticia = {
        titulo: `💼 Reforma Tributária em ${nomeFormal}`,
        descricao: `O governador de **${nomeFormal}** alterou a taxa de imposto de **${taxaAnterior}%** para **${novaTaxa}%**.\n` +
            `${novaTaxa > parseFloat(taxaAnterior) ? '😤 A população reagiu negativamente.' : '😊 A população aprovou a redução.'}`,
        tipo: 'governo', impacto: novaTaxa > parseFloat(taxaAnterior) ? 'negativo' : 'positivo', timestamp: Date.now(), pais: nomePais
    };

    const engine = client.paisEngine;
    if (engine) {
        engine.publicarNoticiaNacional(nomePais, noticia);
        engine.publicarNoticiaGlobal(noticia);
    }

    const embed = new Discord.EmbedBuilder()
        .setTitle('💼 Taxa de Imposto Atualizada')
        .addFields({ name: 'Taxa Anterior', value: `${taxaAnterior}%`, inline: true })
        .addFields({ name: 'Nova Taxa', value: `**${novaTaxa}%**`, inline: true })
        .addFields({ name: 'Aprovação Popular', value: `${impactoAprovacao > 0 ? '+' : ''}${impactoAprovacao}%`, inline: true })
        .setColor(novaTaxa > parseFloat(taxaAnterior) ? 0xFF0000 : 0x00FF00)
        .setTimestamp();
    message.channel.send({ embeds: [embed] });
};
