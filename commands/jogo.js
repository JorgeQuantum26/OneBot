const Discord = require("discord.js");

exports.run = async (client, message, args) => {
 let embed = new Discord.EmbedBuilder()
 .setTitle(`Iniciando`)
 .setDescription(`Vamos inciar o Jogo! Reaja com algum desses emotes, veremos se você errou! Regras do jogo: Caso você perca ou ganhe você tem que reiniciar o jogo! e esperar Mudarmos tudo, Para Reiniciar apenas Novamente Digite B!play`)
 .setColor(Math.floor(Math.random() * 0xffffff))
 
 message.channel.send({ embeds: [embed] }).then(msg => {
      msg.react("↩️")
 msg.react("1️⃣")
 msg.react("2️⃣")
 msg.react("3️⃣")

 let filtro1 = (r, u) => r.emoji.name === '↩1️⃣' && u.id === message.author.id;
 let filtro2 = (r, u) => r.emoji.name === '1️⃣' && u.id === message.author.id;
 let filtro3 = (r, u) => r.emoji.name === '2️⃣' && u.id === message.author.id;
 let filtro4 = (r, u) => r.emoji.name === '3️⃣' && u.id === message.author.id;
 let filtro5 = (r, u) => r.emoji.name === ''

 let coletor = msg.createReactionCollector(filtro1);
 let coletor2 = msg.createReactionCollector(filtro2);
 let coletor3 = msg.createReactionCollector(filtro3);
 let coletor4 = msg.createReactionCollector(filtro4);

 coletor.on("collect", c => {
 let embed = new Discord.EmbedBuilder()
 .setTitle(`Acertou!`)
 .setDescription(`Você acertou!`)
 .setColor(Math.floor(Math.random() * 0xffffff))
 
 msg.edit({ embeds: [embed] })
 })

 coletor2.on("collect", c => {
 let embed = new Discord.EmbedBuilder()
 .setDescription("Errou, Você Errou!")
 .setColor(Math.floor(Math.random() * 0xffffff))

 msg.edit({ embeds: [embed] })
 })

 coletor3.on("collect", c => {
 let embed = new Discord.EmbedBuilder()
 .setTitle(`Errou`)
 .setDescription(`Voce Errou, Voce Perdeu O Jogo! Reinicie ele.`)
 .setColor(Math.floor(Math.random() * 0xffffff))
 
 })
 })
 }
