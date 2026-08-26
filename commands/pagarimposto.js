const Discord = require("discord.js");
const db = require('../systems/rpg-db');

exports.run = async (client, message, args) => {
    const valor = parseInt(args[0]);

    if (isNaN(valor) || valor <= 0) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, use: \`pagarimposto <valor>\``);
    }

    let pais = db.get(`${message.author.id}.pais`);
    if (!pais) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, você precisa registrar um país antes de usar este comando!`);
    }

    let governador = db.get(`pais_${pais}.governador`);
    if (governador === message.author.id) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, você é o Governador do país e está isento de impostos!`);
    }

    let saldo = db.get(`${message.author.id}.saldo`) || 0;
    if (saldo < valor) {
        return message.channel.send(`<:recusado:1031262539272687777>**|** ${message.author}, você não tem saldo suficiente para pagar os impostos!\n\`\`\`Saldo: ${saldo} / Valor: ${valor}\`\`\``);
    }

    db.subtract(`${message.author.id}.saldo`, valor);
    db.add(`pais_${pais}.tesouroNacional`, valor);
    db.add(`${message.author.id}.impostosPagos`, valor);

    let tesouroNacional = db.get(`pais_${pais}.tesouroNacional`) || 0;
    let novoSaldo = (saldo - valor);

    const embed = new Discord.EmbedBuilder()
        .setTitle('🏛️ Impostos Pagos!')
        .setColor(Math.floor(Math.random() * 0xffffff))
        .setDescription(`<:aceitado:1031262771326759002>**|** ${message.author}, você pagou **${valor}** moedas de impostos para o país **${pais}**.`)
        .addFields({ name: 'Valor pago', value: `${valor} moedas`, inline: true })
        .addFields({ name: 'Seu novo saldo', value: `${novoSaldo} moedas`, inline: true })
        .addFields({ name: 'Tesouro Nacional', value: `${tesouroNacional} moedas`, inline: true })
        .setFooter({ text: '© RPG Mundi - OneBot' })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
