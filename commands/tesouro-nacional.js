const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getDadosPais } = require('../systems/real-countries-data');

exports.run = async (client, message, args) => {
    const userId = message.author.id;
    const nomePais = (db.get(`${userId}.pais`) || '').toLowerCase();

    if (!nomePais) return message.channel.send(`❌ Você não governa nenhum país.`);

    const pais = db.get(`pais_${nomePais}`);
    if (!pais) return message.channel.send(`❌ País não encontrado.`);
    
    if (pais.governador !== userId) {
        return message.channel.send(`❌ Apenas o governador pode gerenciar o tesouro.`);
    }

    const dados = getDadosPais(nomePais);
    const nomeFormal = dados ? `${dados.bandeira} ${dados.nomeFormal}` : nomePais;

    const tesouroNacional = Number(pais.tesouroNacional) || 0;
    const tesouro = Number(pais.tesouro) || 0;
    const populacao = Number(pais.populacao) || 0;
    const pib = Number(pais.pib) || 1;

    const subcmd = (args[0] || '').toLowerCase();

    // ================= INFO =================
    if (!subcmd || subcmd === 'info' || subcmd === 'status') {
        const reservaPorHabitante = populacao > 0 ? Math.floor(tesouroNacional / populacao) : 0;
        const percentualPIB = ((tesouroNacional / pib) * 100).toFixed(1);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`🏦 Banco Central — ${nomeFormal}`)
            .setColor('#f1c40f')
            .setDescription(
                `Gerenciamento das reservas nacionais e tesouro público.\n\n` +
                `*O Tesouro Nacional acumula automaticamente com impostos e pode ser transferido para o Tesouro quando necessário.*`
            )
            .addFields({ name: '🏛️ Tesouro Nacional (Reserva)', value: `💰 **${tesouroNacional.toLocaleString('pt-BR')}** moedas\n` +
                `📊 ${percentualPIB}% do PIB\n` +
                `👤 ${reservaPorHabitante.toLocaleString('pt-BR')} moedas/habitante`, inline: true })
            .addFields({ name: '💵 Tesouro Disponível', value: `💰 **${tesouro.toLocaleString('pt-BR')}** moedas\n` +
                `📊 ${((tesouro / pib) * 100).toFixed(1)}% do PIB`, inline: true })
            .addFields({ name: '📈 Total Combinado', value: `💰 **${(tesouroNacional + tesouro).toLocaleString('pt-BR')}** moedas\n` +
                `📊 ${(((tesouroNacional + tesouro) / pib) * 100).toFixed(1)}% do PIB`, inline: true })
            .addFields({ name: '⚡ Comandos', value: `\`B!tesouro transferir <valor>\` - Transferir para o Tesouro\n` +
                `\`B!tesouro investir <valor>\` - Investir em infraestrutura\n` +
                `\`B!tesouro emergencia <valor>\` - Saque emergencial (taxa de 15%)`, inline: false })
            .setFooter({ text: 'Banco Central • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= TRANSFERIR PARA TESOURO =================
    if (subcmd === 'transferir' || subcmd === 'transfer') {
        let valor = parseInt(args[1]);

        if (!valor || valor <= 0) {
            return message.channel.send(`❌ Informe um valor válido.\nUse: \`B!tesouro transferir <valor>\``);
        }

        if (tesouroNacional < valor) {
            return message.channel.send(
                `❌ Saldo insuficiente no Tesouro Nacional.\n` +
                `🏛️ Disponível: **${tesouroNacional.toLocaleString('pt-BR')}** moedas\n` +
                `💰 Solicitado: **${valor.toLocaleString('pt-BR')}** moedas`
            );
        }

        // Limite: máximo 30% do Tesouro Nacional por vez
        const limiteMaximo = Math.floor(tesouroNacional * 0.3);
        if (valor > limiteMaximo) {
            return message.channel.send(
                `❌ Limite de transferência excedido.\n` +
                `📊 Máximo por operação: **${limiteMaximo.toLocaleString('pt-BR')}** moedas (30% da reserva)\n` +
                `💡 Use múltiplas operações ou aguarde o próximo ciclo.`
            );
        }

        // Custo administrativo de 2%
        const taxa = Math.floor(valor * 0.02);
        const valorLiquido = valor - taxa;

        db.subtract(`pais_${nomePais}.tesouroNacional`, valor);
        db.add(`pais_${nomePais}.tesouro`, valorLiquido);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`💸 Transferência Realizada — ${nomeFormal}`)
            .setColor('#2ecc71')
            .setDescription(`Transferência do Tesouro Nacional para o Tesouro disponível.`)
            .addFields({ name: '💰 Valor Transferido', value: `${valor.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🧾 Taxa Admin. (2%)', value: `${taxa.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '💵 Valor Líquido', value: `${valorLiquido.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🏛️ Novo Saldo Reserva', value: `${(tesouroNacional - valor).toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '💰 Novo Saldo Disponível', value: `${(tesouro + valorLiquido).toLocaleString('pt-BR')} moedas`, inline: true })
            .setFooter({ text: 'Banco Central • Transferência autorizada' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= INVESTIR EM INFRAESTRUTURA =================
    if (subcmd === 'investir' || subcmd === 'invest') {
        let valor = parseInt(args[1]);

        if (!valor || valor <= 0) {
            return message.channel.send(`❌ Informe um valor válido.\nUse: \`B!tesouro investir <valor>\``);
        }

        if (tesouroNacional < valor) {
            return message.channel.send(
                `❌ Saldo insuficiente no Tesouro Nacional.\n` +
                `🏛️ Disponível: **${tesouroNacional.toLocaleString('pt-BR')}** moedas`
            );
        }

        // Converter investimento em infraestrutura
        const ganhoInfra = valor / 50000; // 50k moedas = 0.1 de infra
        const ganhoReal = Math.min(ganhoInfra, 1.0); // Máximo 1.0 por vez

        db.subtract(`pais_${nomePais}.tesouroNacional`, valor);
        db.add(`pais_${nomePais}.infraestrutura`, ganhoReal);
        db.add(`pais_${nomePais}.gastos`, valor);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`🏗️ Investimento em Infraestrutura — ${nomeFormal}`)
            .setColor('#3498db')
            .setDescription(`Investimento do Tesouro Nacional em obras de infraestrutura.`)
            .addFields({ name: '💰 Valor Investido', value: `${valor.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🏗️ Ganho Infraestrutura', value: `+${ganhoReal.toFixed(2)}`, inline: true })
            .addFields({ name: '🏛️ Novo Saldo Reserva', value: `${(tesouroNacional - valor).toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '📊 Infraestrutura Atual', value: `${((pais.infraestrutura || 0) + ganhoReal).toFixed(1)}/5`, inline: true })
            .setFooter({ text: 'Ministério da Infraestrutura • OneBot' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= SAQUE EMERGENCIAL =================
    if (subcmd === 'emergencia' || subcmd === 'emergency') {
        let valor = parseInt(args[1]);

        if (!valor || valor <= 0) {
            return message.channel.send(`❌ Informe um valor válido.\nUse: \`B!tesouro emergencia <valor>\``);
        }

        if (tesouroNacional < valor) {
            return message.channel.send(
                `❌ Saldo insuficiente no Tesouro Nacional.\n` +
                `🏛️ Disponível: **${tesouroNacional.toLocaleString('pt-BR')}** moedas`
            );
        }

        // Taxa de emergência: 15%
        const taxaEmergencia = Math.floor(valor * 0.15);
        const valorLiquido = valor - taxaEmergencia;
        
        // Penalidade: reduz aprovação popular
        const penalidadeAprovacao = Math.floor(valor / 10000);
        
        // Penalidade: aumenta inflação
        const aumentoInflacao = (valor / 1000000) * 0.01;

        db.subtract(`pais_${nomePais}.tesouroNacional`, valor);
        db.add(`pais_${nomePais}.tesouro`, valorLiquido);
        db.subtract(`pais_${nomePais}.aprovacaoPopular`, penalidadeAprovacao);
        db.add(`pais_${nomePais}.inflacao`, aumentoInflacao);

        const embed = new Discord.EmbedBuilder()
            .setTitle(`🚨 Saque Emergencial — ${nomeFormal}`)
            .setColor('#e74c3c')
            .setDescription(
                `⚠️ Saque emergencial do Tesouro Nacional realizado.\n` +
                `*Esta operação tem altas taxas e penalidades!*\n` +
                `*Use apenas em situações críticas.*`
            )
            .addFields({ name: '💰 Valor Solicitado', value: `${valor.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '🧾 Taxa Emergencial (15%)', value: `${taxaEmergencia.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '💵 Valor Líquido', value: `${valorLiquido.toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '📉 Penalidades', value: `👎 Aprovação: -${penalidadeAprovacao}%\n` +
                `📈 Inflação: +${(aumentoInflacao * 100).toFixed(2)}%`, inline: true })
            .addFields({ name: '🏛️ Novo Saldo Reserva', value: `${(tesouroNacional - valor).toLocaleString('pt-BR')} moedas`, inline: true })
            .addFields({ name: '⚠️ Aviso', value: 'Operações emergenciais frequentes podem causar crise econômica!', inline: false })
            .setFooter({ text: 'Banco Central • Saque emergencial autorizado' })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // ================= COMANDO INVÁLIDO =================
    return message.channel.send(
        `❌ Comando inválido.\n\n` +
        `📋 **Comandos do Tesouro:**\n` +
        `\`B!tesouro\` - Ver status do tesouro\n` +
        `\`B!tesouro transferir <valor>\` - Transferir reserva para tesouro (taxa 2%)\n` +
        `\`B!tesouro investir <valor>\` - Investir em infraestrutura\n` +
        `\`B!tesouro emergencia <valor>\` - Saque emergencial (taxa 15% + penalidades)`
    );
};