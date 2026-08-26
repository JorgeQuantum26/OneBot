const  Discord = require("discord.js");
const db = require('../systems/firestore');
const idiomaDisponivel = ["english", "português"];

exports.run = async (client, message, args) => {

  let user = message.author;

  let idioma = args[0];
   if(!idioma) return message.channel.send(`Insira um Idioma!`);
  
  if(!idiomaDisponivel.includes(idioma)) return message.channel.send(`<:recusado:1031262539272687777>**|**${user}, O Idioma ${args[0]} não é válido! Infelizmente o meu sistema de idiomas não está completo e  só tem alguns idiomas disponíveis sendo eles:\n\`\`\`${idiomaDisponivel}\`\`\``)

  if(args[0] === "english") {
    const english1 = new Discord.EmbedBuilder()
    .setTitle(`Language Changed`)
    .setColor('Random')
    .setDescription(`<:aceitado:1031262771326759002>**|**${user}, Congratulations! My language has set to English.`) // Parabéns! Meu idioma foi definido como inglês.
  message.channel.send({ embeds: [english1] });

    db.set(`idioma_${message.guild.id}`, {
      idioma: "english"
    })
  } 
  if (args[0] === "português") {
    const portugues = new Discord.EmbedBuilder()
    .setTitle(`Idioma Alterado!`)
    .setColor('Random')
    .setDescription(`<:aceitado:1031262771326759002>**|**${user}, Parabéns! Meu idioma foi alterado para Português!`)

    message.channel.send({ embeds: [portugues] });

    db.set(`idioma_${message.guild.id}`, {
      idioma: "português"
    })
  }
};