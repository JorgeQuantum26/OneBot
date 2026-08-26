const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "setComandante",
  description: "Adicione um novo comandante.",
  run: async (client, message, args) => {

let user = message.mentions.users.first() 
    if(!user) return message.channel.send(`<a:nao:868232161289986128>|Mencione um usuário `)
     const patente = "Comandante";
   const certificados = "[CAM] Certificado de Alistamento Militar";
     if(!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(`<a:nao:868232161289986128>|Apenas meus Desenvolvedores Podem Executar Este Comando`)
     }

    const embed = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`Novo Comandante das Forças Armadas!`)
    .setDescription(`Novo Comandante: ${user}\n\nPromovido por: ${message.author}\n\nDe todo o exército: Boas-vindas, Senhor Comandante!`)
    .setFooter({ text: `© RP OneBot` })
    .setTimestamp();

    message.channel.send({ embeds: [embed] })

    
     db.add(`militaria_${user.id}`, 1);
    db.subtract(`dispensado_${user.id}`, 1)
    db.add(`comandante_${user.id}`, 1);
   db.set(`cargo_${user.id}`, patente)
    db.set(`certificado_${user.id}`, certificados)
  }
}