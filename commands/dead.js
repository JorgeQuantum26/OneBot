const { Message } = require("discord.js");

const { EmbedBuilder } = require('discord.js')
module.exports = {
  name: "dead",
  description : 'Marca um jogador como **morto** e silencia-o na chamada de Discord .',
  /**
   * @param {Message} message
   */
  run: async (client, message, args) => {
    const role = message.guild.roles.cache.find((r) => r.name === 'amongus-moderator')
    //--------------------------------------------------------------------------------------------------------
    if (!role) return message.channel.send(`<a:nao:868232161289986128>| Among Us não foi configurado, por favor execute \`B!setup\` para configurar`)
    if (!message.member.roles.cache.has(role.id)) return message.channel.send(new EmbedBuilder()
       .setDescription( `<a:nao:868232161289986128>| Este comando só pode ser usado por membros que tenham Este Cargo ${role}..`).setColor('#e74c3c')
    )
    const target = message.mentions.members.first();

    if (!target) return message.channel.send("<a:nao:868232161289986128>**|** Usuário não encontrado !");

    await target.voice.setMute(true);
    message.channel.send(
      `. 　　　。　　　　•　 　ﾟ　　。 　　.\n\n　　　.　　　 　　.　　　　　。　　 。　. 　\n\n.　　 。　　　ﾟ　　<:cyan:760091234882027520>。 . 　　 • 　　　　•\n\n'　　ﾟ　　           **${target.displayName}** Foi Ejetado　 。　•\n\n　.　　　'　　　。　　ﾟ。　　ﾟ。　　ﾟ。　　ﾟ\n\n　　。　　ﾟ　　　•　　　. 　ﾟ　　　　'　 .`
    )
  },
};