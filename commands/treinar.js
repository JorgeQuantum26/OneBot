const Discord = require("discord.js");
const db = require('../systems/firestore');

module.exports = {

  name: "treinar",
  description: "Treine para aumentar seu Dano!",
  run: async (client, message, args) => {
 
let user = message.author;

    let energia = await db.fetch(`energia_${user.id}`)
if(energia < 15) return message.channel.send(`<a:nao:868232161289986128>|${message.author}, Você tem menos de \`15%\` de Energia! Durma \`B!dormir\` Para recuperar a sua energia!`) 
    

      let treino = await db.fetch(`peso_${user.id}`);
      if(treino < 1) return message.channel.send(`<a:nao:868232161289986128>**|**${message.author}, Você não possuí um **Peso**!. Compre um usando \`B!comprar-peso\`.`)
  let peso = Math.floor(Math.random() * 5) + 20;
const embed = new Discord.EmbedBuilder()
    .setTitle(`Treinamento`)
    .setColor('Random')
    .setDescription(`${message.author}, Você treinou Bastante com **Peso** e Ganhou ${peso} de Força\n\nDe Bônus você ganhou \`20\` de Exp.`)
    .setFooter({ text: `© RPG OneBot` })
    .setTimestamp();

    db.add(`força_${user.id}`, peso)
    db.subtract(`energia_${user.id}`, 20)
    db.add(`exp_${user.id}`, 20)
    message.channel.send({ embeds: [embed] });
  }
}