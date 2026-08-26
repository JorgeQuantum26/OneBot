const Discord = require("discord.js")

module.exports.run = async(client,message,args)=> {
  message.delete();
  
  if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("<a:X_Icon:806588437049638992>|Você não tem permissão para usar esse comando.")
    let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    let mensagem = args.splice(1).join(' ');

    if(!mensagem ) return msg.reply('<a:X_Icon:806588437049638992>| Você têm que Digitar algo!');
    if(!user) return message.reply("<a:X_Icon:806588437049638992>| Você precisa mencionar um usuario").then(msg => msg.delete({timeout: 5000}))

user.send(`**Email Da Equipe OneBot**!\n\nEmail: ${mensagem}\n\nEmail enviada por: ${message.author.username}`)

message.channel.send(`<a:verificadoVerde_Icon:806590288424468520>|Email Enviado com Sucesso!`)
}