const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
 name: "dispensar", 
  description: "Dispense alguém do Exército Brasileiro",
  run: async (client, message, args) =>  {
    let user = message.mentions.users.first();

     let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    const patente = `Reservista`
    const certificados = `[CDI] Certificado De Dispensa de Incorporação`

      if(!user) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Mencione alguém para dispensar!`);

     
  let Civil = await db.fetch(`dispensado_${user.id}`)
    if(Civil >= 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Não foi possível dispensar ${user} pois ele já foi Dispensado!`)

  let com = await db.fetch(`comandant_${user.id}`)
    if(com < 1) return message.channel.send(`<a:nao:868232161289986128>**|**Apenas o Comandante pode Executar Este comando.`)
  
    
    const embed = new Discord.EmbedBuilder() 
   .setColor('#2ecc71')
  .setTitle(`Dispensado`)
  .setDescription(`Nome do Dispensado: ${user.username}\nOficial responsável: ${message.author}`)
  .setFooter({ text: `© RPG OneBot` })
  .setTimestamp()

    
  db.subtract(`militaria_${user.id}`, 1);
  db.add(`dispensado_${user.id}`, 1);
  db.set(`cargo_${user.id}`, patente);
  db.set(`certificado_${user.id}`, certificados)
  message.channel.send({ embeds: [embed] })
  }
}