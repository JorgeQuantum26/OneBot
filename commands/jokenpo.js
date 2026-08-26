const discord = require('discord.js')
module.exports = {
    name: "rps",
    description: "play a game of rock, paper and scissors",
    run: async(client, message, args) => {

 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)
        if(message.guild.me.hasPermissions("ADD_REACTIONS")) return message.channel.send(`<a:nao:868232161289986128>| Eu não tenho a permissão de **Adicionar Reações** Para executar este comando`)
        let embed = new discord.EmbedBuilder()
        .setTitle("Pedra, Papel, Tesoura")
        .setDescription("Reaja para jogar!")
        .setTimestamp()
        let msg = await message.channel.send({ embeds: [embed] })
        await msg.react("⛰️")
        await msg.react("✂")
        await msg.react("📰")

        const filter = (reaction, user) => {
            return ['⛰️', '✂', '📰'].includes(reaction.emoji.name) && user.id === message.author.id;
        }

        const choices = ['⛰️', '✂', '📰']
        const me = choices[Math.floor(Math.random() * choices.length)]
        msg.awaitReactions(filter, {max:1, time: 60000, error: ["time"]}).then(
            async(collected) => {
                const reaction = collected.first()
                let result = new discord.EmbedBuilder()
                .setTitle("Resultado")
                .addFields({ name: "Sua escolha", value: `${reaction.emoji.name}`, inline: false })
                .addFields({ name: "Minha escolha", value: `${me}`, inline: false })
            await msg.edit({ embeds: [result] })
                if ((me === "⛰️" && reaction.emoji.name === "✂") ||
                (me === "📰" && reaction.emoji.name === "⛰️") ||
                (me === "✂" && reaction.emoji.name === "📰")) {
                    message.reply("Você Perdeu!");
            } else if (me === reaction.emoji.name) {
                return message.reply("Empatou!");
            } else {
                return message.reply("Você Ganhou!");
            }
        })
        .catch(collected => {
                message.reply('<a:X_Icon:806588437049638992>|O comando foi cancelado porque você não respondeu a tempo!');
            })
}
}