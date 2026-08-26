const Discord = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = db.get(`${userId}.pais`);

    if (!nomePais) {
        return message.channel.send(`❌ Você não possui um país.`);
    }

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País não encontrado.`);
    if (pais.governador !== userId) {
        return message.channel.send(`❌ Apenas o governador pode investir na mineração.`);
    }

    // 🔧 Inicializa caso não exista
    if (!pais.mineracao) {
        db.set(`pais_${nomePais}.mineracao`, {
            nivel: 1,
            eficiencia: 1.0,
            investimento: 0
        });
    }

    const mineracao = db.get(`pais_${nomePais}.mineracao`);

    const valor = parseInt(args[0]);

    // 📊 MODO INFO
    if (!valor || valor <= 0) {
        const prodBase = Math.floor(mineracao.nivel * mineracao.eficiencia * 10);

        return message.channel.send(
            `⛏️ **Sistema de Mineração — ${nomePais}**\n\n` +
            `🏭 Nível: **${mineracao.nivel.toLocaleString('pt-BR')}**\n` +
            `⚙️ Eficiência: **${(mineracao.eficiencia * 100).toFixed(1)}%**\n` +
            `📦 Produção estimada: **${prodBase.toLocaleString('pt-BR')} unidades/ciclo**\n\n` +
            `💰 Investimento acumulado: **${mineracao.investimento.toLocaleString('pt-BR')} moedas**\n\n` +
            `📈 **Como investir:**\n\`B!investir-mineracao <valor>\`\n\n` +
            `💡 *Cada 100 moedas aumentam a capacidade industrial e eficiência.*`
        );
    }

    const tesouro = pais.tesouro || 0;

    if (tesouro < valor) {
        return message.channel.send(
            `❌ Tesouro insuficiente!\n` +
            `💰 Disponível: **${tesouro.toLocaleString('pt-BR')} moedas**`
        );
    }

    // 📈 Cálculo evolução
    const ganhoNivel = Math.floor(valor / 100);
    const ganhoEf = valor / 10000;

    const nivelAntes = mineracao.nivel;
    const efAntes = mineracao.eficiencia;

    const novoNivel = nivelAntes + ganhoNivel;
    const novaEf = efAntes + ganhoEf;

    // 💾 Aplicar
    db.subtract(`pais_${nomePais}.tesouro`, valor);
    db.add(`pais_${nomePais}.mineracao.nivel`, ganhoNivel);
    db.add(`pais_${nomePais}.mineracao.eficiencia`, ganhoEf);
    db.add(`pais_${nomePais}.mineracao.investimento`, valor);
    db.add(`pais_${nomePais}.gastos`, valor);

    // 📊 Produção
    const prodAntes = Math.floor(nivelAntes * efAntes * 10);
    const prodDepois = Math.floor(novoNivel * novaEf * 10);

    // 📰 Notícia
    const noticia = {
        titulo: `⛏️ Expansão Industrial em ${nomePais}`,
        descricao:
            `O governo investiu **${valor.toLocaleString('pt-BR')} moedas** na mineração.\n` +
            `Capacidade produtiva aumentou para **${prodDepois.toLocaleString('pt-BR')} unidades por ciclo**.`,
        tipo: 'governo',
        impacto: 'positivo',
        timestamp: Date.now(),
        pais: nomePais
    };

    const engine = client.paisEngine;
    if (engine) engine.publicarNoticiaNacional(nomePais, noticia);

    // 🎨 EMBED TOP
    const embed = new Discord.EmbedBuilder()
        .setTitle(`🏗️ Investimento em Mineração`)
        .setColor(0xFFD700)
        .setDescription(
            `O país **${nomePais}** expandiu sua infraestrutura mineral.\n` +
            `Novas escavações e equipamentos foram adquiridos.`
        )

        .addFields({ name: '🏭 Nível de Mineração', value: `${nivelAntes.toLocaleString('pt-BR')} → **${novoNivel.toLocaleString('pt-BR')}**`, inline: true })

        .addFields({ name: '⚙️ Eficiência', value: `${(efAntes * 100).toFixed(1)}% → **${(novaEf * 100).toFixed(1)}%**`, inline: true })

        .addFields({ name: '📦 Produção por Ciclo', value: `${prodAntes.toLocaleString('pt-BR')} → **${prodDepois.toLocaleString('pt-BR')}**`, inline: true })

        .addFields({ name: '💰 Investimento', value: `-${valor.toLocaleString('pt-BR')} moedas`, inline: true })

        .addFields({ name: '🏦 Tesouro Restante', value: `${(tesouro - valor).toLocaleString('pt-BR')} moedas`, inline: true })

        .addFields({ name: '📊 Impacto Econômico', value: '📈 Aumento de produção\n💼 Geração de riqueza\n🏗️ Industrialização acelerada', inline: false })

        .setFooter({ text: 'Sistema Industrial • RPG Mundi' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};