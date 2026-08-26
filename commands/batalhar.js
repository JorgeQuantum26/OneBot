const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const db = require('../systems/rpg-db');

exports.run = async (client, message) => {
    const userId = message.author.id;
    let vidaUsuario = Number(db.get(`hp_${userId}`)) || 100;
    let vidaInimigo = 20;

    const criarBarra = (valor, maximo) => {
        const preenchido = Math.max(0, Math.min(10, Math.ceil((valor / maximo) * 10)));
        return `${'█'.repeat(preenchido)}${'─'.repeat(10 - preenchido)}`;
    };

    const criarEmbed = (descricao, cor = 0xf1c40f) =>
        new EmbedBuilder()
            .setTitle('🎃 Luta com a Abóbora Gigante')
            .setColor(cor)
            .setDescription(
                `${descricao}\n\n❤️ Sua vida: **${vidaUsuario}**\n🎃 Vida da abóbora: **${vidaInimigo}/20**\n\`${criarBarra(vidaInimigo, 20)}\``
            )
            .setTimestamp();

    const botaoAtacar = new ButtonBuilder()
        .setCustomId(`batalhar:atacar:${userId}`)
        .setLabel('Atacar')
        .setStyle(ButtonStyle.Danger);
    const mensagem = await message.channel.send({
        embeds: [criarEmbed('Você tem certeza de que deseja enfrentar a Temida Abóbora Gigante?')],
        components: [new ActionRowBuilder().addComponents(botaoAtacar)]
    });

    const collector = mensagem.createMessageComponentCollector({
        time: 30000,
        filter: (interaction) => interaction.user.id === userId && interaction.customId === `batalhar:atacar:${userId}`
    });

    collector.on('collect', async (interaction) => {
        const acertou = Math.random() < 0.65;
        let descricao;
        let cor = 0xf1c40f;

        if (acertou) {
            const dano = Math.floor(Math.random() * 7) + 2;
            vidaInimigo = Math.max(0, vidaInimigo - dano);
            descricao = `⚔️ Você causou **${dano}** de dano!`;
        } else {
            const dano = Math.floor(Math.random() * 8) + 5;
            vidaUsuario = Math.max(0, vidaUsuario - dano);
            db.set(`hp_${userId}`, vidaUsuario);
            descricao = `💥 Você errou e sofreu **${dano}** de dano!`;
        }

        if (vidaInimigo === 0) {
            descricao += '\n🏆 Você derrotou a Abóbora Gigante!';
            cor = 0x2ecc71;
            collector.stop('derrotada');
        } else if (vidaUsuario === 0) {
            descricao += '\n☠️ Você foi derrotado.';
            cor = 0xe74c3c;
            collector.stop('derrotado');
        }

        await interaction.update({
            embeds: [criarEmbed(descricao, cor)],
            components: collector.ended ? [] : [new ActionRowBuilder().addComponents(botaoAtacar)]
        });
    });

    collector.on('end', async (_, motivo) => {
        if (motivo === 'derrotada' || motivo === 'derrotado') return;
        await mensagem
            .edit({ embeds: [criarEmbed('⏰ O combate terminou por falta de ação.')], components: [] })
            .catch((error) => console.error('[Batalhar] Falha ao encerrar combate:', error));
    });
};
