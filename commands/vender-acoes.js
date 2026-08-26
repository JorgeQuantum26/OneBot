const Discord = require('discord.js');
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
    let user = message.author;
    const nomeAcao = args[0];
    const quantidade = parseInt(args[1]);

    if (!nomeAcao || isNaN(quantidade) || quantidade <= 0) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, use: \`vender-acoes <nome_da_acao> <quantidade>\``);
    }

    if (!db.get('bolsa_ativa')) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, a bolsa de valores não está ativa no momento.`);
    }

    const acoes = db.get('precos_acoes') || {};
    const precoAcao = acoes[nomeAcao];
    if (!precoAcao) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, ação não encontrada na bolsa de valores.`);
    }

    const quantidadePossuida = db.get(`carteira_${user.id}.${nomeAcao}`) || 0;
    if (quantidade > quantidadePossuida) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, você não possui ações suficientes.\n\`\`\`Possuídas: ${quantidadePossuida} / Solicitadas: ${quantidade}\`\`\``);
    }

    const ganhoTotal = precoAcao * quantidade;

    db.subtract(`carteira_${user.id}.${nomeAcao}`, quantidade);
    if ((db.get(`carteira_${user.id}.${nomeAcao}`) || 0) <= 0) {
        db.delete(`carteira_${user.id}.${nomeAcao}`);
    }
    db.add(`${user.id}.saldo`, ganhoTotal);

    const embed = new Discord.EmbedBuilder()
        .setTitle('📉 Ações Vendidas!')
        .setColor('#2ecc71')
        .setDescription(`<:aceitado:1031262771326759002>**|** ${user}, você vendeu **${quantidade}** ações de **${nomeAcao.replace(/_/g, ' ')}** por **R$ ${ganhoTotal.toFixed(2)}**.`)
        .addFields({ name: 'Preço por ação', value: `R$ ${precoAcao.toFixed(2)}`, inline: true })
        .addFields({ name: 'Quantidade vendida', value: `${quantidade}`, inline: true })
        .addFields({ name: 'Total recebido', value: `R$ ${ganhoTotal.toFixed(2)}`, inline: true })
        .setFooter({ text: '© Bolsa de Valores - OneBot 2024' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
