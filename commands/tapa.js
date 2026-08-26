const Discord = require("discord.js");

exports.run = async(client, message, args) => {
  var list = [
    'https://i.imgur.com/fm49srQ.gif',
    'https://i.imgur.com/4MQkDKm.gif',
    'https://i.imgur.com/o2SJYUS.gif',
    'https://i.imgur.com/Agwwaj6.gif'
  ];

  var rand = list[Math.floor(Math.random() * list.length)];
  let pessoa = message.mentions.users.first() || client.users.cache.get(args[0]);
  
  if (!pessoa) return message.channel.send(`<a:X_Icon:806588437049638992>| ${message.author} Mencione um Usuário para dar um tapa!`);

  let ferinha = new Discord.EmbedBuilder()
  .setTitle(`🖐️|Tapa `)
  .setDescription(`🙀| ${message.author} deu um tapa em ${pessoa}!`)
  .setImage(rand)
  .setTimestamp()
  .setColor('#f1c40f')
  .setThumbnail(message.author.displayAvatarURL({format:"png"}))
  .setFooter({ text: { text: `Comando Executado por: ${message.author.username}`, iconURL: message.author.displayAvatarURL({format:"png"}) } });

  message.channel.send({ embeds: [ferinha] })
}