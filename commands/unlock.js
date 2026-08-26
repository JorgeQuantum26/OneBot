const Discord = require("discord.js");
 
exports.run = async (client, message, args) => {
 
  let motivo = args.slice(" ").join(" ")
  if(!motivo) motivo = "Motivo não Informado"
      let avatar = message.author.avatarURL({ dynamic: true, format: "gif", size: 1024 });
            if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        const embed = new Discord.EmbedBuilder()
        .setDescription(`<a:X_Icon:806588437049638992>|${message.author}, Você não tem permissão para usar este comando.`)
        return message.channel.send({ embeds: [embed] });
      }
    message.delete();
    message.channel.createOverwrite(message.guild.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true
    })
    const embed = new Discord.EmbedBuilder()
    .setTitle('CHAT DESTRANCADO')
    .setDescription(`🔓|Este chat foi destrancado com sucesso.`)
    .addFields({ name: 'Trancar:', value: '(B!lock)', inline: true })
    .addFields({ name: 'Destrancado por:', value: `${message.author}`, inline: true })
    .addFields({ name: 'Motivo:', value: motivo, inline: false })
    .setTimestamp()
    .setThumbnail(avatar)
    .setColor('#6400b6')
    message.channel.send({ embeds: [embed] });
    
}