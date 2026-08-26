const { EmbedBuilder } = require("discord.js");

const db = require('../systems/firestore');


module.exports.run = async (client, message, args) => {
  
  if(message.guild.me.hasPermission("ADMINISTRATOR"))
    return message.channel.send({embed: {
      title: "Erro ao Executar este comando!",
      description: `<a:nao:868232161289986128>| Eu não tenho a permissão de **Administrador** Para executar este comando`,
      color: "RANDOM"
    }})


  if(!message.member.hasPermission("ADMINISTRATOR")) return message.channel.send({embed: {
    description: "**<a:X_Icon:806588437049638992> | Você precisa da permissão de `Administrador` para executar este comando**",
    color: "RANDOM"
  }})
  
  let member = message.mentions.users.first()
  if(!member) return message.channel.send({embed: {
    description: "**<a:X_Icon:806588437049638992>|Você Não mencionou um usuario para remover as warns**",
    color: "RANDOM"
  }})

  let avisos = await db.fetch(`warnsCount_${message.guild.id}-${member.id}`);
  if(avisos < 1) return message.channel.send(`<a:nao:868232161289986128>**|** ${message.author}, O Usuário não possuí Avisos para você retirar!`)

  let warns = await db.get(`warnsCount_${message.guild.id}-${member.id}`)
  
  if(!args[1]) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Dê uma quantia de warns a ser removida**",
    color: "RANDOM"
  }})
  
  if(message.content.includes(" -")) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Você não pode retirar uma quantia negativa de warns**",
    color: "RANDOM"
  }})
  
  if(member.id === message.author.id) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Não podes retirar warns de você mesmo!**",
    color: "RANDOM" 
  }})
  
  
  if(warns < args[1]) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Não podes retirar warns que o usuário não possui**",
    color: "RANDOM"
  }})
  
  const rwarns = new EmbedBuilder()
  .setTitle("<a:VerificadoVerdeIcon:806590288424468520>|Warn removido")
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setFooter({ text: { text: `Warn removido com sucesso`, iconURL: message.author.displayAvatarURL() } })
  .addFields({ name: "Warn Removido de", value: `\`${member.tag}\``, inline: false })
  .addFields({ name: "Removido por", value: `\`${message.author.tag}\``, inline: false })
  .setThumbnail('https://media.discordapp.net/attachments/805073314112077854/818699365689327626/1692_Sirenevermelha.gif?width=80&height=80')
  message.channel.send({ embeds: [rwarns] })
  
  db.subtract(`warnsCount_${message.guild.id}-${member.id}`, args[1])
  
 let channel = message.guild.channels.cache.get(db.get(`cMod_${message.guild.id}`))
if(!channel) {
  return
} else {

const arns = new EmbedBuilder()
  .setTitle("<a:VerificadoVerdeIcon:806590288424468520>|Warn removido")
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setFooter({ text: { text: `Warn removido com sucesso`, iconURL: message.author.displayAvatarURL() } })
  .addFields({ name: "Warn Removido de", value: `\`${member.tag}\``, inline: false })
  .addFields({ name: "Removido por", value: `\`${message.author.tag}\``, inline: false })
  .setThumbnail('https://media.discordapp.net/attachments/805073314112077854/818699365689327626/1692_Sirenevermelha.gif?width=80&height=80')
  channel.send({ embeds: [arns] })

}


}