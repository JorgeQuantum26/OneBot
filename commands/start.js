
const { EmbedBuilder } = require('discord.js')
const db = require('../systems/firestore');
module.exports = {
    name: 'start',
    description: 'O comando é usado quando o jogo **inicia** e ensurdece os usuários na chamada.O comando é usado quando o jogo **inicia** e ensurdece os usuários na chamada.',
    run: async (client, message, args) => {
        const role = message.guild.roles.cache.find((r) => r.name === 'amongus-moderator')
        //--------------------------------------------------------------------------------------------------------
     let user =  message.member.users.first() || client.users.cache.get(args[0]) || message.author;
        if (!role) return message.channel.send(`<a:nao:868232161289986128>| Among Us não foi configurado, por favor execute \`B!setup\` para configurar`)
        if (!message.member.roles.cache.has(role.id)) return message.channel.send(new EmbedBuilder()
            .setDescription(`<a:nao:868232161289986128>| Este comando só pode ser usado por membros que tenham Este Cargo ${role}.`).setColor('#e74c3c')
        )
      let channel = message.member.voice.channel;
        for (let member of channel.members.filter((member) => !member.user.bot)) {
            await member[1].voice.setDeaf(true);
          }
        message.channel.send(
            new EmbedBuilder()
                .setTitle("O Jogo Iniciou!")
                .setDescription(
                    "<a:sim:868232093556166756>| Todos os usuários no canal de voz ficaram surdos, ninguém pode ouvir ninguém.\nJogue com inteligência :)))))))."
                )
                .setColor('#2ecc71')
                .setThumbnail("https://i.imgur.com/vKF42bH.png")
                .setFooter({ text: "© OneBot Among Us - Sistema" })
                .setTimestamp()
        );

      var Impostor = [`${channel}`]
      
var rand = Impostor[Math.floor(Math.random() * Impostor.length)];

      db.add(`impostor_${user.id}`, Impostor);
 
db.fetch(`impostor_${user.id}`)

    if(impostor > 1) return;
user.send(`Você é o impostor!`)
    
    }
}