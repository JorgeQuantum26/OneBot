
const { EmbedBuilder } = require('discord.js')
module.exports = {
    name: 'vote',
    description: '**Invicto** Todos no canal de voz.',
    run: async (client, message, args) => {
        const role = message.guild.roles.cache.find((r) => r.name === 'amongus-moderator')
        //--------------------------------------------------------------------------------------------------------
        if (!role) return message.channel.send(`AmongUs não foi configurado, por favor execute \`B!setup\` para configurá-lo.`)
        if (!message.member.roles.cache.has(role.id)) return message.channel.send(new EmbedBuilder()
            .setDescription(` Este comando só pode ser executado por membros que possuem o Cargo ${role}.`).setColor('#e74c3c')
        )
        let channel = message.member.voice.channel;
        for (let member of channel.members.filter((member) => !member.user.bot)) {
          await member[1].voice.setDeaf(false);
        }
        message.channel.send(
          new EmbedBuilder()
            .setTitle("Sessão de Votos")
            .setTimestamp()
            .setDescription("<:emoji_9:789736698543603722> Quem é o impostor?")
            .setColor(Math.floor(Math.random() * 0xffffff))
            .setFooter({ text: '© OneBot AmongUs - Sistema' })
        );

    }
}