const Discord = require('discord.js');
const db = require('../systems/rpg-db');
const { getPaisState } = require('../systems/pais-state');

exports.run = async (client, message, args) => {
    const nomePais = args[0] || db.get(`${message.author.id}.pais`);
    if (!nomePais) return message.channel.send(`❌ Informe o país ou registre-se em um.`);

    const contexto = getPaisState(nomePais);
    if (!contexto) return message.channel.send(`❌ País não encontrado.`);
    const pais = contexto.estado;

    // 💰 SALDOS ATUAIS
    const tesouro = pais.tesouro || 0;
    const tesouroNacional = pais.tesouroNacional || 0;
    const inflacao = ((pais.inflacao || 0.05) * 100).toFixed(2);

    // 📊 ACUMULADOS (desde a fundação)
    const receitaTotal = pais.receita || 0;
    const gastosTotal = pais.gastos || 0;
    const lucroImpostos = pais.lucroImpostos || 0;
    const balanco = receitaTotal - gastosTotal;

    // 💸 GASTOS FIXOS POR CICLO
    const hospitais = Number(pais.construcoes?.hospital?.nivel || pais.construcoes?.hospital || 0);
    const custoHospitais = hospitais * 50000;

    const funcionariosNucleares = pais.funcionarios_nucleares || 0;
    const custoNuclear = Math.floor(funcionariosNucleares * 15000 * (1 + (pais.inflacao || 0.05) * 5));

    const ministerios = pais.ministerios || {};
    const custoMinisterios = Object.values(ministerios).reduce((a, m) => a + (m.orcamento || 0) + (m.funcionarios?.length || 0) * 200, 0);

    const gastosFixos = custoHospitais + custoNuclear + custoMinisterios;

    // ⚡ ENERGIA
    const saldoEnergetico = pais.saldoEnergetico || 0;
    const statusEnergia = saldoEnergetico >= 0 ? '✅ Superávit' : '🔴 Déficit';

    // 👥 CIDADÃOS
    const cidadaos = (pais.cidadaos || []).length;

    const embed = new Discord.EmbedBuilder()
        .setTitle(`💰 Ministério da Fazenda — ${nomePais}`)
        .setColor('#f1c40f')
        .setDescription('Visão geral das finanças nacionais.')
        
        // 💰 SALDOS ATUAIS
        .addFields({ name: '💵 Saldos Atuais', value: `🏦 Tesouro: **${tesouro.toLocaleString('pt-BR')}** moedas\n` +
            `🏛️ Reserva Nacional: **${tesouroNacional.toLocaleString('pt-BR')}** moedas\n` +
            `📊 Inflação: **${inflacao}%**`, inline: false })
        
        // 📊 ACUMULADO (DESDE A FUNDAÇÃO)
        .addFields({ name: '📊 Acumulado (desde a fundação)', value: `📈 Receita total: **+${receitaTotal.toLocaleString('pt-BR')}** moedas\n` +
            `📉 Gastos totais: **-${gastosTotal.toLocaleString('pt-BR')}** moedas\n` +
            `💰 Impostos arrecadados: **${lucroImpostos.toLocaleString('pt-BR')}** moedas\n` +
            `📊 Balanço: **${balanco >= 0 ? '+' : ''}${balanco.toLocaleString('pt-BR')}** moedas`, inline: false })
        
        // 💸 GASTOS POR CICLO
        .addFields({ name: '💸 Gastos Fixos por Ciclo', value: `🏛️ Ministérios: **${custoMinisterios.toLocaleString('pt-BR')}** moedas\n` +
            `🏥 Hospitais: **${custoHospitais.toLocaleString('pt-BR')}** moedas\n` +
            `☢️ Pessoal Nuclear: **${custoNuclear.toLocaleString('pt-BR')}** moedas\n` +
            `📊 Total: **${gastosFixos.toLocaleString('pt-BR')}** moedas/ciclo`, inline: false })
        
        // ⚡ ENERGIA
        .addFields({ name: '⚡ Energia', value: `🔋 Produção: **${(pais.producaoEnergetica || 0).toLocaleString('pt-BR')} MW**\n` +
            `🔌 Consumo: **${(pais.consumoEnergetico || 0).toLocaleString('pt-BR')} MW**\n` +
            `📊 Saldo: **${saldoEnergetico.toLocaleString('pt-BR')} MW**\n` +
            `Status: ${statusEnergia}`, inline: true })
        
        // 👥 POPULAÇÃO
        .addFields({ name: '👥 População', value: `👤 Habitantes: **${(pais.populacao || 0).toLocaleString('pt-BR')}**\n` +
            `👥 Cidadãos: **${cidadaos}** registrados`, inline: true })
        
        .setFooter({ text: 'Ministério da Fazenda • Atualizado a cada ciclo' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};