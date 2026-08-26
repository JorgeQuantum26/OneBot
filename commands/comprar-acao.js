const Discord = require('discord.js');
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {
    let user = message.author;
    const nomeAcao = args[0];
    const quantidade = parseInt(args[1]);

    if (!nomeAcao || isNaN(quantidade) || quantidade <= 0) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, use: \`comprar-acao <nome_da_acao> <quantidade>\``);
    }

    if (!db.get('bolsa_ativa')) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, a bolsa de valores não está ativa no momento.`);
    }

    const acoes = db.get('precos_acoes') || {};
    const precoAcao = acoes[nomeAcao];
    if (!precoAcao) {
        const nomesDisponiveis = Object.keys(acoes).join('\n') || 'Nenhuma ação disponível';
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, ação não encontrada na bolsa de valores.\n\n**Ações disponíveis:**\n\`\`\`${nomesDisponiveis}\`\`\``);
    }

    const custoTotal = precoAcao * quantidade;
    const saldoUsuario = db.get(`${user.id}.saldo`) || 0;

    if (saldoUsuario < custoTotal) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${user}, você não tem saldo suficiente.\n\`\`\`Saldo: R$${saldoUsuario.toFixed(2)} / Custo: R$${custoTotal.toFixed(2)}\`\`\``);
    }

    db.subtract(`${user.id}.saldo`, custoTotal);
    db.add(`carteira_${user.id}.${nomeAcao}`, quantidade);

    const embed = new Discord.EmbedBuilder()
        .setTitle('📈 Ação Comprada!')
        .setColor('#2ecc71')
        .setDescription(`<:aceitado:1031262771326759002>**|** ${user}, você comprou **${quantidade}** ações de **${nomeAcao.replace(/_/g, ' ')}** por **R$ ${custoTotal.toFixed(2)}**.`)
        .addFields({ name: 'Preço por ação', value: `R$ ${precoAcao.toFixed(2)}`, inline: true })
        .addFields({ name: 'Quantidade', value: `${quantidade}`, inline: true })
        .addFields({ name: 'Total gasto', value: `R$ ${custoTotal.toFixed(2)}`, inline: true })
        .setFooter({ text: '© Bolsa de Valores - OneBot 2024' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
    console.log(`${user.tag} comprou ${quantidade} ações de ${nomeAcao} por R$${custoTotal.toFixed(2)}.`);
};
