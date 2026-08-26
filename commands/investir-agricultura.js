const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);
    if (!nomePais) return message.channel.send(`<:recusado:1031262539272687777>**|** Você não possui um país!`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`<:recusado:1031262539272687777>**|** País não encontrado.`);
    if (pais.governador !== userId) return message.channel.send(`<:recusado:1031262539272687777>**|** Apenas o governador pode investir na agricultura.`);

    const valor = parseInt(args[0]);
    
    // ⚡ CORREÇÃO: Extrair valores numéricos das construções
    const construcoes = pais.construcoes || {};
    const fazendas = Number(construcoes.fazenda?.nivel || construcoes.fazenda || 0);
    const industria = Number(construcoes.industria?.nivel || construcoes.industria || 0);
    const usinas = Number(construcoes.usina?.nivel || construcoes.usina || 0);

    if (!valor || valor <= 0) {
        const agAtual = Number(pais.agricultura) || 0;

        // 🌾 bônus de fazendas (principal)
        const bonusFazenda = Math.min(3, 1 + (fazendas * 0.03));

        // 🏭 indústria também ajuda um pouco
        const bonusIndustria = 1 + (industria * 0.01);
        
        // ⚡ usinas dão eficiência energética
        const bonusUsina = 1 + (usinas * 0.005);

        const producaoAtual = Math.floor(
            (agAtual * 0.1) *
            bonusFazenda *
            bonusIndustria *
            bonusUsina
        );
        
        return message.channel.send(
            `🌾 **Agricultura Atual:** ${agAtual.toLocaleString('pt-BR')} pontos\n` +
            `📦 **Produção por ciclo:** ${producaoAtual.toLocaleString('pt-BR')} unidades de comida\n\n` +
            `🏗️ **Infraestrutura:**\n` +
            `🌾 Fazendas: ${fazendas} (bônus: +${((bonusFazenda - 1) * 100).toFixed(0)}%)\n` +
            `🏭 Indústrias: ${industria} (bônus: +${((bonusIndustria - 1) * 100).toFixed(0)}%)\n` +
            `⚡ Usinas: ${usinas} (bônus: +${((bonusUsina - 1) * 100).toFixed(1)}%)\n\n` +
            `**Como investir:** \`B!investir-agricultura <valor>\`\n` +
            `*Cada 100 moedas investidas adicionam 10 pontos de agricultura.*`
        );
    }

    const tesouro = Number(pais.tesouro) || 0;
    if (tesouro < valor) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** Tesouro insuficiente! Disponível: **${tesouro.toLocaleString('pt-BR')}** moedas.`);
    }

    // ⚡ Cálculo do ganho agrícola
    const ganhoAgro = Math.floor(Math.sqrt(valor) * 10);
    const agAtual = Number(pais.agricultura) || 0;
    const novoAgro = agAtual + ganhoAgro;

    db.subtract(`pais_${nomePais}.tesouro`, valor);
    db.add(`pais_${nomePais}.agricultura`, ganhoAgro);
    db.add(`pais_${nomePais}.gastos`, valor);

    // 🌾 bônus de fazendas (principal)
    const bonusFazenda = Math.min(3, 1 + (fazendas * 0.03));

    // 🏭 indústria também ajuda um pouco
    const bonusIndustria = 1 + (industria * 0.01);
    
    // ⚡ usinas dão eficiência energética
    const bonusUsina = 1 + (usinas * 0.005);

    // 📦 nova produção
    const novaProducao = Math.floor(
        (novoAgro * 0.1) *
        bonusFazenda *
        bonusIndustria *
        bonusUsina
    );

    // Produção antiga para comparação
    const producaoAntiga = Math.floor(
        (agAtual * 0.1) *
        bonusFazenda *
        bonusIndustria *
        bonusUsina
    );

    // Impacto na inflação
    const impactoInflacao = Math.min(0.02, Math.log10(valor + 1) / 100);
    db.subtract(`pais_${nomePais}.inflacao`, impactoInflacao);

    // Notícia
    const noticia = {
        titulo: `🌾 Investimento Agrícola em ${nomePais}`,
        descricao: `O governo de **${nomePais}** investiu **${valor.toLocaleString('pt-BR')}** moedas no setor agrícola. Produção aumentada para **${novaProducao.toLocaleString('pt-BR')}** unidades/ciclo.`,
        tipo: 'governo', impacto: 'positivo', timestamp: Date.now(), pais: nomePais
    };
    const engine = client.paisEngine;
    if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

    const embed = new Discord.EmbedBuilder()
        .setTitle('🌾 Expansão Agrícola Nacional')
        .setColor('#2ecc71')
        .setDescription(
            `O governo de **${nomePais}** ampliou sua capacidade agrícola.\n` +
            `Novas plantações, maquinário e logística foram implementados.`
        )
        .addFields({ name: '🌱 Capacidade Agrícola', value: `${agAtual.toLocaleString('pt-BR')} → **${novoAgro.toLocaleString('pt-BR')}**`, inline: true })
        .addFields({ name: '📦 Produção por Ciclo', value: `${producaoAntiga.toLocaleString('pt-BR')} → **${novaProducao.toLocaleString('pt-BR')}**`, inline: true })
        .addFields({ name: '🏗️ Infraestrutura Agrícola', value: `🌾 Fazendas: ${fazendas} (${((bonusFazenda - 1) * 100).toFixed(0)}% bônus)\n` +
            `🏭 Indústrias: ${industria} (${((bonusIndustria - 1) * 100).toFixed(0)}% bônus)\n` +
            `⚡ Usinas: ${usinas} (${((bonusUsina - 1) * 100).toFixed(1)}% bônus)`, inline: true })
        .addFields({ name: '📉 Impacto na Inflação', value: `-${(impactoInflacao * 100).toFixed(2)}%`, inline: true })
        .addFields({ name: '💰 Investimento', value: `-${valor.toLocaleString('pt-BR')} moedas`, inline: true })
        .addFields({ name: '🏦 Tesouro Restante', value: `${(tesouro - valor).toLocaleString('pt-BR')} moedas`, inline: true })
        .addFields({ name: '📊 Efeito Econômico', value: `🍞 Aumento da oferta de alimentos\n` +
            `📉 Redução inflacionária\n` +
            `📈 Estabilidade interna\n` +
            `⚡ Maior eficiência energética`, inline: false })
        .setFooter({ text: 'Ministério da Agricultura • OneBot' })
        .setTimestamp();
    
    message.channel.send({ embeds: [embed] });
};