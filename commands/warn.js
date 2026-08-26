const Discord = require("discord.js");

const db = require('../systems/firestore');


module.exports.run = async (client, message, args) => {

  if(message.guild.me.hasPermission("ADMINISTRATOR"))
    return message.channel.send({embed: {
      description: `<a:nao:868232161289986128>| Eu não tenho a permissão de **Administrador** Para executar este comando`,
      color: "RANDOM"
    }})


  if(!message.member.hasPermission(["MANAGE_ROLES", "ADMINISTRATOR"])) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Você precisa da permissão de `Gerenciar Cargos` para executar este comando**",
    color: "RANDOM"
  }})
  
  let member = message.mentions.users.first() 
  if(!member) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>|**Você deve mencionar um usuário para avisa-lo**",
    color: "RANDOM"
  }})
  
  if(member.id === message.author.id) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>**Não podes dar warn em você mesmo**",
    color: "RANDOM"
  }})

  let motivo = args.slice(1).join(" ")
  if(!motivo) return message.channel.send({embed: {
    description: "<a:X_Icon:806588437049638992>**Você precisa dizer um motivo para avisar o usuario**",
    color: "RANDOM"
  }})

  const aviso = new Discord.EmbedBuilder()
  .setTitle("<a:VerificadoVerdeIcon:806590288424468520>|Usuário avisado")
  .addFields({ name: "Avisado", value: `\`${member.tag}\``, inline: false })
  .addFields({ name: "Avisado por", value: `\`${message.author.tag}\``, inline: false })
  .addFields({ name: "Motivo", value: `\`${motivo}\``, inline: false })
  .setImage("https://media.discordapp.net/attachments/821925249154154498/822070943077367828/image0.gif")
  .setThumbnail('https://media.discordapp.net/attachments/805073314112077854/818699365689327626/1692_Sirenevermelha.gif?width=80&height=80')
  .setFooter({ text: { text: `Warn Executado`, iconURL: message.author.displayAvatarURL() } })
  .setColor(Math.floor(Math.random() * 0xffffff))
  message.channel.send({ embeds: [aviso] })
  
  db.add(`warnsCount_${message.guild.id}-${member.id}`, 1)
  
  let channel = await message.guild.channels.cache.get(db.get(`cMod_${message.guild.id}`))
  if(!channel) {
    return
  } else {
  const embed2 = new Discord.EmbedBuilder()
  .setAuthor({ name: "Membro avisado", iconURL: member.displayAvatarURL() })
  .addFields({ name: "Avisado", value: `\`${member.tag}\``, inline: false })
  .addFields({ name: "Avisado por", value: `\`${message.author.tag}\``, inline: false })
  .addFields({ name: "Motivo", value: `\`${motivo}\``, inline: false })
  .setThumbnail('https://media.discordapp.net/attachments/805073314112077854/818699365689327626/1692_Sirenevermelha.gif?width=80&height=80')
  .setColor(Math.floor(Math.random() * 0xffffff))
  .setTimestamp()
  channel.send({ embeds: [embed2] })
  }
}