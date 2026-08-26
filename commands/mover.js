
const Discord = require("discord.js");
const db = require('../systems/firestore');

exports.run = async (client, message, args) => {

  let user = message.author;
  let partidaAtiva = db.get(`partida_${user.id}`) || false;
  if(partidaAtiva === false) {
    const partidaOff = new Discord.EmbedBuilder() 
    .setTitle(`🎟️| Partida Off`)
    .setColor('#e74c3c')
    .setDescription(`<a:nao:868232161289986128>| Você não iniciou uma partida!`);
    message.channel.send({ embeds: [partidaOff] });
    return;
  }

  const map = {
    "Clock Tower": ["MP40", "M500", "AWM"],
    "Factory": ["AK47", "M4A1", "M1887"],
    "Hangar": ["M60", "M14", "THOMPSON"]
  }

  let location = args.join(" ");
  
  if(!map[location]) {
      const erro = new Discord.EmbedBuilder()
    .setTitle(`❌ | Erro`)
    .setColor('#e74c3c')
    .setDescription(`A Localização ${location} foi fechado do mapa ou não existe!\nCidades Disponíveis: \`Clock Tower\`, \`Factory\`, \`Hangar\``);
    message.channel.send({ embeds: [erro] });

    return;
  }

  db.set(`location_${user.id}`, location);
  message.channel.send(`<a:sim:868232093556166756>| Você mudou a sua localização para ${location}`);
  
}