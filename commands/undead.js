const { prefix } = require('./config.json')
const { EmbedBuilder } = require('discord.js')
module.exports = {
    name: 'B!revive',
    description: 'Usado para fazer um jogador **Vivo**.',
    run: async (client, message, args) => {
        const role = message.guild.roles.cache.find((r) => r.name === 'amongus-moderator')
        //--------------------------------------------------------------------------------------------------------
        if (!role) return message.channel.send(`AmongUs não foi configurado, por favor execute \`${prefix}setup\` para configurá-lo.`)
        if (!message.member.roles.cache.has(role.id)) return message.channel.send(new EmbedBuilder()
            .setDescription(`Este comando so pode ser utilizado por quem tem o cargo ${role}.`).setColor('#e74c3c')
        )
        let channel = message.member.voice.channel;
        for (let member of channel.members.filter((member) => !member.user.bot)) {
            await member[1].voice.setDeaf(false).then(member[1].voice.setMute(false));
        }
        message.channel.send('Redefinição concluída')
        message.react("760091234882027520");

    }
}