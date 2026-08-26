const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "recruta",
  description: "Recrute Um Civil.",
  run: async (client, message, args) => {

let user1 = message.mentions.users.first() 
    let user = message.author;
 let ban = await db.fetch(`banido_${user}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá bani nemdo(a) `)

      if(!["758473669658935328"].includes(message.author.id)) {
     return message.channel.send(`<a:nao:868232161289986128>|Apenas O Comandante pode Executar Este Comando`)
     }

    if(!user1) return message.channel.send(`<a:nao:868232161289986128>|Mencione um usuário `)
     const patente = "Recruta";

     const alistado = "[CAM] Certificado de Alistamento Militar";
     

     let criminal = await db.fetch(`crime_${user1}`)

    if(criminal >= 1 ) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, ${user1.username} É um criminoso! Por este motivo não é possível recruta-lo\n\nO Exército Brasileiro Não aceitará de nenhum jeito que Criminosos adentrem Nele. `);

  let Civil = await db.fetch(`militar_${user1}`)
    if(Civil >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Não foi possível recrutar ${user1} pois ele já é um Membro do Exército.`)
 
    const embed = new Discord.EmbedBuilder()
    .setColor('Random')
    .setTitle(`Novo Recruta das Forças Armadas!`)
    .setDescription(`Novo Recruta: ${user1}\n\nRecrutado por: ${message.author}\n\n`)
    .setFooter({ text: `© RP OneBot` })
    .setTimestamp();

    message.channel.send({ embeds: [embed] })

    
     db.add(`militar_${user1}`, 1);
    db.set(`cargo_${user1}`, patente);
    db.set(`certificado_${user1}`, alistado);

  }
}