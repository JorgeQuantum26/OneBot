const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {
  name: "dormir",
  description: "Use este comando pata dormir e recuperar sua energias.", 
  run: async (bot, message, args) => {

    let user = message.author;

 let ban = await db.fetch(`banido_${user.id}`);
  if(ban >= 1) return message.channel.send(`${message.author}, Você foi banido! ¯\_(ツ)_/¯\n\nVocê está na minha Blacklist e não pode usar meus comandos, Será que é tão difícil assim seguir as regras?\n\nCaso você ache que seu banimento foi injusto (Concerteza não foi), você pode entrar em Contato com a Equipe Do OneBot\n\nAo entrar em contato conosco, aguarde que logo iremos resolver seu problema, caso você tenha sido banido(a) injustamente iremos resolver, caso contrário você permanecerá banido(a) `)

    
    let energia = await db.fetch(`energia_${user.id}`)
    if(energia >= 100) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Você ja possui mais de \`100%\` de sua Energia! E por este motivo não precisa dormir.`);

     
    const embed = new Discord.EmbedBuilder()
    .setTitle(`🛌 **Dormir** 🛌`)
    .setColor('Random')
    .setDescription(`${message.author} Você dormiu e recuperou **50%** de Sua Energia.`)
.setFooter({ text: `© RPG OneBot` })
    .setTimestamp();

    db.add(`energia_${user.id}`, 50)
    message.channel.send({ embeds: [embed] });
  }
}