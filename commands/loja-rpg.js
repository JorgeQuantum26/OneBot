const { EmbedBuilder } = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message) => {
    const banido = Number(await db.fetch(`banido_${message.author.id}`)) || 0;
    if (banido >= 1)
        return message.channel.send(`${message.author}, você não pode usar a loja enquanto estiver banido.`);

    const embed = new EmbedBuilder()
        .setTitle('Loja do RPG')
        .setColor(0x3498db)
        .setDescription(
            `Olá ${message.author}, abaixo estão os itens disponíveis e suas funções.\n\n` +
                'Luva de boxe — 1000 RPG Coins\n`B!comprar-luva`\n\n' +
                'Espada — 1200 RPG Coins\n`B!comprar`\n\n' +
                'Katana — 1200 RPG Coins\n`B!comprar`\n\n' +
                'Escudo — 500 RPG Coins\n`B!comprar`\n\n' +
                'Peso 30kg — 1310 RPG Coins\n`B!comprar-peso30`\n\n' +
                'Peso 50kg — 3310 RPG Coins\n`B!comprar-peso50`\n\n' +
                'VIP — 30.000 RPG Coins\n`B!comprar-vip`'
        )
        .setFooter({ text: '© Loja RPG OneBot' })
        .setTimestamp();

    return message.channel.send({ embeds: [embed] });
};
