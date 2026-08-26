
const { EmbedBuilder } = require('discord.js')
module.exports = {
    name : 'setup',
    description : '**Configuração** among us comando. (necessario)',
    run : async(client, message, args) => {
        const role = message.guild.roles.cache.find((r) => r.name === 'amongus-moderator')
        //--------------------------------------------------------------------------------------------------------
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send('<a:nao:868232161289986128>**|** Você precisa da permissão ` GERENCIAR_MENSAGENS ` Para utilizar este comando !.')
        if(!message.guild.me.hasPermission('ADMINISTRATOR')) return message.channel.send('<a:nao:868232161289986128> **|** Eu preciso da permissão  ` ADMINISTRADOR ` Para continuar !')
        if(!role) {
         let role = await message.guild.roles.create({
             data: {
              name: 'amongus-moderator'
            }
          })
          message.channel.send(new EmbedBuilder()
            .setTitle('<a:sim:868232093556166756>| AmongUs Configuração concluída')
            .setDescription(`Lista de comandos:\n B!ajuda `)
                            .setColor('#2ecc71')
          )
        } else {
            message.channel.send('<a:nao:868232161289986128>| Cargo AmongUs já foi criado!')
        }
    }
}