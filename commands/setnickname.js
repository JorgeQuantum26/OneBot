const Discord = require("discord.js");

exports.run = async (client, message, args) => {
  
  
  if (!message.member.hasPermission(["MANAGE_GUILD", "ADMINISTRATOR"])) {
    return message.channel.send({embed: {color: "RED", description: "<a:X_Icon:806588437049638992>|Você não tem permissão para Utilizar este comando!"}})
  }
  
  let user = message.mentions.users.first(); 
  if (!user) return message.channel.send({embed: {color: "RED", description: "<a:X_Icon:806588437049638992>|Mencione um Usuário!"}});
  
  let nick = args.slice(1).join(" ");
  if (!nick) return message.channel.send({embed: {color: "RED", description: "<a:X_Icon:806588437049638992>|Você precisa inserir um nome!"}});
  
  let member = message.guild.members.cache.get(user.id);
  
  await member.setNickname(nick).catch(err => message.channel.send({embed: {color: "RED", description: `Error: ${err}`}}));
  return message.channel.send({embed: {color: "GREEN", description: `<a:VerificadoVerdeIcon:806590288424468520>|Alterado com sucesso! Nome antigo: **${user.tag}** Nome Alterado para **${nick}**`}});
}

exports.help = {
  name: "setnickname",
  description: "Defina um apelido de usuário.",
  usage: "B!setnickname <@user> <nick>",
  example: "B!setnickname Jorge#1222 jorge353",
  
}

exports.conf = {
  aliases: ["setnick"],
  cooldown: 5
}
{}