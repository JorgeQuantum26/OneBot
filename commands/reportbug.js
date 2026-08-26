const Discord = require("discord.js")

module.exports.run = async (client, message, args) => {
  let bl = await db.fetch(`blacklisted_${user.id}`) 
  if(msg.member.id = bl) return msg.channel.send("**Você foi banido!**\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?")
let canal = client.channels.cache.get("861019581514252298")
let bug = args.join(' ');
if(!bug) {
return message.channel.send({embed: {
description: "<a:X_Icon:806588437049638992>|Descreva o bug que foi encontrado!",
color: "RED"
}
});
}
let embed = new Discord.EmbedBuilder()
.setTitle("📢|Novo Bug reportado")
.setThumbnail(client.user.displayAvatarURL())
.addFields({ name: "Servidor que reportou o bug", value: `${message.guild.name}`, inline: false })
.addFields({ name: "Bug reportado por", value: `${message.author.tag}`, inline: false })
.addFields({ name: "Menção", value: `${message.author}`, inline: false })
.addFields({ name: "ID do autor do report", value: `${message.author.id}`, inline: false })
.addFields({ name: "Bug encontrado:", value: `\`${bug}\``, inline: false })
.setColor([255,182,193])
canal.send({ embeds: [embed] })

message.channel.send({embed: {
description: "<a:VerificadoVerdeIcon:806590288424468520>|Seu bug foi  enviado para meus Desenvolvedores, muito obrigado por reportar o bug!",
color: "RED"
}
});
}